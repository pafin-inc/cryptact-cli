import { Command } from "commander";
import type { TransactionDeleteResponse } from "../../../cli-spec";
import { apiDelete } from "../../../lib/api-client";
import { isJsonMode, printJson } from "../../../lib/output";

export async function handler({
  ledgerId,
  args,
  cmd
}: {
  ledgerId: string;
  options: Record<string, unknown>;
  args: { uuid: string };
  cmd: Command;
}): Promise<void> {
  const { uuid } = args;

  const data = await apiDelete<TransactionDeleteResponse>("/transaction", {
    ledgerId,
    transactions: [uuid]
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  console.log(`Transaction ${uuid} deleted.`);
}
