/**
 * Shell completion generator.
 *
 * The command tree is fully described by the generated `spec` plus the bespoke
 * `extraCommands`, so we can emit static completion scripts for bash, zsh and
 * fish without any runtime callback protocol. `cryptact completions <shell>`
 * prints the script to stdout; the user redirects it into their shell's
 * completion directory (see the command help / README). Regenerating after an
 * upgrade picks up any new commands.
 *
 * This module imports only `./cli-spec` and `./extras`, so completions cover
 * exactly the commands this CLI ships.
 */
import { enumRegistry, spec } from "../cli-spec";
import { extraCommands } from "../extras";

export type CompletionShell = "bash" | "zsh" | "fish";

const BIN = "cryptact";

interface FlagModel {
  /** Long flag without value placeholder, e.g. "--reporting-ccy". */
  flag: string;
  description: string;
  /** Enum values completed after the flag (from `enumRegistry`), if any. */
  values?: (string | number)[];
  /** Flag expects a value (`--flag <x>`), so shells must not offer filenames. */
  takesValue?: boolean;
}

interface CommandModel {
  name: string;
  aliases: string[];
  description: string;
  flags: FlagModel[];
}

interface GroupModel {
  name: string;
  aliases: string[];
  description: string;
  commands: CommandModel[];
}

/**
 * Build the completion model for one flag. `takesValue` comes from the value
 * placeholder in the declared flag string, the same source Commander parses, so
 * it can never drift from the flag itself.
 */
function toFlagModel(flag: string, description: string, values?: (string | number)[]): FlagModel {
  return {
    flag: longFlag(flag),
    description: oneLine(description),
    values: values && values.length > 0 ? values : undefined,
    takesValue: flag.includes("<")
  };
}

/** Flags every command accepts (declared on the root program). */
const GLOBAL_FLAGS: FlagModel[] = [
  toFlagModel("--json", "Output raw JSON instead of formatted tables"),
  toFlagModel("--format <format>", "Output format: table, json, or csv", ["table", "json", "csv"]),
  toFlagModel("--customer <customerGuid>", "Override selected customer for this command"),
  toFlagModel("--help", "Show help for this command")
];

/** "--reporting-ccy <ccy>" → "--reporting-ccy"; "--filter.has-error <b>" → "--filter.has-error". */
function longFlag(flag: string): string {
  const m = flag.match(/(--[A-Za-z0-9][A-Za-z0-9.-]*)/);
  return m ? m[1] : flag;
}

