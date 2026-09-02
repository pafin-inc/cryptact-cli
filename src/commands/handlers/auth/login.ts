import { Command } from "commander";
import { login } from "../../../lib/auth-flow";
import { clearCustomer } from "../../../lib/customer-store";
import { isJsonMode, printJson } from "../../../lib/output";
import { clearEnterpriseCache, clearUserInfoCache } from "../../../lib/resolve-enterprise";

export async function handler({
  options,
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  if (options.deviceCode) {
    const { deviceCodeLogin } = await import("../../../lib/device-code-flow");
    await deviceCodeLogin();
  } else {
    await login();
  }

  // A fresh login may be a different account: drop the prior account's cached
  // orgId / selected customer so they aren't reused (logout clears them too).
  clearCustomer();
  clearEnterpriseCache();
  clearUserInfoCache();

  if (isJsonMode(cmd)) {
    printJson({ authenticated: true, method: options.deviceCode ? "device_code" : "pkce" });
  }
}
