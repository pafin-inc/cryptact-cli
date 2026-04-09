import { Command } from "commander";
import type { WalletSyncStatusResponse } from "../../../cli-spec";
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
  const data = await apiGet<WalletSyncStatusResponse>(`/exchange-api/job?ledgerId=${ledgerId}`);

  const statuses = data.statuses || [];

  if (isJsonMode(cmd)) {
    printJson(statuses);
    return;
  }

  printTable(
    ["Exchange", "Sub Account", "Status", "Progress", "Endpoint"],
    statuses.map(s => {
      const progress = s.progress !== null && s.progress !== undefined ? String(s.progress) : "-";
      return [s.exchange, s.subAccount || "-", fmt.state(s.status), progress, s.endpoint || "-"];
    })
  );
}
