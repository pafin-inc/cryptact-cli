/**
 * Schema-free response formatter.
 *
 * Input is whatever JSON the API returned. Detects shape (scalar / array /
 * object / array-of-objects / paged envelope) and renders accordingly.
 * Column ordering for tables follows the response's own key order, which
 * matches what the API serialises and is good enough in practice.
 */
import type { Command } from "commander";
import { c } from "./colors";
import {
  fmt,
  getOutputFormat,
  printCsv,
  printJson,
  printKeyValue,
  printTable,
  sectionTitle
} from "./output";

const MAX_TABLE_COLUMNS = 8;

function isDateLikeField(name: string): boolean {
  return /(At|Timestamp|Date|Time)$/i.test(name) || /^(ts|created|updated|deleted)$/i.test(name);
}

function isIdLikeField(name: string): boolean {
  return /(^id$|Id$|Guid$|^uuid$|Uuid$|^hash$|Hash$)/i.test(name);
}

// Routes mix epoch units: ledger/defi send milliseconds, Stripe-backed billing and
// exchange metadata send seconds. `new Date(n)` reads a bare number as ms, so scale
// the seconds range up. 1e11 splits them safely — as ms that is 1973, as seconds 5138.
const EPOCH_SECONDS_MAX = 1e11;

function epochToMs(value: number): number {
  return value < EPOCH_SECONDS_MAX ? value * 1000 : value;
}

function isStateLikeField(name: string): boolean {
  return /(^|[a-z])(state|status)$/i.test(name);
}

const NUMERIC_STRING_REGEX = /^-?\d+(\.\d+)?$/;

// Numbers render by field kind: plain (years, last4, codes — no grouping),
// financial (sign-colored + grouped), or grouped-uncolored for everything else.
const PLAIN_NUMBER_WORDS = new Set([
  "year",
  "month",
  "day",
  "week",
  "last4",
  "code",
  "order",
  "version",
  "port",
  "page",
  "offset",
  "index",
  "places"
]);
const FINANCIAL_WORDS = new Set([
  "pl",
  "pnl",
  "profit",
  "loss",
  "gain",
  "revenue",
  "cost",
  "price",
  "prc",
  "fee",
  "amount",
  "balance",
  "vol",
  "volume",
  "position",
  "total",
  "cb",
  "wct",
  "irc",
  "pat",
  "pct",
  "percent"
]);

function fieldWords(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+| /)
    .map(w => w.toLowerCase())
    .filter(Boolean);
}

function formatNumeric(value: number | string, fieldName: string): string {
  const words = fieldWords(fieldName);
  if (words.some(w => PLAIN_NUMBER_WORDS.has(w))) return String(value);
  if (words.some(w => FINANCIAL_WORDS.has(w))) return fmt.value(value);
  return fmt.number(value);
}

function formatScalar(value: unknown, fieldName: string): string {
  if (value === null || value === undefined) return c.dim("-");
  if (typeof value === "boolean") return fmt.bool(value);
  if (typeof value === "number") {
    if (isDateLikeField(fieldName) && value > 1e9 && value < 1e14) {
      return fmt.datetime(epochToMs(value), "datetime");
    }
    if (isIdLikeField(fieldName)) return String(value);
    return formatNumeric(value, fieldName);
  }
  if (value instanceof Date) return fmt.datetime(value, "datetime");
  if (typeof value === "string") {
    if (isDateLikeField(fieldName) && !Number.isNaN(Date.parse(value))) {
      return fmt.datetime(value, "datetime");
    }
    if (isIdLikeField(fieldName)) return fmt.id(value);
    if (isStateLikeField(fieldName)) return fmt.state(value);
    if (/^(act|action)$/i.test(fieldName)) return fmt.action(value);
    if (/pair$/i.test(fieldName)) return fmt.pair(value);
    if (NUMERIC_STRING_REGEX.test(value)) return formatNumeric(value, fieldName);
    return value;
  }
  return JSON.stringify(value);
}

