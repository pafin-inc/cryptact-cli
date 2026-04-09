import { Command } from "commander";
import type { DefiEditOptions, DefiEditResponse } from "../../../cli-spec";
import { apiPut } from "../../../lib/api-client";
import { isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: DefiEditOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = {
    ledgerId,
    transactions: [[options.chain, options.txHash]],
    action: options.action,
    transferType: options.transferType || null
  };

  const data = await apiPut<DefiEditResponse>("/defi/user-edit", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const edits = data.userEdits || [];
  success(`${edits.length} edit(s) applied.`);
}
