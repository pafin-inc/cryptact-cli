import { Command } from "commander";
import type { ExchangeSyncCancelOptions } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: ExchangeSyncCancelOptions;
  cmd: Command;
}): Promise<void> {
  const filter: Record<string, unknown> = { exchange: options.exchange };
  if (options.subAccount) filter.subAccount = options.subAccount;
  if (options.endpoint) filter.endpoint = options.endpoint;

  const data = await apiPost<Record<string, unknown>>("/exchange-api/job/cancel", {
    ledgerId,
    filters: [filter]
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  success("Sync job cancelled.");
}
