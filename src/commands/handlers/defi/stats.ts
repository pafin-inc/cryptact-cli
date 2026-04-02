import { Command } from "commander";
import type { DefiStatsOptions, DefiStatsResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, printKeyValue } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: DefiStatsOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = { ledgerId };
  if (options.startTime) body.startTime = parseInt(options.startTime as string, 10);
  if (options.chainFamily) body.chainFamily = options.chainFamily;

  const data = await apiPost<DefiStatsResponse>("/defi/ledger/stats", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  printKeyValue([
    ["Chain Family", data.chainFamily],
    ["Chains", (data.chains || []).join(", ")],
    ["Total", String(data.confirm?.total ?? 0)],
    ["Classified", String(data.confirm?.classified ?? 0)],
    ["Unclassified", String(data.confirm?.all ?? 0)],
    ["Transfers", String(data.confirm?.transfers ?? 0)],
    ["Risky", String(data.confirm?.risky ?? 0)],
    ["Unknown", String(data.confirm?.unknown ?? 0)]
  ]);
}
