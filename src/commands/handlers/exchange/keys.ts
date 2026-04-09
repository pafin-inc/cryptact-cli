import { Command } from "commander";
import type { ExchangeKeysResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { fmt, isJsonMode, printJson, printTable } from "../../../lib/output";

export async function handler({
  ledgerId,
  cmd
}: {
  ledgerId: string;
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const data = await apiGet<ExchangeKeysResponse>(
    `/exchange-api/exchange/key?ledgerId=${ledgerId}`
  );

  const keys = data.keyInfos || [];

  if (isJsonMode(cmd)) {
    printJson(keys);
    return;
  }

  printTable(
    ["Exchange", "Public Key", "Sub Account", "Created", "Updated"],
    keys.map(k => [
      k.exchange,
      fmt.id(k.pubKey.substring(0, 16) + "..."),
      k.subAccount || "-",
      fmt.datetime(k.createdAt, "datetime"),
      fmt.datetime(k.updatedAt, "datetime")
    ])
  );
}
