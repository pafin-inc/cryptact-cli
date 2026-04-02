#!/usr/bin/env node

import { Command } from "commander";
import { type CommandDef, spec } from "./cli-spec";
import { version } from "./lib/config";
import { resolveLedgerId } from "./lib/resolve-ledger";

function camelCase(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function registerCommand(group: Command, cmd: CommandDef): void {
  const c = new Command(cmd.name).description(cmd.description);

  for (const arg of cmd.arguments ?? []) {
    const expr = arg.required !== false ? `<${arg.name}>` : `[${arg.name}]`;
    c.argument(expr, arg.description);
  }

  for (const opt of cmd.options ?? []) {
    if (opt.required) {
      c.requiredOption(opt.flags, opt.description);
    } else {
      c.option(opt.flags, opt.description);
    }
  }

  const argNames = (cmd.arguments ?? []).map(a => camelCase(a.name));
  const hasOptions = (cmd.options ?? []).length > 0;
  const handlerPath = cmd.handler;
  const needsLedger = cmd.needsLedger;

  c.action(async (...actionArgs: unknown[]) => {
    try {
      const args: Record<string, string> = {};
      for (let i = 0; i < argNames.length; i++) {
        args[argNames[i]] = actionArgs[i] as string;
      }
      const options = hasOptions ? (actionArgs[argNames.length] as Record<string, unknown>) : {};
      const cmdRef = actionArgs[argNames.length + 1] as Command;

      const mod = require(`./commands/handlers/${handlerPath}`) as {
        handler: (ctx: Record<string, unknown>) => Promise<void>;
      };

      const ctx: Record<string, unknown> = { options, cmd: cmdRef };
      if (needsLedger) {
        ctx.ledgerId = await resolveLedgerId();
      }
      if (argNames.length > 0) ctx.args = args;

      await mod.handler(ctx);
    } catch (err) {
      console.error("Error:", err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

  group.addCommand(c);
}

const program = new Command();

program
  .name("cryptact")
  .description("cryptact CLI — manage your crypto tax data from the terminal")
  .version(version)
  .option("--json", "Output raw JSON instead of formatted tables");

for (const group of spec) {
  const g = program.command(group.name).description(group.description);
  for (const cmd of group.commands) {
    registerCommand(g, cmd);
  }
}

program.parse(process.argv);
