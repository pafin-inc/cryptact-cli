import { Command } from "commander";
import type {
  InstrumentSummaryAs,
  LedgerSummaryResponse,
  LTDInstrumentSummaryAs
} from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import {
  displayValue,
  isJsonMode,
  printJson,
  printKeyValue,
  printTable
} from "../../../lib/output";

function renderInstrumentTable(summaries: (LTDInstrumentSummaryAs | InstrumentSummaryAs)[]): void {
  printTable(
    ["Instrument", "Position", "Wgt Cost", "Revenue", "Cost", "P&L Total", "P&L Long", "P&L Short"],
    summaries.map(s => [
      s.instrument.instrumentId,
      s.position ?? "-",
      s.weightedCost ? displayValue(s.weightedCost) : "-",
      s.totalRevenue ? displayValue(s.totalRevenue) : "-",
      s.totalCost ? displayValue(s.totalCost) : "-",
      displayValue(s.pl.total),
      displayValue(s.pl.long),
      displayValue(s.pl.short)
    ])
  );
}

export async function handler({
  ledgerId,
  cmd
}: {
  ledgerId: string;
  cmd: Command;
}): Promise<void> {
  const data = await apiPost<LedgerSummaryResponse>(`/ledger/${ledgerId}/summary`, { ledgerId });

  if (isJsonMode(cmd)) {
    printJson(data);
    return;
  }

  const s = data.summary;

  // --- Lifetime by instrument ---
  console.log("=== Lifetime by Instrument ===\n");
  renderInstrumentTable(s.byInstrument.summaries);
  const ltdTotal = s.byInstrument.total.pl;
  console.log(
    `\nTotal P&L: ${displayValue(ltdTotal.total)}  (long: ${displayValue(
      ltdTotal.long
    )}, short: ${displayValue(ltdTotal.short)})`
  );

  // --- Yearly by instrument ---
  for (const yg of s.byYearInstrument) {
    console.log(`\n=== FY ${yg.fiscalYear} — By Instrument ===\n`);
    if (yg.summaries.length === 0) {
      console.log("No data.");
      continue;
    }
    renderInstrumentTable(yg.summaries);
    console.log(
      `\nTotal P&L: ${displayValue(yg.total.pl.total)}  (long: ${displayValue(
        yg.total.pl.long
      )}, short: ${displayValue(yg.total.pl.short)})`
    );
  }

  // --- Yearly by exchange ---
  for (const yg of s.byYearExchange) {
    if (yg.summaries.length === 0) continue;
    console.log(`\n=== FY ${yg.fiscalYear} — By Exchange ===\n`);
    printTable(
      ["Exchange", "P&L Total", "P&L Long", "P&L Short", "Grouped", "Ungrouped"],
      yg.summaries.map(es => [
        es.exchangeId.exchangeId ?? "-",
        displayValue(es.pl.total),
        displayValue(es.pl.long),
        displayValue(es.pl.short),
        String(es.count.grouped),
        String(es.count.ungrouped)
      ])
    );
  }

  // --- Metadata ---
  console.log("\n=== Transaction Info ===\n");
  printKeyValue([
    ["Actions", s.actions.join(", ") || "-"],
    ["Pairs", s.pairs.map(p => p.replace(/\|~~\|/g, "/")).join(", ") || "-"],
    ["Sources", s.sources.join(", ") || "-"],
    ["Fee Currencies", s.feeCurrencies.join(", ") || "-"],
    ["Transactions (grouped)", String(s.transactionCount.grouped)],
    ["Transactions (ungrouped)", String(s.transactionCount.ungrouped)],
    ["Transactions (generated)", String(s.transactionCount.generated)]
  ]);

  // --- Feedback codes ---
  const fbEntries = Object.entries(s.feedbackCodes as Record<string, number>);
  if (fbEntries.length > 0) {
    console.log("\n=== Feedback Codes ===\n");
    printTable(
      ["Code", "Count"],
      fbEntries.map(([code, count]) => [code, String(count)])
    );
  }
}
