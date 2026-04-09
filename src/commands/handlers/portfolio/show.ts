import { Command } from "commander";
import type { PortfolioShowOptions, PortfolioShowResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { fmt, isJsonMode, log, printJson, printTable } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: PortfolioShowOptions;
  cmd: Command;
}): Promise<void> {
  const data = await apiPost<PortfolioShowResponse>(`/portfolio/${ledgerId}`, {
    ledgerId,
    reportingCcy: (options.reportingCcy as string) || "JPY"
  });

  if (isJsonMode(cmd)) {
    const { ledgerId: _lid, ...rest } = data;
    printJson(rest);
    return;
  }

  log(`Portfolio (${data.reportingCcy})\n`);

  printTable(
    ["Coin", "Position", "Price", "Market Value", "Avg Cost", "Unrealized P&L"],
    data.detail.coins.map(c => [
      c.coin,
      fmt.value(c.position),
      fmt.value(c.price),
      fmt.value(c.mv),
      fmt.value(c.averageCost),
      fmt.value(c.unrealizedGains)
    ])
  );
}
