/**
 * Pure option-parsing helpers for route-backed commands.
 *
 * Extracted from `index.ts` (which has import-time side effects) so the three
 * subtle behaviours can be unit-tested in isolation:
 *   - the nullable `"null"` sentinel (JSON `null` vs the literal string),
 *   - `parseOptionValue` failures surfacing as `UsageError` (exit 4) naming the
 *     offending flag,
 *   - the `--execute` gate on destructive commands.
 */
import type { OptionDef } from "../cli-spec";
import { UsageError } from "./errors";

export function parseOptionValue(
  raw: unknown,
  type: "string" | "number" | "boolean" | "json"
): unknown {
  if (raw === undefined) return undefined;
  switch (type) {
    case "boolean":
      // `true` = bare presence flag (CLI-only extraOptions like `--wait`);
      // schema-derived booleans take an explicit value so `false` is sendable.
      if (raw === true || raw === "true") return true;
      if (raw === "false") return false;
      throw new Error(`Expected true or false, got ${JSON.stringify(raw)}`);
    case "number": {
      if (typeof raw === "number") return raw;
      // Number("") / Number("  ") === 0 and Number("1e999") === Infinity
      // (which JSON-serializes as null) — reject both, not just NaN.
      const trimmed = String(raw).trim();
      const n = Number(trimmed);
      if (trimmed === "" || !Number.isFinite(n)) {
        throw new Error(`Expected a number, got ${JSON.stringify(raw)}`);
      }
      return n;
    }
    case "json":
      if (typeof raw !== "string") return raw;
      try {
        return JSON.parse(raw);
      } catch {
        throw new Error(`Expected JSON, got ${JSON.stringify(raw)}`);
      }
    default:
      return raw;
  }
}

export function optionKeyFromFlag(flag: string): string {
  const m = flag.match(/--(\S+?)(?:\s+<[^>]+>)?(?:\s|$)/);
  if (!m) throw new Error(`Cannot parse flag: ${flag}`);
  let name = m[1];
  if (name.startsWith("no-")) name = name.slice(3);
  // Commander camelCases each dash-segment but keeps dots, so "--filter.client-type"
  // is stored under "filter.clientType". The regex never crosses a dot, so dotted
  // paths survive without splitting on them.
  return name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export interface ParsedFlags {
  /** Values sent to the API, keyed by dot-path field key. */
  flags: Record<string, unknown>;
  /** CLI-only values surfaced to runtime hooks, never sent to the API. */
  locals: Record<string, unknown>;
}

/**
 * Parse raw Commander option values into typed flag/local maps.
 *
 * A nullable flag given the literal `"null"` becomes JSON `null` (the sentinel);
 * every other value goes through `parseOptionValue`, whose failures are
 * re-thrown as `UsageError` (exit 4) naming the flag.
 */
export function parseFlags(
  options: readonly OptionDef[],
  rawOptions: Record<string, unknown>
): ParsedFlags {
  const flags: Record<string, unknown> = {};
  const locals: Record<string, unknown> = {};
  for (const opt of options) {
    // Commander keeps dots in attribute names: "--transaction.uuid" is stored
    // under "transaction.uuid" (camelCased per dash-segment only).
    const raw = rawOptions[optionKeyFromFlag(opt.flag)];
    if (raw === undefined) continue;
    let parsed: unknown;
    if (opt.nullable && raw === "null") {
      parsed = null;
    } else {
      try {
        parsed = parseOptionValue(raw, opt.type);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new UsageError(`${opt.flag}: ${msg}`);
      }
    }
    if (opt.local) locals[opt.key] = parsed;
    else flags[opt.key] = parsed;
  }
  return { flags, locals };
}

/**
 * Whether a destructive command must refuse to run: it is marked destructive,
 * the user did not pass `--execute`, and the `CRYPTACT_CLI_NO_CONFIRM=1` bypass
 * is not set.
 */
export function shouldRefuseDestructive(
  cmdDef: { destructive?: boolean },
  rawOptions: Record<string, unknown>,
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return (
    cmdDef.destructive === true &&
    rawOptions.execute !== true &&
    env.CRYPTACT_CLI_NO_CONFIRM !== "1"
  );
}
