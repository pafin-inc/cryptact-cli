import { Command } from "commander";
import type { LiveViewPositionOptions, LiveViewPositionResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, printTable } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: LiveViewPositionOptions;
  cmd: Command;
}): Promise<void> {
  let exchanges: unknown;
  try {
    exchanges = JSON.parse(options.exchanges as string);
  } catch {
    console.error("Error: --exchanges must be valid JSON array.");
    process.exit(1);
  }

  const body: Record<string, unknown> = {
    ledgerId,
    reportingCcy: options.reportingCcy,
    exchanges
  };
  if (options.snapshotTimestamp) {
    body.snapshotTimestamp = parseInt(options.snapshotTimestamp as string, 10);
  }

  const data = await apiPost<LiveViewPositionResponse>("/exchange-api/position", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const resp = data as LiveViewPositionResponse & {
    errors?: { error_code: number; exchange: string; subAccount: string }[];
  };
  const errors = resp.errors || [];
  if (errors.length > 0) {
    for (const e of errors) {
      const sub = e.subAccount ? ` (${e.subAccount})` : "";
      console.error(`Error: ${e.exchange}${sub} — error code ${e.error_code}`);
    }
  }

  const allPositions = data.byCoin.flatMap(g =>
    g.positions.map(p => [
      g.coin,
      p.exchange,
      p.asset,
      p.amount,
      p.price ?? "-",
      p.marketValue ?? "-"
    ])
  );

  if (allPositions.length === 0 && errors.length === 0) {
    console.log("No positions.");
    return;
  }

  if (allPositions.length > 0) {
    printTable(["Coin", "Exchange", "Asset", "Amount", "Price", "Market Value"], allPositions);
  }
}
