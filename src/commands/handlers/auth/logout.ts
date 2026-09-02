import { Command } from "commander";
import { refreshAccessToken, revokeConsent, revokeToken } from "../../../lib/auth-flow";
import { clearCustomer } from "../../../lib/customer-store";
import { isJsonMode, printJson, success } from "../../../lib/output";
import { clearEnterpriseCache, clearUserInfoCache } from "../../../lib/resolve-enterprise";
import { clearTokens, loadTokens } from "../../../lib/token-store";

// Server-side revoke, then clear local. Client-scoped consent revoke is the real kill:
// drops access + refresh tokens + activity entry, spares the shared login session.
async function revokeServerSide(): Promise<Error | null> {
  let tokens = loadTokens();
  if (!tokens) return null;

  // Ensure a valid access token for consent revocation (introspect rejects expired tokens).
  const now = Math.floor(Date.now() / 1000);
  if (tokens.expires_at - now < 60 && tokens.refresh_token) {
    try {
      tokens = await refreshAccessToken(tokens.refresh_token);
    } catch {
      // Proceed with the potentially expired token.
    }
  }

  try {
    await revokeConsent(tokens.access_token);
  } catch (err) {
    // Backstop: consent endpoint (pafinUrl) is down but Hydra (different host) may be up, so
    // revoke the refresh token directly. Best-effort; surface the original consent error.
    if (tokens.refresh_token) {
      await revokeToken(tokens.refresh_token).catch(() => {});
    }
    return err instanceof Error ? err : new Error(String(err));
  }

  return null;
}

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const revocationError = await revokeServerSide();

  clearTokens();
  clearCustomer();
  clearEnterpriseCache();
  clearUserInfoCache();

  if (revocationError) {
    console.error(
      "Warning: local tokens were cleared, but server-side session revocation failed. Retry logout to revoke the server-side session."
    );
    process.exitCode = 1;
  }

  if (isJsonMode(cmd)) {
    printJson({ loggedOut: true });
  } else if (!revocationError) {
    success("Logged out. Tokens cleared.");
  }
}
