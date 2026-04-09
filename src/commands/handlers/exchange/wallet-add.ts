import { Command } from "commander";
import type { WalletAddOptions } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: WalletAddOptions;
  cmd: Command;
}): Promise<void> {
  const body: Record<string, unknown> = {
    ledgerId,
    chain: options.chain,
    address: options.address
  };
  if (options.memo) body.memo = options.memo;

  const data = await apiPost<Record<string, unknown>>("/exchange-api/defi/address", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  success(`Wallet address added: ${options.chain} ${options.address}`);
}
