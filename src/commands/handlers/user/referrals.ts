import { Command } from "commander";
import type { UserReferralsResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { isJsonMode, printJson, printKeyValue } from "../../../lib/output";

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const data = await apiGet<UserReferralsResponse>("/user/referrals");

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  printKeyValue([
    ["Referral Code", data.referralCode],
    ["Subscribed", String(data.referralStats.subscribed)],
    ["Paid", String(data.referralStats.paid)],
    ["Balance", String(data.referralStats.balance)],
    ["Earned", String(data.referralStats.earned)]
  ]);
}
