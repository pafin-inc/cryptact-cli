import { Command } from "commander";
import { apiGet } from "../../../lib/api-client";
import { isJsonMode, printJson, printTable } from "../../../lib/output";

interface ExchangeFile {
  fileName: string;
  state?: string;
  timestamp?: string;
}

export async function handler({
  ledgerId,
  cmd
}: {
  ledgerId: string;
  cmd: Command;
}): Promise<void> {
  const data = await apiGet<{ results?: ExchangeFile[] }>(
    `/exchange-file/active?ledgerId=${ledgerId}`
  );
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
