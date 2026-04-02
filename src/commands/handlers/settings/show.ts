import { Command } from "commander";
import type { SettingsShowResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { isJsonMode, printJson, printKeyValue } from "../../../lib/output";

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const data = await apiGet<SettingsShowResponse>("/settings/user");

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  printKeyValue([
    ["Email", data.email || "-"],
    ["Language", data.language || "-"]
  ]);
}
