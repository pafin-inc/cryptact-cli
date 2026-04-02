import { Command } from "commander";
import type { LedgerShowResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { getLang, isJsonMode, printJson, printKeyValue } from "../../../lib/output";

const labels = {
  en: {
    ledgerId: "Ledger ID",
    reportingCcy: "Reporting Currency",
    costBasisMethod: "Cost Basis Method",
    fxCostBasisMethod: "FX Cost Basis Method",
    timezone: "Timezone",
    fiscalYearEndMonth: "Fiscal Year End Month",
    lockingFiscalYear: "Locked Fiscal Year",
    defiTranslator: "DeFi Translator",
    positionDecimalPlaces: "Position Decimal Places"
  },
  ja: {
    ledgerId: "帳簿ID",
    reportingCcy: "会計通貨",
    costBasisMethod: "暗号資産の算定方法",
    fxCostBasisMethod: "デリバ・マージン・FX商品の算定方法",
    timezone: "タイムゾーン",
    fiscalYearEndMonth: "年度末の月",
    lockingFiscalYear: "データ確定",
    defiTranslator: "特定のDeFi取引の算定方法",
    positionDecimalPlaces: "コインの小数点桁数"
  }
} as const;

export async function handler({
  ledgerId,
  cmd
}: {
  ledgerId: string;
  options: Record<string, unknown>;
  cmd: Command;
}): Promise<void> {
  const data = await apiGet<LedgerShowResponse>(`/ledger/${ledgerId}`);
  const extracted = data.ledger;

  if (isJsonMode(cmd)) {
    const { ledgerId: _ledgerId, ...rest } = extracted;
    printJson(rest);
    return;
  }

  const lang = await getLang();
  const l = labels[lang];

  printKeyValue([
    [l.ledgerId, String(extracted.ledgerId ?? "")],
    [l.reportingCcy, String(extracted.reportingCcy ?? "")],
    [l.costBasisMethod, String(extracted.costBasisMethod ?? "")],
    [l.fxCostBasisMethod, String(extracted.fxCostBasisMethod ?? "")],
    [l.timezone, String(extracted.timezone ?? "")],
    [l.fiscalYearEndMonth, String(extracted.fiscalYearEndMonth ?? "")],
    [
      l.lockingFiscalYear,
      extracted.lockingFiscalYear !== null ? String(extracted.lockingFiscalYear) : "None"
    ],
    [l.defiTranslator, String(extracted.defiTranslator ?? "")],
    [l.positionDecimalPlaces, String(extracted.positionDecimalPlaces ?? "")]
  ]);
}
