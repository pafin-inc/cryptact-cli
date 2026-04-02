import { Command } from "commander";
import type { PortfolioShowOptions, PortfolioShowResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { displayValue, isJsonMode, printJson, printTable } from "../../../lib/output";

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

  console.log(`Portfolio (${data.reportingCcy})\n`);

  printTable(
    ["Coin", "Position", "Price", "Market Value", "Avg Cost", "Unrealized P&L"],
    data.detail.coins.map(c => [
      c.coin,
      c.position,
      c.price ? displayValue(c.price) : "-",
      displayValue(c.mv),
      displayValue(c.averageCost),
      displayValue(c.unrealizedGains)
    ])
  );
}
