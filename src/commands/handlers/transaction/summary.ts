import { Command } from "commander";
import type { TransactionSummaryResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, printTable } from "../../../lib/output";

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

  const data = await apiPost<TransactionSummaryResponse>(`/transaction/${uuid}/summary`, {
    ledgerId,
    transactionId: uuid
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const summaries = data.summaries || [];
  if (summaries.length === 0) {
    console.log("No summary data available.");
    return;
  }

  printTable(
    ["Instrument", "Type", "Change", "Position"],
    summaries.map(s => [s.instrument.instrumentId, s.instrument.instrumentType, s.chg, s.position])
  );
}
