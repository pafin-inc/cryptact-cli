import { Command } from "commander";
import type {
  TransactionEditOptions,
  TransactionEditResponse,
  TransactionShowResponse
} from "../../../cli-spec";
import { apiPost, apiPut } from "../../../lib/api-client";
import { isJsonMode, printJson } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  args,
  cmd
}: {
  ledgerId: string;
  options: TransactionEditOptions;
  args: { uuid: string };
  cmd: Command;
}): Promise<void> {
  const { uuid } = args;

  const overrides: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined) overrides[key] = value;
  }

  if (Object.keys(overrides).length === 0) {
    console.error("Error: at least one field flag is required.");
    process.exit(1);
  }

  // Fetch current transaction, merge overrides
  const current = await apiPost<TransactionShowResponse>(`/transaction/${uuid}`, {
    ledgerId,
    transactionId: uuid,
    transactionType: "processed"
  });

  const d = current.detail;
  const transaction: Record<string, unknown> = { ...d, uuid, ...overrides };

  const result = await apiPut<TransactionEditResponse>(`/transaction/${uuid}`, {
    ledgerId,
    transaction
  });

  if (isJsonMode(cmd)) {
    printJson({ transactionId: result.transactionId });
    return;
  }

  console.log(`Transaction ${result.transactionId} updated.`);
}
