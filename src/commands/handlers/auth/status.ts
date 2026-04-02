import { Command } from "commander";
import { isJsonMode, printJson, printKeyValue } from "../../../lib/output";
import { loadTokens } from "../../../lib/token-store";

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const tokens = loadTokens();
  if (!tokens) {
    if (isJsonMode(cmd)) {
      printJson({ authenticated: false });
    } else {
      console.log("Not logged in. Run `cryptact auth login` to authenticate.");
    }
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = tokens.expires_at - now;
  const expired = expiresIn <= 0;

  if (isJsonMode(cmd)) {
    printJson({
      authenticated: true,
      expired,
      expires_at: tokens.expires_at,
      expires_in_seconds: Math.max(0, expiresIn)
    });
  } else if (expired) {
    printKeyValue([
      ["Authenticated", "yes"],
      ["Token", "expired (will auto-refresh on next request)"]
    ]);
  } else {
    const minutes = Math.floor(expiresIn / 60);
    printKeyValue([
      ["Authenticated", "yes"],
      ["Token expires in", `${minutes} minutes`]
    ]);
  }
}
