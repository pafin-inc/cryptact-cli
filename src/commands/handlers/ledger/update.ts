import { Command } from "commander";
import type { LedgerUpdateOptions, LedgerUpdateResponse } from "../../../cli-spec";
import { apiGet, apiPut } from "../../../lib/api-client";
import { isJsonMode, printJson } from "../../../lib/output";

export async function handler({
  ledgerId,
  options,
  cmd
}: {
  ledgerId: string;
  options: LedgerUpdateOptions;
  cmd: Command;
}): Promise<void> {
  const overrides: Record<string, unknown> = {};

  if (options.reportingCcy !== undefined) overrides.reportingCcy = options.reportingCcy;
  if (options.costBasisMethod !== undefined) overrides.costBasisMethod = options.costBasisMethod;
  if (options.fxCostBasisMethod !== undefined) {
    overrides.fxCostBasisMethod = options.fxCostBasisMethod;
  }
  if (options.timezone !== undefined) overrides.timezone = options.timezone;
  if (options.fiscalYearEndMonth !== undefined) {
    overrides.fiscalYearEndMonth = parseInt(options.fiscalYearEndMonth, 10);
  }
  if (options.defiTranslator !== undefined) overrides.defiTranslator = options.defiTranslator;
  if (options.positionDecimalPlaces !== undefined) {
    overrides.positionDecimalPlaces = parseInt(options.positionDecimalPlaces, 10);
  }
  if (options.allowMarginalFlip !== undefined) {
    overrides.allowMarginalFlip = options.allowMarginalFlip;
  }
  if (options.marginalFlipThreshold !== undefined) {
    overrides.marginalFlipThreshold = parseInt(options.marginalFlipThreshold, 10);
  }
  if (options.alwaysUseTtm !== undefined) overrides.alwaysUseTTM = options.alwaysUseTtm;
  if (options.corporateM2mMethod !== undefined) {
    overrides.corporateMarkToMarketMethod = options.corporateM2mMethod;
  }
  if (options.priceLookupFallbackToZero !== undefined) {
    overrides.priceLookupFallbackToZero = options.priceLookupFallbackToZero;
  }
  if (options.sendFeeExpensed !== undefined) overrides.sendFeeExpensed = options.sendFeeExpensed;
  if (options.adjustedCostBasisFromFy !== undefined) {
    overrides.useAdjustedCostBasisFromFiscalYear = parseInt(options.adjustedCostBasisFromFy, 10);
  }
  if (options.importAssetMovements !== undefined) {
    overrides.importAssetMovements = options.importAssetMovements;
  }

  if (Object.keys(overrides).length === 0) {
    console.error("Error: at least one setting flag is required.");
    process.exit(1);
  }

  // Fetch current ledger, merge overrides into full object
  const current = await apiGet<LedgerUpdateResponse>(`/ledger/${ledgerId}`);
  const updated = { ...current.ledger, ...overrides };

  await apiPut<LedgerUpdateResponse>(`/ledger/${ledgerId}`, { ledger: updated });

  if (isJsonMode(cmd)) {
    printJson({ updated: true });
    return;
  }

  console.log("Ledger settings updated.");
}
