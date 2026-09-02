#!/usr/bin/env node
/**
 * Route-driven CLI entry point.
 *
 * Reads the auto-derived spec from `./cli-spec.ts`, wires every command into
 * Commander, and delegates execution to the default handler pipeline
 * (dispatch → format), with per-command overrides baked into the spec.
 *
 * A small set of non-route commands (auth login/logout/status, customer select,
 * exchange file-upload) are registered as "extras" below — they either are not
 * backed by a single route or need logic the generic dispatcher can't provide.
 */
import { Command } from "commander";
import { type CommandDef, spec } from "./cli-spec";
import { extraCommands } from "./extras";
import { type CompletionShell, generateCompletion } from "./lib/completions";
import { version } from "./lib/config";
import { lookupParentOption, runCommand } from "./lib/default-handler";
import { dispatch } from "./lib/dispatcher";
import { CliError, ExitCode, exitCodeForError, UsageError } from "./lib/errors";
import type { ExtraCommand } from "./lib/extras-types";
import { formatResponse } from "./lib/format-response";
import { parseFlags, shouldRefuseDestructive } from "./lib/option-parsing";
import { error, getOutputFormat } from "./lib/output";
import { resolveLedgerId } from "./lib/resolve-ledger";
import { getHook } from "./lib/runtime-hooks";
import { startUpdateCheck, waitForUpdateNotice } from "./lib/update-checker";

// A downstream consumer closing the pipe early (`cryptact … | head`) raises EPIPE
// on the next write: a normal end of output. Exit with the code the run already
// decided, so a failed command piped into `head` doesn't report success.
for (const stream of [process.stdout, process.stderr]) {
  stream.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EPIPE")
      process.exit(process.exitCode === undefined ? 0 : Number(process.exitCode));
    throw err;
  });
}

// ---------------------------------------------------------------------------
// Route-backed commands
// ---------------------------------------------------------------------------

/**
 * Walk every page of a paged route (`pagedRequestSchema` on the request, which
 * puts user filters under `filter` and the cursor under `offset` at the top level).
 * Aggregates `results`, keeps the final `total`, and hands the combined payload
 * to the override pipeline just like a single call.
 */
async function dispatchAllPages(ctx: {
  cmdDef: CommandDef;
  args: Record<string, string>;
  flags: Record<string, unknown>;
  ledgerId?: string;
  cmd: Command;
  maxPages?: number;
}): Promise<void> {
  interface PagedResponse {
    results: unknown[];
    total: number;
  }
  const combined: unknown[] = [];
  const startOffset = typeof ctx.flags.offset === "number" ? ctx.flags.offset : 0;
  let offset = startOffset;
  let total = 0;
  let pages = 0;
  let pageLen = 0;
  let lastPage: Record<string, unknown> = {};

  do {
    const flagsWithOffset = { ...ctx.flags, offset };
    const page = (await dispatch({ ...ctx, flags: flagsWithOffset })) as PagedResponse;
    lastPage = page as unknown as Record<string, unknown>;
    const results = page.results ?? [];
    pageLen = results.length;
    combined.push(...results);
    total = page.total ?? startOffset + combined.length;
    offset = startOffset + combined.length;
    pages += 1;
    if (ctx.maxPages !== undefined && pages >= ctx.maxPages) break;
  } while (startOffset + combined.length < total && pageLen > 0);

  // Keep the response envelope (`success`, echoed `filter`, …) so `--all --json`
  // has the same shape as a single page; only the paged fields are replaced.
  const aggregated = { ...lastPage, results: combined, total, offset: startOffset };

  const hook = getHook(ctx.cmdDef);
  const extracted = hook?.extract ? hook.extract(aggregated, ctx) : aggregated;
  if (hook?.print) {
    hook.print(extracted, ctx);
  } else {
    formatResponse(extracted, ctx.cmd);
  }
}

