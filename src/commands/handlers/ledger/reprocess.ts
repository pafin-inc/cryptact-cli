import { Command } from "commander";
import type { LedgerReprocessOptions, LedgerReprocessResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: LedgerReprocessOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = { ledgerId, forceRebuild: options.forceRebuild ?? false };
  if (options.from) body.fromTimestamp = Number(options.from);

  const data = await apiPost<LedgerReprocessResponse>(`/ledger/${ledgerId}/process`, body);

  if (isJsonMode(cmd)) {
    printJson(data.processStatus);
    return;
  }

  console.log(`Processing triggered. Status: ${data.processStatus.state}`);
}
