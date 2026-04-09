import { Command } from "commander";
import type { ExchangeProcessingStatusResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { fmt, isJsonMode, printJson, printKeyValue } from "../../../lib/output";

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const data = await apiGet<ExchangeProcessingStatusResponse>("/exchange-api/processing-status");

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  printKeyValue([["Processing Status", fmt.state(data.processingStatus)]]);
}
