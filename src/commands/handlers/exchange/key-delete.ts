import { Command } from "commander";
import type { ExchangeKeyDeleteOptions } from "../../../cli-spec";
import { apiDelete } from "../../../lib/api-client";
import { isJsonMode, printJson } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: ExchangeKeyDeleteOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = {
    ledgerId,
    exchange: options.exchange
  };
  if (options.subAccount) body.subAccount = options.subAccount;

  const data = await apiDelete<Record<string, unknown>>("/exchange-api/exchange/key", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  console.log(`API key for ${options.exchange} removed.`);
}
