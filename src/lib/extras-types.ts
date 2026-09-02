/**
 * Shared types for the bespoke ("extra") commands registered alongside the
 * route-driven spec.
 */
import type { Command } from "commander";

export type ExtraHandler = (ctx: {
  options: Record<string, unknown>;
  args?: Record<string, unknown>;
  cmd: Command;
  ledgerId?: string;
}) => Promise<void>;

export interface ExtraCommand {
  group: string;
  name: string;
  description: string;
  handler: ExtraHandler;
  needsLedger?: true;
  arguments?: { name: string; description: string; required?: boolean }[];
  options?: {
    flag: string;
    description: string;
    required?: boolean;
    /** Name of the value list in `enumRegistry`; completed by the shells. */
    enumRef?: string;
  }[];
}
