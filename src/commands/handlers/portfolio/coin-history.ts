import { Command } from "commander";
import type { PortfolioCoinHistoryOptions, PortfolioCoinHistoryResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, printTable } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: PortfolioCoinHistoryOptions;
  cmd: Command;
}): Promise<void> {
  const data = await apiPost<PortfolioCoinHistoryResponse>("/portfolio-aggregates/search", {
    ledgerId,
    aggregateType: "global",
    instrumentId: options.coin,
    from: Number(options.from),
    to: Number(options.to)
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const results = (data.aggregates || []) as unknown as Record<string, unknown>[];
  if (results.length === 0) {
    console.log(`No history data available (status: ${data.status}).`);
    return;
  }

  const headers = Object.keys(results[0]);
  printTable(
    headers,
    results.map(row => headers.map(h => String(row[h] ?? "-")))
  );
}
