import { Command } from "commander";
import type { TransactionShowOptions, TransactionShowResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { fmt, isJsonMode, printJson, printKeyValue } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  args,
  cmd
}: {
  ledgerId: string;
  options: TransactionShowOptions;
  args: { uuid: string };
  cmd: Command;
}): Promise<void> {
  const { uuid } = args;
  const data = await apiPost<TransactionShowResponse>(`/transaction/${uuid}`, {
    ledgerId,
    transactionId: uuid,
    transactionType: (options.type as string) || "processed"
  });

  if (isJsonMode(cmd)) {
    printJson(data.detail);
    return;
  }

  const d = data.detail;
  printKeyValue([
    ["Date", d.ts],
    ["Action", d.act],
    ["Base", d.bc],
    ["Counter", d.cc],
    ["Pair", fmt.pair(d.pair)],
    ["Volume", fmt.value(d.vol)],
    ["Price", fmt.value(d.prc)],
    ["Fee", `${fmt.value(d.fee)} ${d.fc}`],
    ["Source", d.src],
    ["Comment", d.comment || ""]
  ]);
}