/** Collapse to a single line and trim; completion descriptions must not wrap. */
function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function buildModel(): GroupModel[] {
  const groups = new Map<string, GroupModel>();
  const get = (name: string): GroupModel => {
    let g = groups.get(name);
    if (!g) {
      g = { name, aliases: [], description: `${name} commands`, commands: [] };
      groups.set(name, g);
    }
    return g;
  };

  for (const group of spec) {
    const g = get(group.name);
    for (const a of group.aliases ?? []) if (!g.aliases.includes(a)) g.aliases.push(a);
    for (const cmd of group.commands) {
      const flags: FlagModel[] = (cmd.options ?? []).map(o => {
        const values = o.enumRef
          ? enumRegistry[o.enumRef]
          : o.type === "boolean" && o.flag.includes("<")
            ? ["true", "false"]
            : undefined;
        // The generator already folds enum values / examples into the option
        // description, so `oneLine(o.description)` carries the human hint; we
        // additionally expose the raw enum values so shells can complete them.
        return toFlagModel(o.flag, o.description, values);
      });
      if (cmd.paged) {
        flags.push({ flag: "--all", description: "Fetch every page and combine results" });
        flags.push(toFlagModel("--max-pages <n>", "Cap the number of pages fetched"));
      }
      if (cmd.destructive) {
        flags.push({
          flag: "--execute",
          description: "Actually perform this destructive operation"
        });
      }
      g.commands.push({
        name: cmd.name,
        aliases: cmd.aliases ?? [],
        description: oneLine(cmd.description),
        flags
      });
    }
  }

  for (const extra of extraCommands) {
    const g = get(extra.group);
    const flags: FlagModel[] = (extra.options ?? []).map(o => {
      const values = o.enumRef ? enumRegistry[o.enumRef] : undefined;
      return toFlagModel(o.flag, o.description, values);
    });
    g.commands.push({
      name: extra.name,
      aliases: [],
      description: oneLine(extra.description),
      flags
    });
  }

  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// fish (rich: descriptions on groups, commands and flags)
// ---------------------------------------------------------------------------

/** Escape for a fish single-quoted string. */
function fishQuote(s: string): string {
  return `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function fishScript(model: GroupModel[]): string {
  const out: string[] = [
    `# cryptact fish completions — generated by \`${BIN} completions fish\`.`,
    "# Regenerate after upgrading the CLI to pick up new commands.",
    "",
    `# Drop into ~/.config/fish/completions/${BIN}.fish`,
    "",
    "# Only complete the top-level group/command when none has been typed yet.",
    `function __${BIN}_needs_group`,
    "    set -l cmd (commandline -opc)",
    "    test (count $cmd) -eq 1",
    "end",
    "",
    "# Gate on argument position, as bash/zsh do: a command name can equal a group",
    "# name (`live-view settings`) and __fish_seen_subcommand_from matches anywhere.",
    `function __${BIN}_group_is`,
    "    set -l cmd (commandline -opc)",
    "    test (count $cmd) -ge 2; and contains -- $cmd[2] $argv",
    "end",
    `function __${BIN}_cmd_is`,
    "    set -l cmd (commandline -opc)",
    "    test (count $cmd) -ge 3; and contains -- $cmd[3] $argv",
    "end",
    ""
  ];

  // Top-level groups + the built-in `completions` command.
  for (const g of model) {
    out.push(
      `complete -c ${BIN} -n __${BIN}_needs_group -f -a ${g.name} -d ${fishQuote(g.description)}`
    );
    for (const a of g.aliases) {
      out.push(
        `complete -c ${BIN} -n __${BIN}_needs_group -f -a ${a} -d ${fishQuote(`alias for ${g.name}`)}`
      );
    }
  }
  out.push(
    `complete -c ${BIN} -n __${BIN}_needs_group -f -a completions -d ${fishQuote("Print a shell completion script")}`
  );
  out.push("");

  // `completions <shell>`
  out.push(
    `complete -c ${BIN} -n "__fish_seen_subcommand_from completions; and not __fish_seen_subcommand_from bash zsh fish" -f -a "bash zsh fish" -d ${fishQuote("shell")}`
  );
  out.push("");

  for (const g of model) {
    const groupTokens = [g.name, ...g.aliases].join(" ");
    const cmdTokens = g.commands.flatMap(c => [c.name, ...c.aliases]).join(" ");
    // Subcommands of this group (group seen, no command chosen yet).
    for (const c of g.commands) {
      out.push(
        `complete -c ${BIN} -n "__${BIN}_group_is ${groupTokens}; and not __${BIN}_cmd_is ${cmdTokens}" -f -a ${c.name} -d ${fishQuote(c.description)}`
      );
      for (const a of c.aliases) {
        out.push(
          `complete -c ${BIN} -n "__${BIN}_group_is ${groupTokens}; and not __${BIN}_cmd_is ${cmdTokens}" -f -a ${a} -d ${fishQuote(`alias for ${c.name}`)}`
        );
      }
    }
    // Flags of each command (group AND command seen). Command names can repeat
    // across groups, so gate on both to keep suggestions scoped.
    for (const c of g.commands) {
      const cmdCond = [c.name, ...c.aliases].join(" ");
      for (const f of [...c.flags, ...GLOBAL_FLAGS]) {
        const cond = `__${BIN}_group_is ${groupTokens}; and __${BIN}_cmd_is ${cmdCond}`;
        // `-r` on every value-taking flag (fish completes filenames otherwise),
        // `-f` to suppress file completion, `-a` to offer the registry values.
        // Spaces are escaped so multi-word values ("Average Cost") stay one candidate.
        const valueSuffix =
          f.values && f.values.length > 0
            ? ` -r -f -a ${fishQuote(f.values.map(v => String(v).replace(/ /g, "\\ ")).join(" "))}`
            : f.takesValue
              ? " -r -f"
              : "";
        out.push(
          `complete -c ${BIN} -n "${cond}" -l ${f.flag.replace(/^--/, "")} -d ${fishQuote(f.description)}${valueSuffix}`
        );
      }
    }
  }

  // Global flags at the top level too.
  for (const f of GLOBAL_FLAGS) {
    out.push(
      `complete -c ${BIN} -n __${BIN}_needs_group -l ${f.flag.replace(/^--/, "")} -d ${fishQuote(f.description)}`
    );
  }
  out.push(
    `complete -c ${BIN} -n __${BIN}_needs_group -l version -d ${fishQuote("Show CLI version")}`
  );

  return `${out.join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// bash (command/flag name completion; descriptions omitted per bash convention)
// ---------------------------------------------------------------------------

/** Wrap a value in single quotes for safe inclusion in a generated bash script. */
function bashQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function bashScript(model: GroupModel[]): string {
  const groupWords = model
    .flatMap(g => [g.name, ...g.aliases])
    .concat("completions")
    .join(" ");
  const globalFlags = GLOBAL_FLAGS.map(f => f.flag)
    .concat("--version")
    .join(" ");

  // case arms: for each group, the commands; for each command, its flags.
  const groupArms = model
    .map(g => {
      const cmdWords = g.commands.flatMap(c => [c.name, ...c.aliases]).join(" ");
      return `        ${[g.name, ...g.aliases].join("|")})\n            cmds="${cmdWords}" ;;`;
    })
    .join("\n");

  // Keyed on "group cmd" (command names repeat across groups, so keying on the
  // command alone would collide — e.g. `search` exists in ~11 groups).
  const flagArms = model
    .flatMap(g =>
      g.commands.map(c => {
        const flags = c.flags.map(f => f.flag).join(" ");
        const patterns = [g.name, ...g.aliases].flatMap(gn =>
          [c.name, ...c.aliases].map(cn => `"${gn} ${cn}"`)
        );
        return `        ${patterns.join("|")})\n            flags="${flags}" ;;`;
      })
    )
    .join("\n");

  // Enum values offered after a value-taking flag. Keyed on "group cmd flag"
  // (space-joined, quoted patterns) because command names repeat across groups.
  const valueArms = model
    .flatMap(g =>
      g.commands.flatMap(c =>
        [...c.flags, ...GLOBAL_FLAGS]
          .filter(f => f.values && f.values.length > 0)
          .map(f => {
            const patterns = [g.name, ...g.aliases].flatMap(gn =>
              [c.name, ...c.aliases].map(cn => `"${gn} ${cn} ${f.flag}"`)
            );
            // One array element per value: a value containing a space ("Average
            // Cost") must stay a single candidate, and shell metacharacters must
            // not be interpreted.
            const vals = (f.values ?? []).map(v => bashQuote(String(v))).join(" ");
            return `        ${patterns.join("|")})\n            vals=(${vals}) ;;`;
          })
      )
    )
    .join("\n");

  return `# cryptact bash completions — generated by \`${BIN} completions bash\`.