function stringifyForTable(value: unknown, fieldName: string): string {
  if (value === null || value === undefined) return c.dim("-");
  if (Array.isArray(value)) return `[${value.length}]`;
  if (typeof value === "object") return c.dim("{…}");
  return formatScalar(value, fieldName);
}

/** Pick up to MAX_TABLE_COLUMNS scalar columns, IDs first, datetimes last. */
function selectColumns(sampleRow: Record<string, unknown>): string[] {
  const scalars = Object.keys(sampleRow).filter(k => {
    const v = sampleRow[k];
    return v === null || v === undefined || typeof v !== "object" || v instanceof Date;
  });

  // IDs first, group totals (e.g. "pl.total") next, datetimes last.
  const ranked = [...scalars].sort((a, b) => {
    const rank = (k: string) =>
      isIdLikeField(k) ? -2 : /\.total$/i.test(k) ? -1 : isDateLikeField(k) ? 2 : 0;
    return rank(a) - rank(b);
  });

  return ranked.slice(0, MAX_TABLE_COLUMNS);
}

/** Column label for a possibly dotted key; drops a parent prefix the leaf
 *  already repeats ("instrument.instrumentId" → "Instrument ID"). */
function columnLabel(key: string): string {
  const [parent, leaf] = key.includes(".") ? key.split(".", 2) : [undefined, key];
  if (parent && leaf.toLowerCase().includes(parent.toLowerCase())) return titleCase(leaf);
  return titleCase(key);
}

// ─── Recursive human rendering ───────────────────────────────────────────────
// Objects become key/value blocks with nested structures as indented, headed
// sections; arrays become tables when their rows are mostly scalar and
// per-element sections when they are mostly structure.

const MAX_DEPTH = 4;
// Flat layout: nesting is conveyed by section headings, not indentation
const INDENT = "";
const INLINE_ARRAY_MAX_CHARS = 100;

const ACRONYMS = new Set(["pl", "id", "ts", "url", "api", "fx", "guid", "uuid", "ltd"]);

