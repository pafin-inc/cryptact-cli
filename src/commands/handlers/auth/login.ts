import { Command } from "commander";
import { login } from "../../../lib/auth-flow";
import { isJsonMode, printJson } from "../../../lib/output";

export async function handler({
  cmd
}: {
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  await login();

  if (isJsonMode(cmd)) {
    printJson({ authenticated: true });
  }
}
