import { Command } from "commander";
import type { TransactionOpenCloseResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { fmt, info, isJsonMode, printJson, printTable } from "../../../lib/output";

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
    info("No open/close data available.");
    return;
  }

  printTable(
    ["UUID", "Currency", "Side", "Volume", "Price", "Fee", "Cost Basis"],
    rows.map(r => [
      fmt.id(r.txnUuid.substring(0, 8)),
      r.ccy,
      r.side,
      fmt.value(r.vol),
      fmt.value(r.prc),
      fmt.value(r.fee),
      fmt.value(r.cb)
    ])
  );
}
