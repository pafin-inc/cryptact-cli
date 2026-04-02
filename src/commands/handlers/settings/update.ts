import { Command } from "commander";
import type { SettingsUpdateOptions, SettingsUpdateResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, printKeyValue } from "../../../lib/output";

export async function handler({
  options,
  cmd
}: {
  options: SettingsUpdateOptions;
  cmd: Command;
}): Promise<void> {
  const data = await apiPost<SettingsUpdateResponse>("/settings/user", {
    language: options.language
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  printKeyValue([["Language", data.language]]);
}
