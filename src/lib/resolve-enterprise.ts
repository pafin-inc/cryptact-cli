/**
 * `getUserInfo` cache (in-process plus on-disk) and a no-op
 * `clearEnterpriseCache` so auth/logout and resolve-ledger can call it
 * unconditionally. Customer-aware context is enterprise-only.
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { apiGet } from "./api-client";
import { UsageError } from "./errors";
import { ownUserguid } from "./token-store";

interface UserInfoReceive {
  role: string;
}

/** Disk entry is keyed by the token's `sub` so a re-login as another user never reuses it. */
interface UserInfoCache extends UserInfoReceive {
  sub: string;
  /** Epoch ms the entry was written; entries expire so a role change propagates. */
  at?: number;
}

/** A role change otherwise only lands on re-login. */
const USER_INFO_TTL_MS = 15 * 60 * 1000;

const CONFIG_DIR = path.join(os.homedir(), ".config", "cryptact-cli");
const USER_INFO_FILE = path.join(CONFIG_DIR, "userinfo.json");

let cachedUserInfo: UserInfoReceive | undefined;

function readUserInfoCache(): UserInfoCache | null {
  try {
    return JSON.parse(fs.readFileSync(USER_INFO_FILE, "utf-8")) as UserInfoCache;
  } catch {
    return null;
  }
}

function writeUserInfoCache(entry: UserInfoCache): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(USER_INFO_FILE, JSON.stringify(entry, null, 2), { mode: 0o600 });
}

export function clearUserInfoCache(): void {
  cachedUserInfo = undefined;
  try {
    fs.unlinkSync(USER_INFO_FILE);
  } catch {
    // file doesn't exist — nothing to clear
  }
}

export async function getUserInfo(): Promise<UserInfoReceive> {
  if (cachedUserInfo) return cachedUserInfo;

  const sub = ownUserguid();
  if (sub) {
    const cached = readUserInfoCache();
    if (cached?.sub === sub && Date.now() - (cached.at ?? 0) < USER_INFO_TTL_MS) {
      cachedUserInfo = { role: cached.role };
      return cachedUserInfo;
    }
  }

  cachedUserInfo = await apiGet<UserInfoReceive>("/user/info");
  if (sub) writeUserInfoCache({ ...cachedUserInfo, sub, at: Date.now() });
  return cachedUserInfo;
}

export async function assertNotEnterprise(): Promise<void> {
  const info = await getUserInfo();
  if (info.role === "Enterprise") {
    throw new Error(
      "Billing is managed at the organization level and is not available for enterprise accounts."
    );
  }
}

export function clearEnterpriseCache(): void {
  cachedUserInfo = undefined;
}

/**
 * Present so the shared `index.ts` compiles: every route that injects an orgId
 * is enterprise-only and stripped from this build, so this is unreachable.
 */
export async function resolveEnterpriseContext(): Promise<{ orgId: number }> {
  throw new UsageError("Organization commands are not available in this build.");
}
