import { Command } from "commander";
import type { TransactionOpenCloseResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { displayValue, isJsonMode, printJson, printTable } from "../../../lib/output";

export async function handler({
  ledgerId,
  args,
  cmd
}: {
  ledgerId: string;
  args: { uuid: string };
  cmd: Command;
}): Promise<void> {
  const { uuid } = args;

  const data = await apiPost<TransactionOpenCloseResponse>(`/transaction/${uuid}/open-close`, {
    ledgerId,
    transactionId: uuid
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const rows = data.openClose || [];
  if (rows.length === 0) {
    console.log("No open/close data available.");
    return;
  }

  printTable(
    ["UUID", "Currency", "Side", "Volume", "Price", "Fee", "Cost Basis"],
    rows.map(r => [
      r.txnUuid.substring(0, 8),
      r.ccy,
      r.side,
      displayValue(r.vol),
      displayValue(r.prc),
      displayValue(r.fee),
      displayValue(r.cb)
    ])
  );
}
