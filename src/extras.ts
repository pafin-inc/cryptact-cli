/** Extra (non-route-backed) commands registered alongside the spec-driven ones. */
import { enumRegistry } from "./cli-spec";
import { handler as loginHandler } from "./commands/handlers/auth/login";
import { handler as logoutHandler } from "./commands/handlers/auth/logout";
import { handler as statusHandler } from "./commands/handlers/auth/status";
import { handler as fileUploadHandler } from "./commands/handlers/exchange/file-upload";
import { ExitCode } from "./lib/errors";
import type { ExtraCommand, ExtraHandler } from "./lib/extras-types";
import { isJsonMode } from "./lib/output";

export const extraCommands: ExtraCommand[] = [
  {
    group: "auth",
    name: "login",
    description: "Log in to cryptact via browser (OAuth PKCE)",
    options: [
      {
        flag: "--device-code",
        description: "Log in using the device code flow (for headless/remote sessions)"
      }
    ],
    handler: loginHandler as ExtraHandler
  },
  {
    group: "auth",
    name: "logout",
    description: "Clear stored authentication tokens",
    handler: logoutHandler as ExtraHandler
  },
  {
    group: "auth",
    name: "status",
    description: "Show current authentication status",
    handler: statusHandler as ExtraHandler
  },
  {
    group: "reference",
    name: "list",
    description: "List every enum reference known to the CLI",
    handler: async ({ cmd }) => {
      const names = Object.keys(enumRegistry).sort();
      if (isJsonMode(cmd)) {
        process.stdout.write(`${JSON.stringify(names, null, 2)}\n`);
      } else {
        for (const n of names) process.stdout.write(`${n}\n`);
      }
    }
  },
  {
    group: "reference",
    name: "show",
    description: "Print every value for a named enum reference",
    arguments: [{ name: "name", description: "Enum reference name (see `reference list`)" }],
    handler: async ({ args, cmd }) => {
      const name = String(args?.name ?? "");
      const values = enumRegistry[name];
      if (!values) {
        process.stderr.write(`Unknown enum reference: ${name}\n`);
        process.exitCode = ExitCode.BAD_PARAMS;
        return;
      }
      if (isJsonMode(cmd)) {
        process.stdout.write(`${JSON.stringify(values, null, 2)}\n`);
      } else {
        for (const v of values) process.stdout.write(`${JSON.stringify(v)}\n`);
      }
    }
  },
  {
    group: "exchange",
    name: "file-upload",
    description: "Upload a file to an exchange",
    needsLedger: true,
    arguments: [{ name: "file", description: "Path to file", required: true }],
    options: [
      {
        flag: "--exchange-file-id <id>",
        description: "Exchange file ID (see: cryptact reference show exchange-file-id)",
        required: true,
        enumRef: "exchange-file-id"
      },
      {
        flag: "--timezone <tz>",
        description: "File timezone (see: cryptact reference show timezone)",
        enumRef: "timezone"
      },
      { flag: "--sub-id <subId>", description: "Sub ID" },
      { flag: "--password <password>", description: "File password (if encrypted)" }
    ],
    handler: fileUploadHandler as unknown as ExtraHandler
  }
];
