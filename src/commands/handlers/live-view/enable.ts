import { Command } from "commander";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  cmd
}: {
  ledgerId: string;
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const data = await apiPost<Record<string, unknown>>("/ledger/enable-sync-settings", {
    ledgerId,
    enable: true
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  success("Live-view position snapshots enabled.");
}
