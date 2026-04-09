import { Command } from "commander";
import { fmt, isJsonMode, printJson, printKeyValue, warn } from "../../../lib/output";
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
      warn("Not logged in. Run `cryptact auth login` to authenticate.");
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
      ["Authenticated", fmt.bool(true)],
      ["Token", "expired (will auto-refresh on next request)"]
    ]);
  } else {
    const minutes = Math.floor(expiresIn / 60);
    printKeyValue([
      ["Authenticated", fmt.bool(true)],
      ["Token expires in", `${minutes} minutes`]
    ]);
  }
}
