import { Command } from "commander";
import type { WalletDeleteOptions } from "../../../cli-spec";
import { apiDelete } from "../../../lib/api-client";
import { isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: WalletDeleteOptions;
  cmd: Command;
}): Promise<void> {
  const data = await apiDelete<Record<string, unknown>>("/exchange-api/defi/address", {
    ledgerId,
    chain: options.chain,
    address: options.address
  });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  success(`Wallet address removed: ${options.chain} ${options.address}`);
}
