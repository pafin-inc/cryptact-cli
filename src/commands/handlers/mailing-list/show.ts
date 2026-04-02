import { Command } from "commander";
import type { MailingListShowResponse, SettingsShowResponse } from "../../../cli-spec";
import { apiGet, apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, printKeyValue } from "../../../lib/output";

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const { email } = await apiGet<SettingsShowResponse>("/settings/user");
  const data = await apiPost<MailingListShowResponse>("/mailing-list", { email });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  printKeyValue([
    ["Mandatory", data.subscriptions.mandatory ? "Yes" : "No"],
    ["Announcements", data.subscriptions.announcements ? "Yes" : "No"],
    ["Marketing", data.subscriptions.marketing ? "Yes" : "No"],
    ["Transactional", data.subscriptions.transactional ? "Yes" : "No"]
  ]);
}
