import { Command } from "commander";
import type { TransactionBalanceSummaryResponse } from "../../../cli-spec";
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

  const data = await apiPost<TransactionBalanceSummaryResponse>(
    `/transaction/${uuid}/balance-summary`,
    { ledgerId, transactionId: uuid }
  );

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const balance = data.balance as
    | {
        changes?: {
          type: string;
          instrument: { instrumentId: string };
          wallet: string;
          change: string;
          changeInRc: string;
          balance: string;
        }[];
      }
    | undefined;
  const changes = balance?.changes || [];
  if (changes.length === 0) {
    console.log("No balance changes.");
    return;
  }

  printTable(
    ["Type", "Instrument", "Wallet", "Change", "Change (RC)", "Balance"],
    changes.map(c => [
      c.type,
      c.instrument.instrumentId,
      c.wallet,
      displayValue(c.change),
      displayValue(c.changeInRc),
      displayValue(c.balance)
    ])
  );
}
