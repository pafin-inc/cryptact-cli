import { Command } from "commander";
import type { ExchangeKeyUpdateOptions, ExchangeKeyUpdateResponse } from "../../../cli-spec";
import { apiPut } from "../../../lib/api-client";
import { error, isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: ExchangeKeyUpdateOptions;
  cmd: Command;
}): Promise<void> {
  let parsed: { endpoint: string; startTimestampMs?: number }[];
  try {
    parsed = JSON.parse(options.endpoints as string);
  } catch {
    error("--endpoints must be valid JSON.");
    process.exit(1);
  }
  const endpoints = parsed.map(e => ({
    endpoint: e.endpoint,
    startTimestampMs: e.startTimestampMs ?? 0,
    isFromFiles: false
  }));

  const body: Record<string, unknown> = {
    ledgerId,
    exchange: options.exchange,
    subAccount: options.subAccount || "",
    endpoints
  };

  const data = await apiPut<ExchangeKeyUpdateResponse>("/exchange-api/exchange/key", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  success(`API key updated for ${options.exchange}.`);
}
