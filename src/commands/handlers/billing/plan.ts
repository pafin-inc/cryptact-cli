import { Command } from "commander";
import type { BillingPlanResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { isJsonMode, printJson, printKeyValue } from "../../../lib/output";
import { assertNotEnterprise } from "../../../lib/resolve-enterprise";

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  await assertNotEnterprise();
  const data = await apiGet<BillingPlanResponse>("/stripe/subscription");

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const sub = data.subscription;
  if (!sub) {
    printKeyValue([["Plan", "No active subscription"]]);
    return;
  }
  printKeyValue([
    ["Plan", sub.plan.billingTier],
    ["Amount", `${sub.plan.amount} ${sub.plan.currency.toUpperCase()}`],
    ["Status", sub.status],
    ["Period Start", new Date(sub.currentPeriodStart * 1000).toISOString().substring(0, 10)],
    ["Period End", new Date(sub.currentPeriodEnd * 1000).toISOString().substring(0, 10)],
    ["Cancel at Period End", sub.cancelAtPeriodEnd ? "Yes" : "No"],
    ["Auto Renewal", data.autoRenewalEpoch || "-"]
  ]);
}
