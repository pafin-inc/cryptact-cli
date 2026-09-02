/** Single ledger per account, derived from the id token. Customer-aware paths are enterprise-only. */
import { apiPost } from "./api-client";
import { UsageError } from "./errors";
import { loadTokens } from "./token-store";

interface LedgerSearchResult {
  ledgerId: string;
  customerName: string | null;
  email: string | null;
}

interface LedgerSearchResponse {
  results: LedgerSearchResult[];
  total: number;
}

function getUserGuidFromIdToken(): string {
  const tokens = loadTokens();
  if (!tokens?.id_token) {
    throw new Error("No id_token found. Run `cryptact auth login` first.");
  }
  const parts = tokens.id_token.split(".");
  const payload = parts[1];
  if (!payload) {
    throw new Error("Malformed id_token. Run `cryptact auth login` to re-authenticate.");
  }
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
  if (!decoded.sub) {
    throw new Error("Could not determine user identity from token.");
  }
  return decoded.sub as string;
}

export async function resolveLedgerId(customerGuidOverride?: string): Promise<string> {
  // `--customer` is enterprise-only — fail loudly instead of silently falling
  // back to the caller's own ledger.
  if (customerGuidOverride) {
    throw new UsageError("--customer is not supported in this build (single personal ledger).");
  }
  const userguid = getUserGuidFromIdToken();
  const data = await apiPost<LedgerSearchResponse>("/ledger/search", {
    filter: { userguid, orgId: null },
    offset: 0
  });

  if (data.results.length === 0) {
    throw new Error("No ledger found for your account.");
  }

  if (data.results.length > 1) {
    const list = data.results
      .map(r => `  ${r.ledgerId} (${r.email || r.customerName || "unknown"})`)
      .join("\n");
    throw new Error(
      `Multiple ledgers found. This CLI is for personal accounts with a single ledger.\n${list}`
    );
  }

  return data.results[0].ledgerId;
}