# Regenerate after upgrading the CLI to pick up new commands.
#
# Drop into ~/.local/share/bash-completion/completions/${BIN}
_${BIN}_complete() {
    local cur prev group cmd cmds flags v bare
    local -a vals
    cur="\${COMP_WORDS[COMP_CWORD]}"
    group="\${COMP_WORDS[1]}"
    cmd="\${COMP_WORDS[2]}"

    # Level 1: group / top-level command.
    if [ "\$COMP_CWORD" -eq 1 ]; then
        COMPREPLY=( \$(compgen -W "${groupWords}" -- "\$cur") )
        return
    fi

    # 'completions <shell>'
    if [ "\$group" = "completions" ]; then
        COMPREPLY=( \$(compgen -W "bash zsh fish" -- "\$cur") )
        return
    fi

    # Level 2: subcommand of the chosen group.
    if [ "\$COMP_CWORD" -eq 2 ]; then
        cmds=""
        case "\$group" in
${groupArms}
        esac
        COMPREPLY=( \$(compgen -W "\$cmds" -- "\$cur") )
        return
    fi

    # Enum values for the flag just typed (e.g. \`--chain <TAB>\`).
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    vals=()
    case "\$group \$cmd \$prev" in
${valueArms}
    esac
    if [ \${#vals[@]} -gt 0 ]; then
        # Not \`compgen -W\`: it re-splits on whitespace, cutting \`Average Cost\`
        # into two candidates. Match on the unescaped prefix, then offer the value
        # with its spaces backslash-escaped so it lands as a single argument.
        bare="\${cur//\\\\/}"
        COMPREPLY=()
        for v in "\${vals[@]}"; do
            case "\$v" in "\$bare"*) COMPREPLY+=( "\${v// /\\\\ }" ) ;; esac
        done
        return
    fi

    # Level 3+: flags of the chosen command.
    flags=""
    case "\$group \$cmd" in
${flagArms}
    esac
    COMPREPLY=( \$(compgen -W "\$flags ${globalFlags}" -- "\$cur") )
}
complete -F _${BIN}_complete ${BIN}
`;
}

// ---------------------------------------------------------------------------
// zsh (names + descriptions via _describe)
// ---------------------------------------------------------------------------

/** Escape for a zsh double-quoted describe entry ("name:desc"). */
function zshDesc(s: string): string {
  return s
    .replace(/[:"'`$\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function zshScript(model: GroupModel[]): string {
  // Aliases are candidates too: the case arms below accept them.
  const groupEntries = model
    .flatMap(g => [g.name, ...g.aliases].map(n => `        "${n}:${zshDesc(g.description)}"`))
    .concat(`        "completions:Print a shell completion script"`)
    .join("\n");

  const groupArms = model
    .map(g => {
      const cmdEntries = g.commands
        .flatMap(c =>
          [c.name, ...c.aliases].map(n => `                "${n}:${zshDesc(c.description)}"`)
        )
        .join("\n");
      return `        ${[g.name, ...g.aliases].join("|")})\n            local -a cmds=(\n${cmdEntries}\n            )\n            _describe 'command' cmds ;;`;
    })
    .join("\n");

  // Keyed on "group cmd" (command names repeat across groups, so keying on the
  // command alone would collide — e.g. `search` exists in ~11 groups).
  const flagArms = model
    .flatMap(g =>
      g.commands.map(c => {
        const flagEntries = [...c.flags, ...GLOBAL_FLAGS]
          .map(f => `                "${f.flag}:${zshDesc(f.description)}"`)
          .join("\n");
        const patterns = [g.name, ...g.aliases].flatMap(gn =>
          [c.name, ...c.aliases].map(cn => `"${gn} ${cn}"`)
        );
        return `        ${patterns.join("|")})\n            local -a flags=(\n${flagEntries}\n            )\n            _describe 'flag' flags ;;`;
      })
    )
    .join("\n");

  // Enum values offered after a value-taking flag, keyed on "group cmd flag"
  // (command names repeat across groups).
  const valueArms = model
    .flatMap(g =>
      g.commands.flatMap(c =>
        [...c.flags, ...GLOBAL_FLAGS]
          .filter(f => f.values && f.values.length > 0)
          .map(f => {
            const patterns = [g.name, ...g.aliases].flatMap(gn =>
              [c.name, ...c.aliases].map(cn => `"${gn} ${cn} ${f.flag}"`)
            );
            const vals = (f.values ?? []).map(v => `"${v}"`).join(" ");
            return `        ${patterns.join("|")})\n            local -a vals=(${vals})\n            _describe 'value' vals\n            return ;;`;
          })
      )
    )
    .join("\n");

  return `#compdef ${BIN}
# cryptact zsh completions — generated by \`${BIN} completions zsh\`.
# Regenerate after upgrading the CLI to pick up new commands.
#
# Drop into a directory on your \$fpath as _${BIN}
_${BIN}() {
    local curcontext="\$curcontext" state
    local group="\${words[2]}" cmd="\${words[3]}"

    if (( CURRENT == 2 )); then
        local -a groups=(
${groupEntries}
        )
        _describe 'group' groups
        return
    fi

    if [[ "\$group" == "completions" ]]; then
        local -a shells=("bash:Bash" "zsh:Zsh" "fish:Fish")
        _describe 'shell' shells
        return
    fi

    if (( CURRENT == 3 )); then
        case "\$group" in
${groupArms}
        esac
        return
    fi

    local prev="\${words[CURRENT-1]}"
    case "\$group \$cmd \$prev" in
${valueArms}
    esac

    case "\$group \$cmd" in
${flagArms}
    esac
}
_${BIN} "\$@"
`;
}

/** Produce a completion script for the given shell. */
export function generateCompletion(shell: CompletionShell): string {
  const model = buildModel();
  switch (shell) {
    case "fish":
      return fishScript(model);
    case "bash":
      return bashScript(model);
    case "zsh":
      return zshScript(model);
  }
}
