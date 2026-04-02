import { Command } from "commander";
import { isJsonMode, printJson } from "../../../lib/output";
import { clearTokens } from "../../../lib/token-store";

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  clearTokens();

  if (isJsonMode(cmd)) {
    printJson({ loggedOut: true });
    return;
  }

  console.log("Logged out. Tokens cleared.");
}
