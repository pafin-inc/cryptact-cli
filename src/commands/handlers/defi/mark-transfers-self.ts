import { Command } from "commander";
import type { DefiMarkTransfersSelfOptions } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: DefiMarkTransfersSelfOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = { ledgerId };
  if (options.startTime) body.startTime = parseInt(options.startTime as string, 10);
  if (options.chainFamily) body.chainFamily = options.chainFamily;

  await apiPost<Record<string, unknown>>("/defi/user-edit/mark-transfers-self", body);

  if (isJsonMode(cmd)) {
    printJson({ ok: true });
    return;
  }

  success("Unclassified transfers marked as self-transfers.");
}