function registerRouteCommand(parent: Command, cmdDef: CommandDef): void {
  const c = new Command(cmdDef.name).description(cmdDef.description);
  for (const alias of cmdDef.aliases ?? []) c.alias(alias);

  for (const arg of cmdDef.arguments ?? []) {
    const expr = arg.required !== false ? `<${arg.name}>` : `[${arg.name}]`;
    c.argument(expr, arg.description);
  }

  for (const opt of cmdDef.options ?? []) {
    if (opt.required) c.requiredOption(opt.flag, opt.description);
    else c.option(opt.flag, opt.description);
  }

  // Paged routes get `--all` to auto-walk the offset-based pagination
  if (cmdDef.paged) {
    c.option("--all", "Fetch every page and return the combined result set");
    c.option("--max-pages <n>", "Cap the number of pages fetched with --all");
  }

  // Destructive commands refuse to run without an explicit go-ahead
  if (cmdDef.destructive) {
    c.option("--execute", "Actually perform this destructive operation (default: refuse)");
  }

  // Body/path keys use the original `:param` name even when the CLI-facing
  // argument was renamed via override (e.g. `action` for `:excludeOrUnexclude`).
  const argNames = (cmdDef.arguments ?? []).map(a => a.paramName ?? a.name);
  const options = cmdDef.options ?? [];
  const needsLedger = cmdDef.needsLedger === true;
  const paged = cmdDef.paged === true;

  c.action(async (...actionArgs: unknown[]) => {
    const args: Record<string, string> = {};
    for (let i = 0; i < argNames.length; i++) {
      args[argNames[i]] = actionArgs[i] as string;
    }
    const rawOptions = (actionArgs[argNames.length] as Record<string, unknown>) ?? {};
    const cmdRef = actionArgs[argNames.length + 1] as Command;

    const { flags, locals } = parseFlags(options, rawOptions);

    if (shouldRefuseDestructive(cmdDef, rawOptions)) {
      error(
        `Refusing to run destructive command '${cmdDef.name}' without --execute.\n` +
          `Re-run with --execute to proceed, or set CRYPTACT_CLI_NO_CONFIRM=1 to disable this guard.`
      );
      process.exitCode = ExitCode.BAD_PARAMS;
      return;
    }

    const ledgerId = needsLedger
      ? await resolveLedgerId(lookupParentOption(cmdRef, "customer"))
      : undefined;

    if (paged && rawOptions.all === true) {
      let maxPages: number | undefined;
      if (rawOptions.maxPages !== undefined) {
        maxPages = Number(rawOptions.maxPages);
        if (!Number.isInteger(maxPages) || maxPages < 1) {
          throw new UsageError(
            `--max-pages expects a positive integer, got '${rawOptions.maxPages}'`
          );
        }
      }
      await dispatchAllPages({ cmdDef, args, flags, ledgerId, cmd: cmdRef, maxPages });
      return;
    }

    await runCommand({ cmdDef, args, flags, locals, ledgerId, cmd: cmdRef });
  });

  parent.addCommand(c);
}

// ---------------------------------------------------------------------------
// Extra (non-route-backed) commands — the array lives in `./extras`.
// ---------------------------------------------------------------------------

function registerExtraCommand(parent: Command, cmdDef: ExtraCommand): void {
  const c = new Command(cmdDef.name).description(cmdDef.description);
  for (const arg of cmdDef.arguments ?? []) {
    const expr = arg.required !== false ? `<${arg.name}>` : `[${arg.name}]`;
    c.argument(expr, arg.description);
  }
  for (const opt of cmdDef.options ?? []) {
    if (opt.required) c.requiredOption(opt.flag, opt.description);
    else c.option(opt.flag, opt.description);
  }

  const argNames = (cmdDef.arguments ?? []).map(a => a.name);
  const hasOptions = (cmdDef.options?.length ?? 0) > 0;

  c.action(async (...actionArgs: unknown[]) => {
    try {
      const args: Record<string, unknown> = {};
      for (let i = 0; i < argNames.length; i++) args[argNames[i]] = actionArgs[i];
      const options = hasOptions ? (actionArgs[argNames.length] as Record<string, unknown>) : {};
      const cmdRef = actionArgs[argNames.length + 1] as Command;
      const ledgerId = cmdDef.needsLedger
        ? await resolveLedgerId(lookupParentOption(cmdRef, "customer"))
        : undefined;
      await cmdDef.handler({ options, args, cmd: cmdRef, ledgerId });
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exitCode = exitCodeForError(err);
    }
  });

  parent.addCommand(c);
}

// ---------------------------------------------------------------------------
// Wire it all up
// ---------------------------------------------------------------------------

startUpdateCheck();

const program = new Command();