/** "byYearInstrument" → "By Year Instrument", "pl.total" → "PL Total" */
function titleCase(key: string): string {
  return key
    .replace(/[-_.]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(" ")
    .map(word =>
      ACRONYMS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ")
    .trim();
}

function isScalar(v: unknown): boolean {
  return v === null || v === undefined || typeof v !== "object" || v instanceof Date;
}

function inlineScalarArray(arr: unknown[], fieldName: string): string {
  if (arr.length === 0) return c.dim("(none)");
  const joined = arr.map(v => formatScalar(v, fieldName)).join(", ");
  if (joined.length <= INLINE_ARRAY_MAX_CHARS) return joined;
  return `${arr
    .slice(0, 3)
    .map(v => formatScalar(v, fieldName))
    .join(", ")}, ${c.dim(`… (+${arr.length - 3} more)`)}`;
}

/** Rows with mostly scalar fields render as a table; rows that are mostly
 *  nested structure (e.g. yearly summary groups) render as sections. */
function isTabular(rows: unknown[]): boolean {
  const sample = rows.find(r => r !== null && typeof r === "object" && !Array.isArray(r));
  if (!sample) return false;
  const values = Object.values(sample as Record<string, unknown>);
  const scalarCount = values.filter(isScalar).length;
  return scalarCount > values.length - scalarCount;
}

/** Section title for an array element: its most identifying scalar field.
 *  Returns the label plus the key it came from so the body can omit it. */
function elementLabel(row: Record<string, unknown>, index: number): [string, string | undefined] {
  if (typeof row.fiscalYear === "number" || typeof row.fiscalYear === "string") {
    return [`FY ${row.fiscalYear}`, "fiscalYear"];
  }
  for (const key of ["name", "title", "summaryType", "id", "type"]) {
    const v = row[key];
    if (typeof v === "string" || typeof v === "number") return [String(v), key];
  }
  return [`#${index + 1}`, undefined];
}

function printHeading(label: string, level: number): void {
  console.log("");
  console.log(`${INDENT.repeat(level)}${sectionTitle(label)}`);
  console.log("");
}

function printNode(value: unknown, level: number, depth: number): void {
  if (Array.isArray(value)) printArrayDeep(value, level, depth);
  else printObjectDeep(value as Record<string, unknown>, level, depth);
}

function printObjectDeep(obj: Record<string, unknown>, level: number, depth: number): void {
  const prefix = INDENT.repeat(level);
  if (depth >= MAX_DEPTH) {
    // Small flat leaves still render as key/values; only deep structure is cut off
    const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
    if (entries.every(([, v]) => isScalar(v))) {
      printKeyValue(
        entries.map(([k, v]) => [titleCase(k), formatScalar(v, k)]),
        prefix
      );
      return;
    }
    console.log(`${prefix}${c.dim(JSON.stringify(obj))}`);
    return;
  }

  const lines: [string, string][] = [];
  const nested: [string, unknown][] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (isScalar(value)) lines.push([titleCase(key), formatScalar(value, key)]);
    else if (Array.isArray(value) && value.every(isScalar)) {
      lines.push([titleCase(key), inlineScalarArray(value, key)]);
    } else nested.push([key, value]);
  }

  if (lines.length > 0) printKeyValue(lines, prefix);
  for (const [key, value] of nested) {
    printHeading(titleCase(key), level);
    printNode(value, level + 1, depth + 1);
  }
}

function printArrayDeep(arr: unknown[], level: number, depth: number): void {
  const prefix = INDENT.repeat(level);
  if (arr.length === 0) {
    console.log(`${prefix}${c.dim("No results.")}`);
    return;
  }

  if (arr.every(isScalar)) {
    for (const v of arr) console.log(`${prefix}${formatScalar(v, "")}`);
    return;
  }

  if (depth >= MAX_DEPTH) {
    console.log(`${prefix}${c.dim(JSON.stringify(arr))}`);
    return;
  }

  if (isTabular(arr)) {
    const flattened = arr.map(row => flattenRow((row ?? {}) as Record<string, unknown>));
    // Union the keys, not just row 0's: JSON omits undefined fields, so a value
    // only some rows carry would be dropped from the whole table.
    const union: Record<string, unknown> = {};
    for (const r of flattened) {
      for (const [k, v] of Object.entries(r)) {
        if (union[k] === undefined || union[k] === null) union[k] = v;
      }
    }
    const columns = selectColumns(union);
    const rows = flattened.map(r => columns.map(col => stringifyForTable(r[col], col)));
    printTable(columns.map(columnLabel), rows, prefix);
    return;
  }

  // Sectional: one headed block per element. Elements stay at the same
  // conceptual depth as the array itself — only the visual level increases.
  arr.forEach((row, i) => {
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      console.log(`${prefix}${formatScalar(row, "")}`);
      return;
    }
    const record = row as Record<string, unknown>;
    const [label, labelKey] = elementLabel(record, i);
    printHeading(label, level);
    const body = labelKey ? { ...record, [labelKey]: undefined } : record;
    printNode(body, level + 1, depth);
  });
}

/** Lift scalar fields of one nested-object level into dotted columns, so a
 *  table over `{instrument: {instrumentId}, pl: {total}}` rows gets
 *  "instrument.instrumentId" / "pl.total" columns instead of `{…}` cells. */
function flattenRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const dotted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      // "total" leads its group so it survives the column cap
      const subEntries = Object.entries(value as Record<string, unknown>).sort(
        ([a], [b]) => Number(/total/i.test(b)) - Number(/total/i.test(a))
      );
      for (const [subKey, subValue] of subEntries) {
        if (isScalar(subValue)) dotted[`${key}.${subKey}`] = subValue;
      }
      continue;
    }
    out[key] = value;
  }
  // Top-level scalars make better columns than lifted sub-fields; append those last
  return { ...out, ...dotted };
}

