import { Command } from "commander";
import type { LiveViewSettingsResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, printKeyValue } from "../../../lib/output";

export async function handler({
  ledgerId,
  cmd
}: {
  ledgerId: string;
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const data = await apiPost<LiveViewSettingsResponse>("/ledger/get-sync-settings", { ledgerId });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  printKeyValue([["Position Snapshots", data.isPositionSnapshotEnabled ? "enabled" : "disabled"]]);
}
