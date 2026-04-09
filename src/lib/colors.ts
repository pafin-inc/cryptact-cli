import * as pc from "picocolors";

/** Color formatter function type (matches picocolors signature) */
type Formatter = (input: string | number | null | undefined) => string;

/**
 * Check if colors should be disabled.
 * Respects: NO_COLOR (standard), CRYPTACT_NO_COLOR (custom)
 * picocolors already handles NO_COLOR, FORCE_COLOR, and terminal detection,
 * but we add CRYPTACT_NO_COLOR for CLI-specific control.
 */
const isColorDisabled = (): boolean => {
  return !!process.env.CRYPTACT_NO_COLOR;
};

/** Identity function that returns input unchanged */
const identity: Formatter = (s: string | number | null | undefined): string => String(s ?? "");

const colorify = (color: Formatter): Formatter => {
  if (isColorDisabled()) return identity;
  return color;
};

/**
 * Semantic color tokens for CLI output.
 * These are the raw building blocks - use lib/output.ts `fmt` for value formatting.
 *
 * Colors can be disabled via:
 * - NO_COLOR=1 (standard, handled by picocolors)
 * - CRYPTACT_NO_COLOR=1 (CLI-specific)
 */
export const colors = {
  // Status
  success: colorify(pc.green),
  error: colorify(pc.red),
  warn: colorify(pc.yellow),
  info: colorify(pc.cyan),

  // Structure
  label: colorify(pc.cyan),
  header: colorify(pc.bold),
  dim: colorify(pc.dim),
  bold: colorify(pc.bold),
  muted: colorify(pc.gray)
};

// Short alias for convenience
export const c = colors;
