import { Command } from "commander";
import type { WalletUpdateOptions } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: WalletUpdateOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = {
    ledgerId,
    chain: options.chain,
    address: options.address
  };
  if (options.memo) body.memo = options.memo;

  const data = await apiPost<Record<string, unknown>>("/exchange-api/defi/address-update", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  console.log(`Wallet address updated: ${options.chain} ${options.address}`);
}
