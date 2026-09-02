/**
 * Generic HTTP dispatcher for route-backed CLI commands.
 *
 * Spec-driven: takes a `CommandDef` from `cli-spec.ts` (which embeds the full
 * URL path and HTTP method) and the user's args/flags, then issues the API
 * request. No schema library — the spec is the contract.
 *
 *   1. Assemble a request body from positional args + flags (dot-path /
 *      JSON-typed flags supported), injecting `ledgerId` when needed.
 *   2. Substitute `:param(...)?` placeholders in the path from the body.
 *   3. Call the authenticated api-client (GET sends no body; POST/PUT/DELETE
 *      send the assembled body — path-param fields stay in the body so the
 *      server-side handler can consume them as named keys, matching the
 *      previous schema-validated behaviour).
 *
 * Per-command `call` hooks in `runtime-hooks.ts` replace this entire function
 * for routes that need custom transport (multipart, polling).
 */
import type { CommandDef } from "../cli-spec";
import { apiDelete, apiGet, apiPost, apiPut } from "./api-client";
import { getUserInfo, resolveEnterpriseContext } from "./resolve-enterprise";
import { ownUserguid } from "./token-store";

export interface DispatchInput {
  cmdDef: CommandDef;
  /** Positional arguments keyed by path-param name. */
  args: Record<string, string>;
  /** Flag values keyed by dot-path field key (e.g. "reportingCcy", "ledger.reportingCcy"). */
  flags: Record<string, unknown>;
  /** Resolved ledgerId injected when the route requires it. */
  ledgerId?: string;
}

/** Merge flag values into `body`: dot-paths deep-set, `@body` merges at the root. */
function applyFlags(body: Record<string, unknown>, flags: Record<string, unknown>): void {
  for (const [dotPath, value] of Object.entries(flags)) {
    if (value === undefined) continue;
    // `@body` (union request schemas): the value IS the payload — merge at root.
    if (dotPath === "@body") {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        deepMerge(body, value as Record<string, unknown>);
      }
      continue;
    }
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const existing: Record<string, unknown> = {};
      setPath(existing, dotPath, value);
      deepMerge(body, existing);
    } else {
      setPath(body, dotPath, value);
    }
  }
}

/** Deep-set `obj[a.b.c] = value` */
function setPath(obj: Record<string, unknown>, dotPath: string, value: unknown): void {
  const parts = dotPath.split(".");
  let cursor: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (typeof cursor[key] !== "object" || cursor[key] === null) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

/** Deep-merge `source` into `target`; scalar/array values in source overwrite target. */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  for (const [key, value] of Object.entries(source)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof target[key] === "object" &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      target[key] = value;
    }
  }
  return target;
}

/**
 * Assemble the request body from positional args + flag values.
 *
 * - `flags[key]` with a dot-path key sets that deep field.
 * - `args` are shallow path params (e.g. `uuid`, `fileId`); also written into
 *   the body so server-side handlers receive them as named fields.
 * - `ledgerId` is injected at top level.
 */
export function buildRequestBody(input: DispatchInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.ledgerId !== undefined) {
    setPath(body, input.cmdDef.ledgerIdPath ?? "ledgerId", input.ledgerId);
    // `resolvePath` is shallow, so a `:ledgerId` placeholder needs the top-level
    // key even when the schema wants it nested. The API validator strips it.
    if (input.cmdDef.ledgerIdPath && pathParamNames(input.cmdDef.path).has("ledgerId")) {
      body.ledgerId ??= input.ledgerId;
    }
  }

  for (const [name, value] of Object.entries(input.args)) {
    body[name] = value;
    // URL-only `:param` whose value the schema also wants in a nested field.
    const bodyPath = (input.cmdDef.arguments ?? []).find(
      a => (a.paramName ?? a.name) === name
    )?.bodyPath;
    if (bodyPath) setPath(body, bodyPath, value);
  }

  applyFlags(body, input.flags);

  applySchemaDefaults(input.cmdDef, body);

  return body;
}

