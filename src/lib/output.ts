import { Command } from "commander";
import { Z3 } from "../cli-spec";
import { c, ColorName, FormatterInput } from "./colors";

// ─── ANSI-aware string helpers ───────────────────────────────────────────────
const ANSI_REGEX = /\x1b\[[0-9;]*m/g;

function visibleWidth(str: string): number {
  return str.replace(ANSI_REGEX, "").length;
}

function padEnd(str: string, width: number): string {
  const visible = visibleWidth(str);
  const padding = Math.max(0, width - visible);
  return str + " ".repeat(padding);
}

// ─── Value formatters ────────────────────────────────────────────────────────
// Use these to add colors to values in tables/output

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
    if (num > 0) return c.success(String(v));
    if (num < 0) return c.error(String(v));
    return String(v);
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

export function isJsonMode(cmd: Command): boolean {
  let current: Command | null = cmd;
  while (current) {
    const opts = current.opts();
    if (opts.json) return true;
    current = current.parent;
  }
  return false;
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printKeyValue(lines: [string, string][]): void {
  if (lines.length === 0) return;
  const maxLabel = Math.max(...lines.map(([l]) => visibleWidth(l)));
  for (const [label, value] of lines) {
    console.log(`${c.label(padEnd(label, maxLabel))}  ${value}`);
  }
}

export function printTable(headers: string[], rows: string[][]): void {
  if (rows.length === 0) {
    console.log(c.dim("No results."));
    return;
  }

  const colWidths = headers.map((h, i) => {
    const maxDataWidth = rows.reduce((max, row) => Math.max(max, visibleWidth(row[i] || "")), 0);
    return Math.max(visibleWidth(h), maxDataWidth);
  });

  const headerLine = headers.map((h, i) => c.header(padEnd(h, colWidths[i]))).join("  ");
  const separator = c.dim(colWidths.map(w => "-".repeat(w)).join("  "));

  console.log(headerLine);
  console.log(separator);
  for (const row of rows) {
    const line = row.map((cell, i) => padEnd(cell || "", colWidths[i])).join("  ");
    console.log(line);
  }
}
