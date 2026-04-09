import { Command } from "commander";
import type {
  InstrumentSummaryAs,
  LedgerSummaryResponse,
  LTDInstrumentSummaryAs
} from "../../../cli-spec";
import { apiPost } from "../../../lib/api-client";
import { fmt, isJsonMode, log, printJson, printKeyValue, printTable } from "../../../lib/output";

function renderInstrumentTable(summaries: (LTDInstrumentSummaryAs | InstrumentSummaryAs)[]): void {
  printTable(
    ["Instrument", "Position", "Wgt Cost", "Revenue", "Cost", "P&L Total", "P&L Long", "P&L Short"],
    summaries.map(s => [
      s.instrument.instrumentId,
      fmt.value(s.position),
      fmt.value(s.weightedCost),
      fmt.value(s.totalRevenue),
      fmt.value(s.totalCost),
      fmt.value(s.pl.total),
      fmt.value(s.pl.long),
      fmt.value(s.pl.short)
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
  log("=== Lifetime by Instrument ===\n");
  renderInstrumentTable(s.byInstrument.summaries);
  const ltdTotal = s.byInstrument.total.pl;
  log(
    `\nTotal P&L: ${fmt.value(ltdTotal.total)}  (long: ${fmt.value(
      ltdTotal.long
    )}, short: ${fmt.value(ltdTotal.short)})`
  );

  // --- Yearly by instrument ---
  for (const yg of s.byYearInstrument) {
    log(`\n=== FY ${yg.fiscalYear} — By Instrument ===\n`);
    if (yg.summaries.length === 0) {
      log("No data.");
      continue;
    }
    renderInstrumentTable(yg.summaries);
    log(
      `\nTotal P&L: ${fmt.value(yg.total.pl.total)}  (long: ${fmt.value(
        yg.total.pl.long
      )}, short: ${fmt.value(yg.total.pl.short)})`
    );
  }

  // --- Yearly by exchange ---
  for (const yg of s.byYearExchange) {
    if (yg.summaries.length === 0) continue;
    log(`\n=== FY ${yg.fiscalYear} — By Exchange ===\n`);
    printTable(
      ["Exchange", "P&L Total", "P&L Long", "P&L Short", "Grouped", "Ungrouped"],
      yg.summaries.map(es => [
        es.exchangeId.exchangeId ?? "-",
        fmt.value(es.pl.total),
        fmt.value(es.pl.long),
        fmt.value(es.pl.short),
        fmt.value(es.count.grouped),
        fmt.value(es.count.ungrouped)
      ])
    );
  }

  // --- Metadata ---
  log("\n=== Transaction Info ===\n");
  printKeyValue([
    ["Actions", s.actions.join(", ") || "-"],
    ["Pairs", s.pairs.map(p => fmt.pair(p)).join(", ") || "-"],
    ["Sources", s.sources.join(", ") || "-"],
    ["Fee Currencies", s.feeCurrencies.join(", ") || "-"],
    ["Transactions (grouped)", fmt.value(s.transactionCount.grouped)],
    ["Transactions (ungrouped)", fmt.value(s.transactionCount.ungrouped)],
    ["Transactions (generated)", fmt.value(s.transactionCount.generated)]
  ]);

  // --- Feedback codes ---
  const fbEntries = Object.entries(s.feedbackCodes as Record<string, number>);
  if (fbEntries.length > 0) {
    log("\n=== Feedback Codes ===\n");
    printTable(
      ["Code", "Count"],
      fbEntries.map(([code, count]) => [code, fmt.value(count)])
    );
  }
}