program
  .name("cryptact")
  .description("cryptact CLI — manage your crypto tax data from the terminal")
  .version(version)
  .option("--json", "Output raw JSON instead of formatted tables (same as --format json)")
  .option("--format <format>", "Output format: table (default), json, or csv")
  .option(
    "--customer <customerGuid>",
    "Override selected customer for this command (enterprise only)"
  )
  .addHelpText(
    "after",
    `
Environment Variables:
  NO_COLOR=1           Disable all colors (standard)
  CRYPTACT_NO_COLOR=1  Disable CLI colors`
  )
  .exitOverride();

// Build a group→Command map so extras and route commands share groups
const groups = new Map<string, Command>();
function getGroup(name: string, description?: string): Command {
  let g = groups.get(name);
  if (!g) {
    g = program.command(name).description(description ?? `${name} commands`);
    groups.set(name, g);
  }
  return g;
}

for (const group of spec) {
  const g = getGroup(group.name, group.description ?? `${group.name} commands`);
  for (const alias of group.aliases ?? []) g.alias(alias);
  for (const cmd of group.commands) registerRouteCommand(g, cmd);
}

for (const extra of extraCommands) {
  registerExtraCommand(getGroup(extra.group), extra);
}

// Shell completions — a top-level command so `cryptact completions <shell>`
// prints a script derived from the same spec the CLI is built from.
program
  .command("completions <shell>")
  .description("Print a shell completion script (bash, zsh, or fish)")
  .addHelpText(
    "after",
    `
Install:
  fish  cryptact completions fish > ~/.config/fish/completions/cryptact.fish
  bash  cryptact completions bash > ~/.local/share/bash-completion/completions/cryptact
  zsh   cryptact completions zsh  > "\${fpath[1]}/_cryptact"   # any dir on your $fpath

Re-run after upgrading the CLI to pick up newly added commands.`
  )
  .action((shell: string) => {
    const shells: CompletionShell[] = ["bash", "zsh", "fish"];
    if (!shells.includes(shell as CompletionShell)) {
      error(`Unknown shell '${shell}'. Supported: ${shells.join(", ")}`);
      process.exitCode = ExitCode.BAD_PARAMS;
      return;
    }
    process.stdout.write(generateCompletion(shell as CompletionShell));
  });

// exitOverride must be set on every command in the tree: subcommands added via
// addCommand(new Command()) don't inherit it from the root program, and without
// it Commander calls process.exit(1) itself, bypassing the typed-exit-code map.
function applyExitOverride(cmd: Command): void {
  cmd.exitOverride();
  for (const sub of cmd.commands) applyExitOverride(sub);
}
applyExitOverride(program);

// Validate --format before any API call so a typo fails fast with BAD_PARAMS.
program.hook("preAction", (_thisCommand, actionCommand) => {
  getOutputFormat(actionCommand);
});

(async () => {
  let exitCode = 0;
  try {
    await program.parseAsync(process.argv);
    // Handlers can flag a non-zero outcome (e.g. `reprocess --wait` ending in
    // ERROR) via process.exitCode without aborting the update-notice flush.
    if (typeof process.exitCode === "number" && process.exitCode !== 0) {
      exitCode = process.exitCode;
    }
  } catch (err) {
    const e = err as Error & { exitCode?: number; code?: string };
    if (err instanceof CliError) {
      error(err.message);
      exitCode = err.exitCode;
    } else if (typeof e.code === "string" && e.code.startsWith("commander.")) {
      // Commander already printed its own message; bad input maps to BAD_PARAMS,
      // help/version display keeps exit 0.
      exitCode = e.exitCode === 0 ? ExitCode.OK : ExitCode.BAD_PARAMS;
    } else {
      if (e instanceof Error && e.message) error(e.message);
      exitCode = e.exitCode ?? ExitCode.GENERAL;
    }
  }
  await waitForUpdateNotice();
  // stdout/stderr are async when piped; process.exit() would discard anything
  // still buffered past the 64KiB pipe buffer.
  await Promise.all([drain(process.stdout), drain(process.stderr)]);
  process.exit(exitCode);
})();

function drain(stream: NodeJS.WriteStream): Promise<void> {
  return new Promise(resolve => {
    if (stream.writableLength === 0) {
      resolve();
      return;
    }
    stream.write("", () => resolve());
  });
}
