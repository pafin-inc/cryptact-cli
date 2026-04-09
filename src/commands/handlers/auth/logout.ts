import { Command } from "commander";
import { isJsonMode, printJson, success } from "../../../lib/output";
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

  success("Logged out. Tokens cleared.");
}
