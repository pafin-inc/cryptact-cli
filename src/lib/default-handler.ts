import type { Command } from "commander";
import type { CommandDef } from "../cli-spec";
import { dispatch } from "./dispatcher";
import { CliError, exitCodeForError } from "./errors";
import { formatResponse } from "./format-response";
import { error } from "./output";
import { getHook, type HookContext } from "./runtime-hooks";

/**
 * Default handler pipeline: call → extract → print.
 * Each phase is overridable via the runtime hook registry in `runtime-hooks.ts`.
 */
export async function runCommand(ctx: HookContext): Promise<void> {
  const hook = getHook(ctx.cmdDef);

  try {
    if (hook?.handler) {
      await hook.handler(ctx);
      return;
    }

    const raw = hook?.call ? await hook.call(ctx, ctx.flags) : await dispatch(ctx);
    const extracted = hook?.extract ? hook.extract(raw, ctx) : raw;
    if (hook?.print) {
      hook.print(extracted, ctx);
    } else {
      formatResponse(extracted, ctx.cmd);
    }
  } catch (err) {
    error(err instanceof Error ? err.message : String(err));
    // Typed CLI errors carry a user-facing message; a stack only helps for bugs.
    if (!(err instanceof CliError) && err instanceof Error && err.stack) {
      process.stderr.write(`${err.stack}\n`);
    }
    // Not process.exit: that truncates piped output past the 64KiB buffer.
    process.exitCode = exitCodeForError(err);
  }
}

/** Walk up the Commander parent chain looking for an option value. */
export function lookupParentOption(cmd: Command, name: string): string | undefined {
  let current: Command | null = cmd;
  while (current) {
    const val = current.opts()[name];
    if (val !== undefined) return val as string;
    current = current.parent;
  }
  return undefined;
}

export type { CommandDef };
