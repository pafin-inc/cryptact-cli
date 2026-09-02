import { refreshAccessToken } from "./auth-flow";
import { getConfig, version } from "./config";
import { ApiError, AuthError, NetworkError, RateLimitError } from "./errors";
import { loadTokens, StoredTokens, saveTokens } from "./token-store";

type ApiErrorResponse = {
  success: false;
  error: { code: string; params?: Record<string, unknown> };
};

function isApiError(data: unknown): data is ApiErrorResponse {
  return typeof data === "object" && data !== null && (data as ApiErrorResponse).success === false;
}

async function getValidToken(): Promise<string> {
  const tokens = loadTokens();
  if (!tokens) {
    throw new AuthError("Not logged in. Run `cryptact auth login` first.");
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokens.expires_at - now < 60) {
    // Token is about to expire, refresh it
    let refreshed: StoredTokens;
    try {
      refreshed = await refreshAccessToken(tokens.refresh_token);
    } catch {
      throw new AuthError(
        "Session expired and refresh failed. Run `cryptact auth login` to re-authenticate."
      );
    }
    // Hydra may omit `id_token` on a refresh response; keep the previous one so
    // the `sub`-derived defaults (`ownUserguid`, enterprise lookup) survive a refresh.
    const merged: StoredTokens = { ...refreshed, id_token: refreshed.id_token ?? tokens.id_token };
    saveTokens(merged);
    return merged.access_token;
  }

  return tokens.access_token;
}

/** GET retries on transient failures (network error / 5xx / 429). */
const READ_RETRIES = 2;
const RETRY_DELAY_MS = [300, 1000];

async function requestOnce<T>(method: string, path: string, body?: unknown): Promise<T> {
  const config = getConfig();
  const token = await getValidToken();

  const url = `${config.apiUrl}${path}`;
  const headers: Record<string, string> = {
    Authorization: token,
    "X-Cryptact-Client": `cryptact-cli:v${version}`,
    "Content-Type": "application/json"
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (err) {
    throw new NetworkError(
      `Could not reach the API (${method} ${path}): ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (!res.ok) {
    const text = await res.text();
    const message = `API request failed (${res.status} ${method} ${path}): ${text}`;
    // 401 only: the session is bad and `auth login` fixes it. A 403 means the
    // account lacks permission — re-logging in changes nothing, so it stays an
    // ApiError.
    if (res.status === 401) throw new AuthError(message);
    if (res.status === 429) throw new RateLimitError(message);
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return {} as unknown as T;

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    // Proxy error page or empty body — not an API response. NetworkError, not
    // ApiError: isRetryable() gates on `status >= 500`, so a 2xx ApiError never retries.
    throw new NetworkError(`API returned a non-JSON body (${res.status} ${method} ${path})`);
  }
  if (isApiError(data)) {
    const errCode = data.error?.code || "UNKNOWN";
    throw new ApiError(`API error: ${errCode}`, res.status);
  }

  return data as T;
}

function isRetryable(err: unknown): boolean {
  if (err instanceof NetworkError) return true;
  if (err instanceof RateLimitError) return true;
  if (err instanceof ApiError) return err.status >= 500;
  return false;
}

/**
 * Reads (GET) retry transient failures. Mutations (POST/PUT/DELETE) are sent
 * exactly once: a timed-out mutation may still have been applied server-side,
 * and retrying it could duplicate the write. Callers decide, not the client.
 */
async function apiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (method !== "GET") {
    return requestOnce<T>(method, path, body);
  }
  let lastError: unknown;
  for (let attempt = 0; attempt <= READ_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS[attempt - 1]));
    }
    try {
      return await requestOnce<T>(method, path, body);
    } catch (err) {
      if (!isRetryable(err)) throw err;
      lastError = err;
    }
  }
  throw lastError;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>("GET", path);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>("POST", path, body);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>("PUT", path, body);
}

export async function apiDelete<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>("DELETE", path, body);
}
