import { refreshAccessToken } from "./auth-flow";
import { getConfig, version } from "./config";
import { loadTokens, saveTokens, StoredTokens } from "./token-store";

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
    throw new Error("Not logged in. Run `cryptact auth login` first.");
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokens.expires_at - now < 60) {
    // Token is about to expire, refresh it
    let refreshed: StoredTokens;
    try {
      refreshed = await refreshAccessToken(tokens.refresh_token);
    } catch {
      throw new Error(
        "Session expired and refresh failed. Run `cryptact auth login` to re-authenticate."
      );
    }
    saveTokens(refreshed);
    return refreshed.access_token;
  }

  return tokens.access_token;
}

async function apiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const config = getConfig();
  const token = await getValidToken();

  const url = `${config.apiUrl}${path}`;
  const headers: Record<string, string> = {
    Authorization: token,
    "X-Cryptact-Client": `cryptact-cli:v${version}`,
    "Content-Type": "application/json"
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed (${res.status} ${method} ${path}): ${text}`);
  }

  if (res.status === 204) return {} as unknown as T;

  const data = await res.json();
  if (isApiError(data)) {
    const errCode = data.error?.code || "UNKNOWN";
    throw new Error(`API error: ${errCode}`);
  }

  return data as T;
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