/** Read `obj[a.b.c]`, or undefined when any segment is missing. */
function getPath(obj: Record<string, unknown>, dotPath: string): unknown {
  let cursor: unknown = obj;
  for (const part of dotPath.split(".")) {
    if (cursor === null || typeof cursor !== "object") return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor;
}

/**
 * Fill schema-required keys the user left unset.
 *
 * The API treats an absent key and an explicit `null`/`[]` differently, so a
 * required-but-nullable field rejects `{}` — hence `cryptact ledger search`
 * with no flags 400s unless `filter.orgId`/`filter.userguid` are sent as
 * `null`. The generator marks exactly those keys (`sendNull`/`ensureObject`/
 * `ensureArray`) on query routes, where an unconstrained default is harmless.
 * Objects are filled before their children so `setPath` doesn't clobber them.
 */
function applySchemaDefaults(cmdDef: CommandDef, body: Record<string, unknown>): void {
  const options = cmdDef.options ?? [];
  for (const opt of options) {
    if (!opt.ensureObject) continue;
    if (getPath(body, opt.key) === undefined) setPath(body, opt.key, {});
  }
  for (const opt of options) {
    if (getPath(body, opt.key) !== undefined) continue;
    if (opt.sendNull) setPath(body, opt.key, null);
    else if (opt.ensureArray) setPath(body, opt.key, []);
  }
}

const PATH_PARAM = /:([a-zA-Z_][a-zA-Z0-9_]*)(\([^)]+\))?/g;

/** Substitute `:name` (and `:name(regex)`) placeholders in the path from body fields. */
function resolvePath(path: string, body: Record<string, unknown>): string {
  return path.replace(PATH_PARAM, (match, name: string) => {
    const value = body[name];
    return value === undefined ? match : encodeURIComponent(String(value));
  });
}

function pathParamNames(path: string): Set<string> {
  const names = new Set<string>();
  for (const m of path.matchAll(PATH_PARAM)) names.add(m[1]);
  return names;
}

/**
 * GET requests carry no body: every assembled field that wasn't consumed by a
 * path placeholder goes into the query string (objects/arrays JSON-encoded).
 */
function toQueryString(body: Record<string, unknown>, consumed: Set<string>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) {
    if (consumed.has(key) || value === undefined || value === null) continue;
    // Arrays → repeated keys (`?k=1&k=2`), matching mcp-server's buildQueryString
    // so Express `qs` decodes them back into an array server-side.
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item));
    } else if (typeof value === "object") {
      params.append(key, JSON.stringify(value));
    } else {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function callApi(method: string, url: string, body: unknown): Promise<unknown> {
  switch (method) {
    case "GET":
      return apiGet(url);
    case "POST":
      return apiPost(url, body);
    case "PUT":
      return apiPut(url, body);
    case "DELETE":
      return apiDelete(url, body);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

/**
 * Default a search filter's `userguid` to the caller's own.
 *
 * Non-admins may only search their own records — the backend rejects anything
 * else (`ledger/controller.ts` searchRoute), so the bare command is unusable
 * without pasting your own guid. Admins are left alone: for them a null
 * userguid means "all users", which is the useful default.
 */
async function applyOwnUserguid(cmdDef: CommandDef, body: Record<string, unknown>): Promise<void> {
  if (cmdDef.type !== "query") return;
  const keys = (cmdDef.options ?? [])
    .filter(o => o.key === "userguid" || o.key.endsWith(".userguid"))
    .map(o => o.key)
    .filter(k => getPath(body, k) == null);
  if (keys.length === 0) return;

  const self = ownUserguid();
  if (!self) return;
  if ((await getUserInfo()).role === "Admin") return;
  for (const key of keys) setPath(body, key, self);
}

/**
 * Fill the caller's own orgId into the fields the spec marks
 * `fillOwnOrg`. Only those: on an admin search an absent `filter.orgId` means
 * "every org", so this cannot key off the field name the way `userguid` does.
 * `resolveEnterpriseContext()` throws for any role that is not exactly
 * Enterprise, and the backend lets an Admin name another org
 * (customer/router.ts:132, customer/controller.ts:33), so non-Enterprise
 * callers are left to pass it explicitly.
 */
async function applyOwnOrgId(cmdDef: CommandDef, body: Record<string, unknown>): Promise<void> {
  const keys = (cmdDef.options ?? [])
    .filter(o => o.fillOwnOrg)
    .map(o => o.key)
    .filter(k => getPath(body, k) == null);
  if (keys.length === 0) return;
  if ((await getUserInfo()).role !== "Enterprise") return;
  const { orgId } = await resolveEnterpriseContext();
  for (const key of keys) setPath(body, key, orgId);
}

export async function dispatch(input: DispatchInput): Promise<unknown> {
  const body = buildRequestBody(input);
  await applyOwnUserguid(input.cmdDef, body);
  await applyOwnOrgId(input.cmdDef, body);
  const method = input.cmdDef.method;
  let url = resolvePath(input.cmdDef.path, body);
  if (method === "GET") {
    url += toQueryString(body, pathParamNames(input.cmdDef.path));
    return callApi(method, url, undefined);
  }
  return callApi(method, url, body);
}
