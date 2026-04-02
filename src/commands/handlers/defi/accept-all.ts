import { Command } from "commander";
import type { DefiAcceptAllOptions } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: DefiAcceptAllOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = { ledgerId };
  if (options.startTime) body.startTime = parseInt(options.startTime as string, 10);
  if (options.endTime) body.endTime = parseInt(options.endTime as string, 10);
  if (options.chainFamily) body.chainFamily = options.chainFamily;

  await apiPost<Record<string, unknown>>("/defi/user-edit/accept-all-suggestions", body);

  if (isJsonMode(cmd)) {
    printJson({ ok: true });
    return;
  }

  console.log("All suggestions accepted.");
}
