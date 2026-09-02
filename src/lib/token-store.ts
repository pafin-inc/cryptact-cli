import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix epoch seconds
  id_token?: string;
}

const TOKEN_DIR = path.join(os.homedir(), ".config", "cryptact-cli");
const TOKEN_FILE = path.join(TOKEN_DIR, "tokens.json");

export function loadTokens(): StoredTokens | null {
  try {
    const content = fs.readFileSync(TOKEN_FILE, "utf-8");
    return JSON.parse(content) as StoredTokens;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: StoredTokens): void {
  fs.mkdirSync(TOKEN_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), {
    mode: 0o600
  });
}

/** Own userguid from the id_token `sub` claim, or null when not logged in. */
export function ownUserguid(): string | null {
  const payload = loadTokens()?.id_token?.split(".")[1];
  if (!payload) return null;
  try {
    const { sub } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { sub?: string };
    return sub ?? null;
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  try {
    fs.unlinkSync(TOKEN_FILE);
  } catch {
    // file doesn't exist — nothing to clear
  }
}
