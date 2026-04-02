import { Command } from "commander";
import type { ExchangeFileDetailsResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, printKeyValue } from "../../../lib/output";

export async function handler({
  ledgerId,
  args,
  cmd
}: {
  ledgerId: string;
  args: { fileId: string };
  cmd: Command;
}): Promise<void> {
  const fileId = parseInt(args.fileId, 10);
  if (isNaN(fileId)) {
    console.error("Error: fileId must be a number.");
    process.exit(1);
  }

  const data = await apiPost<ExchangeFileDetailsResponse>("/exchange-file/details", {
    ledgerId,
    fileId
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  printKeyValue([
    ["File ID", String(data.fileId)],
    ["Exchange File", data.exchangeFileId],
    ["File Name", data.fileName],
    ["State", data.state],
    ["Size", String(data.fileSize)],
    ["Sub ID", data.subId || "-"],
    ["Timestamp", String(data.timestamp)]
  ]);
}
