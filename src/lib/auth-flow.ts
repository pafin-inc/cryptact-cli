import * as crypto from "crypto";
import * as http from "http";
import type * as net from "net";
import { getConfig } from "./config";
import { info, success } from "./output";
import { StoredTokens, saveTokens } from "./token-store";

function base64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function generatePkce(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(crypto.createHash("sha256").update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

interface AuthCodeResult {
  code: string;
  state: string;
}

function startCallbackServer(expectedState: string): Promise<{
  redirectUri: string;
  result: Promise<AuthCodeResult>;
}> {
  return new Promise((resolve, reject) => {
    let listenPort = 0;
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || "/", `http://127.0.0.1:${listenPort}`);
      if (url.pathname !== "/callback") {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const config = getConfig();
      const resultUrl = new URL("/cli/login-result", config.pafinUrl);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) {
        resultUrl.searchParams.set("status", "error");
        res.writeHead(302, { Location: resultUrl.toString() });
        res.end();
        server.close();
        rejectResult(new Error(`OAuth error: ${error}`));
        return;
      }

      if (!code || state !== expectedState) {
        resultUrl.searchParams.set("status", "error");
        res.writeHead(302, { Location: resultUrl.toString() });
        res.end();
        server.close();
        rejectResult(new Error("Invalid OAuth callback: missing code or state mismatch"));
        return;
      }

      resultUrl.searchParams.set("status", "success");
      res.writeHead(302, { Location: resultUrl.toString() });
      res.end();
      server.close();
      resolveResult({ code, state });
    });

    let resolveResult: (value: AuthCodeResult) => void;
    let rejectResult: (reason: Error) => void;
    const result = new Promise<AuthCodeResult>((res, rej) => {
      resolveResult = res;
      rejectResult = rej;
    });

    // Bind to port 0 so the OS assigns a random free port (RFC 8252 §7.3)
    server.listen(0, "127.0.0.1", () => {
      listenPort = (server.address() as net.AddressInfo).port;
      resolve({ redirectUri: `http://127.0.0.1:${listenPort}/callback`, result });
    });

    // Timeout after 2 minutes
    const timeout = setTimeout(() => {
      server.close();
      rejectResult(new Error("Login timed out after 2 minutes"));
    }, 120_000);

    // Don't let the timer keep the process alive on its own
    timeout.unref();

    server.on("error", err => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start callback server: ${err.message}`));
    });
  });
}

async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<StoredTokens> {
  const config = getConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
    code_verifier: codeVerifier
  });

  const res = await fetch(`${config.hydraHost}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    id_token?: string;
  };

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    id_token: data.id_token
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<StoredTokens> {
  const config = getConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: config.clientId
  });

  const res = await fetch(`${config.hydraHost}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    id_token?: string;
  };

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    id_token: data.id_token
  };
}

export async function login(): Promise<void> {
  const config = getConfig();
  const { codeVerifier, codeChallenge } = generatePkce();
  const state = base64url(crypto.randomBytes(16));

  const { redirectUri, result: callbackPromise } = await startCallbackServer(state);

  const authUrl = new URL(`${config.hydraHost}/oauth2/auth`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "openid offline");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  info("Opening browser for login...");
  // Dynamic import for ESM-only `open` package
  const open = (await import("open")).default;
  await open(authUrl.toString());
  info("If the browser didn't open, visit:\n" + authUrl.toString());

  const { code } = await callbackPromise;
  info("Received authorization code, exchanging for tokens...");

  const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri);
  saveTokens(tokens);
  success("Login successful! Tokens saved.");
}
