import type { UserInfoReceive } from "../cli-spec";
import { apiGet } from "./api-client";

// ---------------------------------------------------------------------------
// Shared /user/info cache (module-level, lives for one command invocation)
// ---------------------------------------------------------------------------

let cachedUserInfo: UserInfoReceive | undefined;

export async function getUserInfo(): Promise<UserInfoReceive> {
  if (cachedUserInfo) return cachedUserInfo;
  cachedUserInfo = await apiGet<UserInfoReceive>("/user/info");
  return cachedUserInfo;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function assertNotEnterprise(): Promise<void> {
  const info = await getUserInfo();
  if (info.role === "Enterprise") {
    throw new Error(
      "Billing is managed at the organization level and is not available for enterprise accounts."
    );
  }
}
