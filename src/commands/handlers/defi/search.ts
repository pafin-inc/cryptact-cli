import { Command } from "commander";
import type { DefiSearchOptions } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { fmt, info, isJsonMode, log, printJson, printTable } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: DefiSearchOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = {
    chains: (options.chains as string).split(",").map(c => c.trim()),
    page: parseInt((options.page as string) || "0", 10)
  };
  if (options.quickFilter) body.quickFilter = options.quickFilter;
  if (options.limit) body.limit = parseInt(options.limit as string, 10);
  if (options.startTime) body.startTime = options.startTime;
  if (options.endTime) body.endTime = options.endTime;
  if (options.sortOrder) body.sortOrder = options.sortOrder;
  if (options.chainFamily) body.chainFamily = options.chainFamily;
  if (options.addresses) body.addresses = (options.addresses as string).split(",");
  if (options.services) body.services = (options.services as string).split(",");
  if (options.actionDetail) body.actionDetail = (options.actionDetail as string).split(",");
  if (options.assetHashes) body.assetHashes = (options.assetHashes as string).split(",");

  const data = await apiPost<{ transactions: Record<string, unknown>[]; total: number }>(
    `/defi/ledger/${ledgerId}`,
    body
  );

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const transactions = data.transactions || [];
  if (transactions.length === 0) {
    info("No DeFi transactions found.");
    return;
  }

  printTable(
    ["Chain", "Hash", "Action", "Detail", "Timestamp"],
    transactions.map(t => {
      const resolved = t.resolved as Record<string, string> | undefined;
      return [
        String(t.chain || ""),
        fmt.id(String(t.hash || "").substring(0, 16)),
        resolved?.action ? fmt.action(resolved.action) : "-",
        resolved?.actionDetail || "-",
        fmt.datetime(t.timestamp ? Number(t.timestamp) : null, "datetime")
      ];
    })
  );
  log(`\nTotal: ${data.total}`);
}
