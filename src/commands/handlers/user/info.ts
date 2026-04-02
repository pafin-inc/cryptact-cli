import { Command } from "commander";
import type { UserInfoResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { isJsonMode, printJson, printKeyValue } from "../../../lib/output";

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const data = await apiGet<UserInfoResponse>("/user/info");

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  printKeyValue([
    ["Role", data.role],
    ["Onboarded", data.onboarded ? "Yes" : "No"]
  ]);
}
