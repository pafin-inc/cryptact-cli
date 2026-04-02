import { Command } from "commander";
import type { LedgerDownloadOptions, LedgerDownloadResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: LedgerDownloadOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = { ledgerId };
  if (options.year !== undefined) body.selectedFiscalYear = parseInt(options.year as string, 10);
  const data = await apiPost<LedgerDownloadResponse>(`/ledger/${ledgerId}/download`, body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  console.log("Download triggered. You will receive an email with the download link.");
}
