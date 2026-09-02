import { Command } from "commander";
import { ColorName, c, FormatterInput } from "./colors";
import { UsageError } from "./errors";

/** Sentinel value the backend returns for masked/hidden numeric fields. */
const Z3 = "000.000";

// ─── ANSI-aware string helpers ───────────────────────────────────────────────
const ANSI_REGEX = /\x1b\[[0-9;]*m/g;

/** Terminal cell width of one code point: CJK/fullwidth = 2, combining = 0. */
function charWidth(cp: number): number {
  if ((cp >= 0x0300 && cp <= 0x036f) || cp === 0x200b || cp === 0xfeff) return 0;
  if (
    cp >= 0x1100 &&
    (cp <= 0x115f || // Hangul Jamo
      cp === 0x2329 ||
      cp === 0x232a ||
      (cp >= 0x2e80 && cp <= 0xa4cf && cp !== 0x303f) || // CJK, Kana, radicals
      (cp >= 0xac00 && cp <= 0xd7a3) || // Hangul syllables
      (cp >= 0xf900 && cp <= 0xfaff) || // CJK compatibility ideographs
      (cp >= 0xfe30 && cp <= 0xfe4f) || // CJK compatibility forms
      (cp >= 0xff00 && cp <= 0xff60) || // fullwidth forms
      (cp >= 0xffe0 && cp <= 0xffe6) ||
      (cp >= 0x1f300 && cp <= 0x1f64f) || // emoji
      (cp >= 0x1f900 && cp <= 0x1f9ff) ||
      (cp >= 0x20000 && cp <= 0x3fffd)) // CJK extensions
  ) {
    return 2;
  }
  return 1;
}

export function visibleWidth(str: string): number {
  let width = 0;
  for (const ch of str.replace(ANSI_REGEX, "")) width += charWidth(ch.codePointAt(0) as number);
  return width;
}

function padEnd(str: string, width: number): string {
  const padding = Math.max(0, width - visibleWidth(str));
  return str + " ".repeat(padding);
}

function padStart(str: string, width: number): string {
  const padding = Math.max(0, width - visibleWidth(str));
  return " ".repeat(padding) + str;
}

// ─── Value formatters ────────────────────────────────────────────────────────
// Use these to add colors to values in tables/output

const MAX_DISPLAY_DECIMALS = 8;

/** "8803511.8367346938775510204" → "8,803,511.83673469" (grouped, ≤8 decimals,
 *  trailing zeros trimmed). Non-numeric input is returned unchanged. */
export function formatDecimal(v: string | number): string {
  const raw = typeof v === "number" ? String(v) : v.trim();
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(raw);
  if (!match) return String(v);
  const [, sign, int, frac = ""] = match;
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let decimals = frac.slice(0, MAX_DISPLAY_DECIMALS).replace(/0+$/, "");
  // A magnitude below 1e-8 (18-decimal tokens) must not collapse to "0".
  if (!decimals && /^0*$/.test(int) && /[1-9]/.test(frac)) {
    decimals = frac.replace(/0+$/, "");
  }
  return `${sign}${grouped}${decimals ? `.${decimals}` : ""}`;
}

export const fmt = {
  /** Format state values (DONE, ERROR, PROCESSING, etc.) */
  state(s: string): string {
    const upper = s.toUpperCase();
    switch (upper) {
      case "DONE":
      case "IDLE":
      case "COMPLETED":
      case "SUCCESS":
        return c.success(s);
      case "ERROR":
      case "TIMEOUT":
      case "FAILED":
        return c.error(s);
      case "PROCESSING":
      case "PENDING":
      case "RUNNING":
      case "UNSTARTED":
        return c.warn(s);
      default:
        return s;
    }
  },

  /** Format boolean as yes/no */
  bool(v: boolean): string {
    return v ? c.success("yes") : c.dim("no");
  },

  /** Format numeric value with color based on sign */
  value(v: FormatterInput): string {
    if (v === null || v === undefined) return c.dim("-");
    if (v === Z3) return c.dim("***");
    const num = typeof v === "string" ? parseFloat(v) : v;
    if (isNaN(num)) return String(v);
    const display = formatDecimal(v as string | number);
    if (num > 0) return c.success(display);
    if (num < 0) return c.error(display);
    return display;
  },

  /** Format numeric value with grouping but no sign color (counts, market caps) */
  number(v: FormatterInput): string {
    if (v === null || v === undefined) return c.dim("-");
    if (v === Z3) return c.dim("***");
    return formatDecimal(v as string | number);
  },

  /** Format transaction action types */
  action(act: string): string {
    const upper = act.toUpperCase();
    switch (upper) {
      case "BUY":
      case "BONUS":
      case "MINING":
      case "STAKING":
      case "AIRDROP":
        return c.success(act);
      case "SELL":
      case "PAY":
      case "LOSS":
        return c.error(act);
      case "SENDFEE":
      case "FEE":
        return c.warn(act);
      default:
        return act;
    }
  },

  /** Format ID/UUID (dimmed) */
  id(uuid: string): string {
    return c.dim(uuid);
  },

  /** Format trading pair (e.g., "BTC|~~|JPY" → "BTC/JPY") */
  pair(p: Exclude<FormatterInput, number | Date>): string {
    if (p === null || p === undefined) return "-";
    return p.replace(/\|~~\|/g, "/");
  },

  /** Format date/datetime value */
  datetime(d: FormatterInput | Date, format: "date" | "datetime" = "date"): string {
    if (d === null || d === undefined) return "-";
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return "-";
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    if (format === "date") return `${year}-${month}-${day}`;
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  color(color: ColorName, str: FormatterInput): string {
    return c[color](String(str ?? ""));
  }
} as const;

// ─── Output functions ────────────────────────────────────────────────────────

/** Print a plain message */
export function log(message: string): void {
  console.log(message);
}

/** Print a success message */
export function success(message: string): void {
  console.log(c.success(message));
}

/** Print an error message */
export function error(message: string): void {
  console.error(c.error(message));
}

/** Print a warning message */
export function warn(message: string): void {
  console.log(c.warn(message));
}

/** Print an info message */
export function info(message: string): void {
  console.log(c.info(message));
}

// ─── Utilities ───────────────────────────────────────────────────────────────

export type OutputFormat = "table" | "json" | "csv";

/** Resolve the output format from `--format` / `--json`, walking parent commands. */
export function getOutputFormat(cmd: Command): OutputFormat {
  let current: Command | null = cmd;
  while (current) {
    const opts = current.opts();
    if (opts.json) return "json";
    if (typeof opts.format === "string") {
      const format = opts.format.toLowerCase();
      if (format === "table" || format === "json" || format === "csv") return format;
      throw new UsageError(`Unknown --format '${opts.format}'. Supported: table, json, csv`);
    }
    current = current.parent;
  }
  return "table";
}

export function isJsonMode(cmd: Command): boolean {
  return getOutputFormat(cmd) === "json";
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw =
    typeof value === "object" && !(value instanceof Date)
      ? JSON.stringify(value)
      : value instanceof Date
        ? value.toISOString()
        : String(value);
  // A leading =, +, -, @, tab or CR makes Excel/Sheets treat the cell as a formula,
  // and transaction comments come from user-uploaded files. Quote-prefix those, but
  // never a plain number, or every negative amount exports as text. `+` is not part
  // of the number pattern: nothing here emits `+1`, so it is text Excel renders as 1.
  const isNumber = /^-?\d[\d,]*(\.\d+)?([eE][-+]?\d+)?$/.test(raw);
  const safe = !isNumber && /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** RFC 4180-ish CSV: header row + one line per record, all raw values (no colors). */
export function printCsv(headers: string[], rows: unknown[][]): void {
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) lines.push(row.map(csvCell).join(","));
  process.stdout.write(`${lines.join("\n")}\n`);
}

const SECTION_TITLE_WIDTH = 46;

/** "── Label ─────────" section heading (replaces the old `=== Label ===`). */
export function sectionTitle(label: string): string {
  const fill = Math.max(3, SECTION_TITLE_WIDTH - visibleWidth(label) - 4);
  return `${c.dim("──")} ${c.header(label)} ${c.dim("─".repeat(fill))}`;
}

export function printKeyValue(lines: [string, string][], indent = ""): void {
  if (lines.length === 0) return;
  const maxLabel = Math.max(...lines.map(([l]) => visibleWidth(l)));
  for (const [label, value] of lines) {
    console.log(`${indent}${c.label(padEnd(label, maxLabel))}  ${value}`);
  }
}

/** "-", "***" and grouped/decimal numbers count as numeric cells. */
const NUMERIC_CELL_REGEX = /^(-|\*{3}|-?[\d,]+(\.\d+)?)$/;

export function printTable(headers: string[], rows: string[][], indent = ""): void {
  if (rows.length === 0) {
    console.log(`${indent}${c.dim("No results.")}`);
    return;
  }

  const colWidths = headers.map((h, i) => {
    const maxDataWidth = rows.reduce((max, row) => Math.max(max, visibleWidth(row[i] || "")), 0);
    return Math.max(visibleWidth(h), maxDataWidth);
  });

  // Right-align columns whose every cell is numeric (financial display)
  const rightAligned = headers.map((_, i) => {
    const cells = rows.map(row => (row[i] || "").replace(ANSI_REGEX, "").trim());
    return (
      cells.some(t => /\d/.test(t)) && cells.every(t => t === "" || NUMERIC_CELL_REGEX.test(t))
    );
  });

  const pad = (str: string, i: number): string =>
    rightAligned[i] ? padStart(str, colWidths[i]) : padEnd(str, colWidths[i]);

  const headerLine = headers.map((h, i) => c.header(pad(h, i))).join("  ");
  const separator = c.dim(colWidths.map(w => "-".repeat(w)).join("  "));

  console.log(`${indent}${headerLine}`);
  console.log(`${indent}${separator}`);
  for (const row of rows) {
    const line = row.map((cell, i) => pad(cell || "", i)).join("  ");
    console.log(`${indent}${line}`);
  }
}
