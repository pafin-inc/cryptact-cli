import { Command } from "commander";
import type { InstrumentsListResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { isJsonMode, printJson, printTable } from "../../../lib/output";

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const data = await apiGet<InstrumentsListResponse>("/instruments/list-crypto-fx");

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const caps = data.cryptoMarketCaps || {};
  const names = data.cryptoNames.en || {};

  const cryptos = Object.keys(caps)
    .sort((a, b) => (caps[b] ?? 0) - (caps[a] ?? 0))
    .map(id => [id, names[id] || "-", caps[id] !== undefined ? String(caps[id]) : "-"]);

  const fxIds = Object.keys(data.fxNames.en || {}).sort();
  const fxRows = fxIds.map(id => [id, data.fxNames.en[id] || "-", "-"]);

  printTable(["ID", "Name", "Market Cap"], [...cryptos, ...fxRows]);
  console.log(`\n${cryptos.length} crypto, ${fxRows.length} FX instruments`);
}
