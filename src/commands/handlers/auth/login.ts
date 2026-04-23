import { Command } from "commander";
import { login } from "../../../lib/auth-flow";
import { isJsonMode, printJson } from "../../../lib/output";

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

  if (isJsonMode(cmd)) {
    printJson({ authenticated: true, method: options.deviceCode ? "device_code" : "pkce" });
  }
}
