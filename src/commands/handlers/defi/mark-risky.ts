import { Command } from "commander";
import type { DefiMarkRiskyOptions } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: DefiMarkRiskyOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = {
    ledgerId,
    action: options.action
  };
  if (options.startTime) body.startTime = parseInt(options.startTime as string, 10);
  if (options.endTime) body.endTime = parseInt(options.endTime as string, 10);
  if (options.chainFamily) body.chainFamily = options.chainFamily;

  await apiPost<Record<string, unknown>>("/defi/user-edit/mark-risky", body);

  if (isJsonMode(cmd)) {
    printJson({ ok: true });
    return;
  }

  success("Unclassified transactions marked as risky.");
}
