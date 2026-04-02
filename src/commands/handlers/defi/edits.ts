import { Command } from "commander";
import type { DefiEditsOptions, DefiEditsResponse } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: DefiEditsOptions;
  cmd: Command;
}): Promise<void> {
  const chains = (options.chains as string).split(",").map(c => c.trim());

  const data = await apiPost<DefiEditsResponse>("/defi/user-edit/search", {
    ledgerId,
    chains
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const edits = data.userEdits || {};
  const entries = Object.entries(edits);
  if (entries.length === 0) {
    console.log("No user edits found.");
    return;
  }

  for (const [key, status] of entries) {
    console.log(`${key}: ${status}`);
  }
}
