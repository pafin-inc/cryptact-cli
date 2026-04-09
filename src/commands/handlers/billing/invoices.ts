import { Command } from "commander";
import type { BillingInvoicesOptions, BillingInvoicesResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { fmt, isJsonMode, printJson, printTable } from "../../../lib/output";
import { assertNotEnterprise } from "../../../lib/resolve-enterprise";

export async function handler({
  options,
  cmd
}: {
  options: BillingInvoicesOptions;
  cmd: Command;
}): Promise<void> {
  await assertNotEnterprise();
  const params = new URLSearchParams();
  if (options.limit) params.set("limit", options.limit);
  if (options.endingBefore) params.set("ending_before", options.endingBefore);
  if (options.startingAfter) params.set("starting_after", options.startingAfter);
  const qs = params.toString();
  const data = await apiGet<BillingInvoicesResponse>(`/stripe/invoices${qs ? `?${qs}` : ""}`);

  const invoices = data.list || [];

  if (isJsonMode(cmd)) {
    printJson(invoices);
    return;
  }

  printTable(
    ["ID", "Date", "Amount", "Currency", "Status"],
    invoices.map(inv => [
      fmt.id(inv.id),
      String(inv.created),
      fmt.value(inv.amountDue),
      inv.currency || "-",
      inv.status ? fmt.state(inv.status) : "-"
    ])
  );
}
