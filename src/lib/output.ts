import { Command } from "commander";
import { Z3 } from "../cli-spec";
import { apiGet } from "./api-client";

export function isJsonMode(cmd: Command): boolean {
  // Walk up to the root program to find --json flag
  let current: Command | null = cmd;
  while (current) {
    const opts = current.opts();
    if (opts.json) return true;
    current = current.parent;
  }
  return false;
}

let cachedLang: "en" | "ja" | undefined;

export async function getLang(): Promise<"en" | "ja"> {
  if (cachedLang) return cachedLang;
  try {
    const data = await apiGet<{ language?: string }>("/settings/user");
    cachedLang = data.language === "ja" ? "ja" : "en";
  } catch {
    cachedLang = "en";
  }
  return cachedLang;
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function displayValue(val: string): string {
  return val === Z3 ? "***" : val;
}

export function printKeyValue(lines: [string, string][]): void {
  const maxLabel = Math.max(...lines.map(([l]) => l.length));
  for (const [label, value] of lines) {
    console.log(`${label.padEnd(maxLabel)}  ${value}`);
  }
}

export function printTable(headers: string[], rows: string[][]): void {
  if (rows.length === 0) {
    console.log("No results.");
    return;
  }

  const colWidths = headers.map((h, i) => {
    const maxDataWidth = rows.reduce((max, row) => Math.max(max, (row[i] || "").length), 0);
    return Math.max(h.length, maxDataWidth);
  });

  const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join("  ");
  const separator = colWidths.map(w => "-".repeat(w)).join("  ");

  console.log(headerLine);
  console.log(separator);
  for (const row of rows) {
    const line = row.map((cell, i) => (cell || "").padEnd(colWidths[i])).join("  ");
    console.log(line);
  }
}
