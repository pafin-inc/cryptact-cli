import { Command } from "commander";
import type { ExchangeSyncOptions } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: ExchangeSyncOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = {
    ledgerId,
    exchangeId: options.exchange
  };
  if (options.subAccount) body.subAccount = options.subAccount;
  if (options.endpoint) body.endpoint = options.endpoint;

  const data = await apiPost<Record<string, unknown>>("/exchange-api/job/start", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  success("Sync started.");
}
