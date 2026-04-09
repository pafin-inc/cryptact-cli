import { Command } from "commander";
import type { TransactionLoanSummaryResponse } from "../../../cli-spec";
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

  const data = await apiPost<TransactionLoanSummaryResponse>(`/transaction/${uuid}/loan-summary`, {
    ledgerId,
    transactionId: uuid
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const loans = data.loans || [];
  if (loans.length === 0) {
    info("No loan data available.");
    return;
  }

  printTable(
    ["Instrument", "Type", "Borrowed", "Lent"],
    loans.map(l => {
      return [
        l.instrument.instrumentId,
        l.instrument.instrumentType,
        fmt.value(l.loans.borrowed),
        fmt.value(l.loans.lent)
      ];
    })
  );
}
