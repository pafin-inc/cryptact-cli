import { Command } from "commander";
import type { WalletAddMultiOptions } from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { isJsonMode, printJson, success } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: WalletAddMultiOptions;
  cmd: Command;
}): Promise<void> {
  const chains = (options.chains as string).split(",").map(c => c.trim());

  const body: Record<string, unknown> = {
    ledgerId,
    chains,
    address: options.address
  };
  if (options.memo) body.memo = options.memo;

  const data = await apiPost<Record<string, unknown>>("/exchange-api/defi/address-multi", body);

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  success(`Wallet address added to ${chains.length} chain(s): ${chains.join(", ")}`);
}