/** Render any fragment with the recursive human formatter. For runtime hooks
 *  that compose bespoke layouts around generically-rendered sub-structures. */
export function printHuman(value: unknown, level = 0): void {
  if (isScalar(value)) {
    console.log(`${INDENT.repeat(level)}${formatScalar(value, "")}`);
    return;
  }
  printNode(value, level, 0);
}

/**
 * Drop envelope noise: `success: true` (errors throw before rendering) and the
 * echoed request `filter`. A paged route is left with `{ offset, results, total }`.
 */
function stripEnvelope(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => k !== "success" && k !== "filter"));
}

/**
 * CSV rendering: arrays of objects become one record per row with the union of
 * scalar keys as columns (no MAX_TABLE_COLUMNS cap — exports want everything);
 * paged envelopes emit just their result array; plain objects emit a
 * two-column key/value sheet.
 */
function formatCsv(data: unknown): void {
  if (data === null || data === undefined) {
    printCsv([], []);
    return;
  }

  // Unwrap the paged envelope: post-strip, that is at most `{ offset, results, total }`.
  if (!Array.isArray(data) && typeof data === "object") {
    const obj = stripEnvelope(data as Record<string, unknown>);
    const keys = Object.keys(obj);
    const arrayKeys = keys.filter(k => Array.isArray(obj[k]));
    if (arrayKeys.length === 1 && keys.length <= 3) {
      formatCsv(obj[arrayKeys[0]]);
      return;
    }
    printCsv(
      ["key", "value"],
      keys.filter(k => obj[k] !== undefined).map(k => [k, obj[k]])
    );
    return;
  }

  if (Array.isArray(data)) {
    if (data.every(v => v === null || typeof v !== "object")) {
      printCsv(
        ["value"],
        data.map(v => [v])
      );
      return;
    }
    const columns: string[] = [];
    for (const row of data) {
      if (row === null || typeof row !== "object") continue;
      for (const key of Object.keys(row as Record<string, unknown>)) {
        if (!columns.includes(key)) columns.push(key);
      }
    }
    printCsv(
      columns,
      data.map(row => {
        const r = (row ?? {}) as Record<string, unknown>;
        return columns.map(col => r[col]);
      })
    );
    return;
  }

  printCsv(["value"], [[data]]);
}

export function formatResponse(data: unknown, cmd: Command): void {
  const format = getOutputFormat(cmd);
  if (format === "json") {
    printJson(data);
    return;
  }
  if (format === "csv") {
    formatCsv(data);
    return;
  }

  if (data === null || data === undefined) {
    console.log(c.dim("(no data)"));
    return;
  }

  if (Array.isArray(data)) {
    printArrayDeep(data, 0, 0);
    return;
  }

  if (typeof data === "object") {
    const obj = stripEnvelope(data as Record<string, unknown>);
    const keys = Object.keys(obj);
    const arrayKeys = keys.filter(k => Array.isArray(obj[k]));

    // Payload-less mutations answer `{ success: true }`; with the envelope stripped
    // there is nothing left to render, so confirm explicitly rather than exit mute.
    if (keys.length === 0) {
      console.log(c.success("Done."));
      return;
    }

    // Paged envelope: `{ results: [...], total }` — print metadata then the array.
    if (arrayKeys.length === 1 && keys.length <= 3) {
      const arr = obj[arrayKeys[0]] as unknown[];
      const scalarLines: [string, string][] = keys
        .filter(k => isScalar(obj[k]))
        .map<[string, string]>(k => [titleCase(k), formatScalar(obj[k], k)])
        .filter(([, v]) => v !== c.dim("-"));
      if (scalarLines.length > 0) {
        printKeyValue(scalarLines);
        console.log("");
      }
      printArrayDeep(arr, 0, 0);
      return;
    }

    printObjectDeep(obj, 0, 0);
    return;
  }

  console.log(formatScalar(data, ""));
}
