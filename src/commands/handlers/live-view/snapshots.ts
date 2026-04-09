import { Command } from "commander";
import type { LiveViewSnapshotsResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { fmt, info, isJsonMode, log, printJson } from "../../../lib/output";

export async function handler({
  ledgerId,
  cmd
}: {
  ledgerId: string;
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const data = await apiPost<LiveViewSnapshotsResponse>(
    "/exchange-api/position/snapshot-timestamps",
    { ledgerId }
  );

  if (isJsonMode(cmd)) {
    printJson(data.timestamps);
    return;
  }

  const timestamps = data.timestamps || [];
  if (timestamps.length === 0) {
    info("No snapshots available.");
    return;
  }

  for (const ts of timestamps) {
    log(fmt.datetime(ts * 1000, "datetime"));
  }
}
