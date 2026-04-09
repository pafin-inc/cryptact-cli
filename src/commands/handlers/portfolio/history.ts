import { Command } from "commander";
import type { PortfolioHistoryOptions, PortfolioHistoryResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { fmt, info, isJsonMode, printJson, printTable } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  args,
  cmd
}: {
  ledgerId: string;
  options: PortfolioHistoryOptions;
  args: { type: string };
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = {
    ledgerId,
    aggregateType: args.type
  };
  if (options.from) body.from = Number(options.from);
  if (options.to) body.to = Number(options.to);

  const data = await apiPost<PortfolioHistoryResponse>("/portfolio-aggregates/search", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const results = (data.aggregates || []) as unknown as Record<string, unknown>[];
  if (results.length === 0) {
    info(`No history data available (status: ${data.status}).`);
    return;
  }

  const headers = Object.keys(results[0]);
  printTable(
    headers,
    results.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return "-";
        const str = String(val);
        return typeof val === "string" ? fmt.value(str) : str;
      })
    )
  );
}
