import { Command } from "commander";
import type { WalletListResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { isJsonMode, printJson, printTable } from "../../../lib/output";

export async function handler({
  ledgerId,
  cmd
}: {
  ledgerId: string;
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const data = await apiGet<WalletListResponse>(`/exchange-api/defi/address?ledgerId=${ledgerId}`);

  const addresses = data.addresses || [];

  if (isJsonMode(cmd)) {
    printJson(addresses);
    return;
  }

  printTable(
    ["Chain", "Address", "Memo"],
    addresses.map(a => [a.chain, a.address, a.memo || "-"])
  );
}
