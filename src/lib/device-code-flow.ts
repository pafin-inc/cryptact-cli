import { getConfig } from "./config";
import { info, success } from "./output";
import { StoredTokens, saveTokens } from "./token-store";

// ─── Types ──────────────────────────────────────────────────────────────────

interface DeviceAuthResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in: number;
  interval?: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  id_token?: string;
}

interface DeviceCodeErrorResponse {
  error: string;
  error_description?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_POLL_INTERVAL_SEC = 5;
/** RFC 8628 §3.5: increase interval by this many seconds on slow_down. */
const SLOW_DOWN_INCREMENT_SEC = 5;
/** Cap poll interval to ensure auth can complete within the TTL window. */
const MAX_POLL_INTERVAL_SEC = 15;

// ─── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function openBrowser(url: string): Promise<void> {
  try {
    const open = (await import("open")).default;
    await open(url);
  } catch {
    info(`Open this URL in your browser: ${url}`);
  }
}

// ─── Core functions ─────────────────────────────────────────────────────────

/**
 * Request a device code from pafin.co's device code endpoint.
 * This is a custom implementation since Hydra v2.3.0 OSS does not
 * support the device authorization grant natively.
 */
async function requestDeviceCode(): Promise<DeviceAuthResponse> {
  const config = getConfig();
  const res = await fetch(`${config.pafinUrl}/api/device/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to request device code (${res.status}): ${text}`);
  }

  return (await res.json()) as DeviceAuthResponse;
}

/**
 * Poll pafin.co's device token endpoint until the user authorizes,
 * the code expires, or authorization is denied.
 */
async function pollForToken(
  deviceCode: string,
  interval: number,
  expiresIn: number
): Promise<TokenResponse> {
  const config = getConfig();
  const tokenUrl = `${config.pafinUrl}/api/device/token`;
  const deadline = Date.now() + expiresIn * 1000;
  let pollInterval = interval;

  while (Date.now() < deadline) {
    await sleep(pollInterval * 1000);

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ device_code: deviceCode }).toString()
    });

    if (res.ok) {
      return (await res.json()) as TokenResponse;
    }

    const errorBody = (await res.json().catch(() => null)) as DeviceCodeErrorResponse | null;
    const errorCode = errorBody?.error;

    switch (errorCode) {
      case "authorization_pending":
        continue;
      case "slow_down":
        pollInterval = Math.min(pollInterval + SLOW_DOWN_INCREMENT_SEC, MAX_POLL_INTERVAL_SEC);
        continue;
      case "access_denied":
        throw new Error("Authorization was denied by the user.");
      case "expired_token":
        throw new Error("Device code expired before authorization was completed.");
      default:
        throw new Error(
          `Unexpected error during device code polling: ${errorCode ?? res.statusText}`
        );
    }
  }

  throw new Error("Device code expired before authorization was completed.");
}

export async function deviceCodeLogin(): Promise<void> {
  const deviceAuth = await requestDeviceCode();

  info(`Your one-time code: ${deviceAuth.user_code}`);

  // Start polling immediately — the user may authorize by clicking the
  // printed link (or from another machine) before ever pressing Enter here.
  const tokenPromise = pollForToken(
    deviceAuth.device_code,
    deviceAuth.interval ?? DEFAULT_POLL_INTERVAL_SEC,
    deviceAuth.expires_in
  );

  // Prefer the URL with the code pre-filled (RFC 8628 §3.3.1) so the user
  // lands on a page that already has their code, skipping the manual entry.
  const browserUrl = deviceAuth.verification_uri_complete ?? deviceAuth.verification_uri;

  if (process.stdin.isTTY) {
    info(`Press Enter to open ${browserUrl} in your browser...`);
    const onEnter = (): void => {
      void openBrowser(browserUrl);
    };
    process.stdin.once("data", onEnter);
    // unref so stdin doesn't keep the event loop alive after auth completes
    // without the user ever pressing Enter.
    process.stdin.unref();
    tokenPromise
      .finally(() => process.stdin.removeListener("data", onEnter))
      .catch(() => undefined);
  } else {
    info(`Open this URL in your browser: ${browserUrl}`);
  }

  info("Waiting for authorization...");

  const tokenResponse = await tokenPromise;

  const tokens: StoredTokens = {
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
    id_token: tokenResponse.id_token
  };

  saveTokens(tokens);
  success("Login successful! Tokens saved.");
}
