import { Command } from "commander";
import type { DefiDeleteEditOptions } from "../../../cli-spec";
import { apiDelete } from "../../../lib/api-client";
import { isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: DefiDeleteEditOptions;
  cmd: Command;
}): Promise<void> {
  const body = {
    ledgerId,
    transactions: [[options.chain, options.txHash]]
  };

  const data = await apiDelete<Record<string, unknown>>("/defi/user-edit", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  success(`Edit deleted for ${options.chain} ${options.txHash}.`);
}
