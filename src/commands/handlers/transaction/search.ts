import { Command } from "commander";
import type { TransactionSearchOptions, TransactionSearchResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { displayValue, isJsonMode, printJson, printTable } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: TransactionSearchOptions;
  cmd: Command;
}): Promise<void> {
  const filter: Record<string, unknown> = {
    ledgerId,
    source: options.source ? (options.source as string).split(",") : [],
    action: options.action ? (options.action as string).split(",") : [],
    pair: options.pair ? (options.pair as string).split(",") : [],
    feeCurrency: options.feeCurrency ? (options.feeCurrency as string).split(",") : [],
    from: (options.from as string) || null,
    to: (options.to as string) || null,
    limit: parseInt((options.limit as string) || "20", 10),
    orderBy: [
      {
        column: "ts",
        order: options.order || "DESC"
      }
    ]
  };
  if (options.hasError) filter.hasError = true;

  const data = await apiPost<TransactionSearchResponse>("/transaction/search", {
    filter,
    offset: parseInt((options.offset as string) || "0", 10)
  });

  if (isJsonMode(cmd)) {
    const { ledgerId: _lid, ...filterRest } = data.filter;
    printJson({ ...data, filter: filterRest });
    return;
  }

  printTable(
    ["UUID", "Date", "Action", "Pair", "Volume", "Price", "Fee", "Source"],
    data.results.map(t => [
      t.uuid.substring(0, 8),
      String(t.ts).substring(0, 10),
      t.act,
      t.pair,
      displayValue(t.vol),
      displayValue(t.prc),
      `${displayValue(t.fee)} ${t.fc}`,
      t.src
    ])
  );
  console.log(`\nTotal: ${data.total}`);
}
