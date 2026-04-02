import { Command } from "commander";
import type { BillingPlansResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { isJsonMode, printJson, printTable } from "../../../lib/output";
import { assertNotEnterprise } from "../../../lib/resolve-enterprise";

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  await assertNotEnterprise();
  const data = await apiGet<BillingPlansResponse>("/stripe/plans");
  const plans = data.plans || [];

  if (isJsonMode(cmd)) {
    printJson(plans);
    return;
  }

  printTable(
    ["Tier", "Amount", "Currency", "Active", "Purchasable"],
    plans.map(p => [
      p.billingTier,
      String(p.amount),
      p.currency,
      p.active ? "Yes" : "No",
      p.isPurchasable ? "Yes" : "No"
    ])
  );
}
