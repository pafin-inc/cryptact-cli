import { Command } from "commander";
import type {
  TransactionExcludeOptions,
  TransactionExcludeResponse,
  TransactionShowResponse
} from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  args,
  cmd
}: {
  ledgerId: string;
  options: TransactionExcludeOptions;
  args: { uuid: string };
  cmd: Command;
}): Promise<void> {
  const { uuid } = args;
  const action = options.undo ? "unexclude" : "exclude";

  // Preflight: fetch transaction to get ts
  const current = await apiPost<TransactionShowResponse>(`/transaction/${uuid}`, {
    ledgerId,
    transactionId: uuid,
    transactionType: "processed"
  });

  const data = await apiPost<TransactionExcludeResponse>(`/transaction/${uuid}/${action}`, {
    ledgerId,
    transaction: { uuid, ts: current.detail.ts }
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  success(`Transaction ${uuid} ${action === "exclude" ? "excluded" : "re-included"}.`);
}
