import { Command } from "commander";
import type { ExchangeKeyAddOptions } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { error, isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: ExchangeKeyAddOptions;
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
    publicKey: options.publicKey,
    privateKey: options.privateKey,
    passphrase: options.passphrase || "",
    subAccount: options.subAccount || "",
    endpoints
  };

  const data = await apiPost<Record<string, unknown>>("/exchange-api/exchange/key", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  success(`API key registered for ${options.exchange}.`);
}
