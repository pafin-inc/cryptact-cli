import { Command } from "commander";
import type { ExchangeFileHistoryOptions, ExchangeFileHistoryResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, printTable } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: ExchangeFileHistoryOptions;
  cmd: Command;
}): Promise<void> {
  const data = await apiPost<ExchangeFileHistoryResponse>("/exchange-file/history", {
    filter: { ledgerId },
    offset: options.offset !== undefined ? parseInt(options.offset as string, 10) : 0
  });

  const files = data.results || [];

  if (isJsonMode(cmd)) {
    printJson(files);
    return;
  }

  printTable(
    ["File Name", "Status", "Created"],
    files.map(f => [f.fileName, f.state || "-", f.timestamp ? f.timestamp.substring(0, 10) : "-"])
  );
}
