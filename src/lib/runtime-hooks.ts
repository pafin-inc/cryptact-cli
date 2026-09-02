/**
 * Runtime overrides for the route-driven default handler pipeline.
 *
 * Most route-backed commands need no per-command code: the dispatcher builds
 * the request, and `format-response` renders it. The few commands whose final
 * output isn't a dump of the response payload (e.g. "trigger and tell the user
 * what happened") declare a hook here.
 *
 * Generator-time overrides — renamed commands, hidden groups, custom flag
 * names, etc. — get baked into the
 * generated `cli-spec.ts`. Runtime hooks (this file) carry only the bits that
 * must execute at command time.
 *
 * Self-contained: depends only on commander types and the generated spec.
 */
import type { Command } from "commander";
import type { CommandDef } from "../cli-spec";
import { apiGet } from "./api-client";
import { dispatch } from "./dispatcher";
import { formatResponse, printHuman } from "./format-response";
import {
  fmt,
  getOutputFormat,
  info,
  log,
  printJson,
  printKeyValue,
  printTable,
  sectionTitle
} from "./output";

export interface HookContext {
  cmdDef: CommandDef;
  args: Record<string, string>;
  flags: Record<string, unknown>;
  /** Values of CLI-only flags (spec options with `local: true`), e.g. `--wait`. */
  locals?: Record<string, unknown>;
  ledgerId?: string;
  cmd: Command;
}

export interface RuntimeHook {
  /** Full handler replacement; bypasses dispatch/extract/print. */
  handler?: (ctx: HookContext) => Promise<void>;
  /** Replace the API-call phase only. Receives the assembled request body. */
  call?: (ctx: HookContext, body: unknown) => Promise<unknown>;
  /** Transform the raw response before formatting. */
  extract?: (data: unknown, ctx: HookContext) => unknown;
  /** Replace the print phase. Receives the (extracted) response. */
  print?: (data: unknown, ctx: HookContext) => void;
}

const hookKey = (groupKey: string, routeKey: string): string => `${groupKey}.${routeKey}`;

const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 60 * 60 * 1_000;
const TERMINAL_PROCESS_STATES = new Set(["DONE", "ERROR", "TIMEOUT"]);

/** Poll GET /ledger/:ledgerId/process-status until the state is terminal. */
async function waitForLedgerProcessing(ledgerId: string, quiet: boolean): Promise<string> {
  const startedAt = Date.now();
  let lastState = "";
  for (;;) {
    if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
      throw new Error("Timed out waiting for ledger processing to complete (60 minutes)");
    }
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    const res = await apiGet<{ processStatus?: { state?: string } }>(
      `/ledger/${encodeURIComponent(ledgerId)}/process-status`
    );
    const state = res.processStatus?.state ?? "UNKNOWN";
    if (state !== lastState) {
      if (!quiet) info(`Status: ${fmt.state(state)}`);
      lastState = state;
    }
    if (TERMINAL_PROCESS_STATES.has(state)) return state;
  }
}

// ─── ledger summary rendering ────────────────────────────────────────────────
// Loose local views of the summary payload.

interface PlAs {
  total: string;
  long: string;
  short: string;
}
interface InstrumentSummaryAs {
  instrument: { instrumentId: string };
  position: string;
  weightedCost: string;
  totalRevenue: string;
  totalCost: string;
  pl: PlAs;
}
interface LedgerSummaryAs {
  byInstrument: { summaries: InstrumentSummaryAs[]; total: { pl: PlAs } };
  byYearInstrument: { fiscalYear: number; summaries: InstrumentSummaryAs[]; total: { pl: PlAs } }[];
  byYearExchange: {
    fiscalYear: number;
    summaries: {
      exchangeId: { exchangeId: string | null };
      pl: PlAs;
      count: { grouped: number; ungrouped: number };
    }[];
  }[];
  actions: string[];
  pairs: string[];
  sources: string[];
  feeCurrencies: string[];
  transactionCount: { grouped: number; ungrouped: number; generated: number };
  feedbackCodes: Record<string, number>;
}

function renderInstrumentTable(summaries: InstrumentSummaryAs[]): void {
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

function plTotalLine(pl: PlAs): string {
  return `Total P&L: ${fmt.value(pl.total)}  (long: ${fmt.value(pl.long)}, short: ${fmt.value(pl.short)})`;
}

function printLedgerSummary(s: LedgerSummaryAs): void {
  log(`${sectionTitle("Lifetime by Instrument")}\n`);
  renderInstrumentTable(s.byInstrument.summaries);
  log(`\n${plTotalLine(s.byInstrument.total.pl)}`);

  for (const yg of s.byYearInstrument) {
    log(`\n${sectionTitle(`FY ${yg.fiscalYear} — By Instrument`)}\n`);
    if (yg.summaries.length === 0) {
      log("No data.");
      continue;
    }
    renderInstrumentTable(yg.summaries);
    log(`\n${plTotalLine(yg.total.pl)}`);
  }

  for (const yg of s.byYearExchange) {
    if (yg.summaries.length === 0) continue;
    log(`\n${sectionTitle(`FY ${yg.fiscalYear} — By Exchange`)}\n`);
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

  log(`\n${sectionTitle("Transaction Info")}\n`);
  printKeyValue([
    ["Actions", s.actions.join(", ") || "-"],
    ["Pairs", s.pairs.map(p => fmt.pair(p)).join(", ") || "-"],
    ["Sources", s.sources.join(", ") || "-"],
    ["Fee Currencies", s.feeCurrencies.join(", ") || "-"],
    ["Transactions (grouped)", fmt.value(s.transactionCount.grouped)],
    ["Transactions (ungrouped)", fmt.value(s.transactionCount.ungrouped)],
    ["Transactions (generated)", fmt.value(s.transactionCount.generated)]
  ]);

  const fbEntries = Object.entries(s.feedbackCodes ?? {});
  if (fbEntries.length > 0) {
    log(`\n${sectionTitle("Feedback Codes")}\n`);
    printTable(
      ["Code", "Count"],
      fbEntries.map(([code, count]) => [code, fmt.value(count)])
    );
  }
}

// ─── transaction rendering ───────────────────────────────────────────────────
// Loose local view of ITransaction (common's type is off-limits here).

interface TransactionAs {
  uuid: string;
  ts: string | Date;
  act: string;
  pair: string;
  bc: string;
  cc: string;
  vol: string;
  prc: string;
  fee: string;
  fc: string;
  src: string;
  comment: string | null;
  [key: string]: unknown;
}

interface InstrumentsListAs {
  cryptoMarketCaps?: Record<string, number>;
  cryptoNames?: Record<string, Record<string, string>>;
  fxNames?: Record<string, Record<string, string>>;
}

const hooks: Record<string, RuntimeHook> = {
  [hookKey("instrumentsRoutes", "listCryptoFx")]: {
    print: (data, ctx) => {
      if (getOutputFormat(ctx.cmd) !== "table") return formatResponse(data, ctx.cmd);
      const d = data as InstrumentsListAs;
      const caps = d.cryptoMarketCaps ?? {};
      const cryptoNames = d.cryptoNames?.en ?? {};
      const fxNames = d.fxNames?.en ?? {};
      const cryptos = Object.keys(caps)
        .sort((a, b) => (caps[b] ?? 0) - (caps[a] ?? 0))
        .map(id => [id, cryptoNames[id] || "-", fmt.number(caps[id])]);
      const fxRows = Object.keys(fxNames)
        .sort()
        .map(id => [id, fxNames[id] || "-", "-"]);
      printTable(["ID", "Name", "Market Cap"], [...cryptos, ...fxRows]);
      log(`\n${cryptos.length} crypto, ${fxRows.length} FX instruments`);
    }
  },
  [hookKey("transactionRoutes", "search")]: {
    print: (data, ctx) => {
      if (getOutputFormat(ctx.cmd) !== "table") return formatResponse(data, ctx.cmd);
      const d = data as { results?: TransactionAs[]; total?: number };
      printTable(
        ["UUID", "Date", "Action", "Pair", "Volume", "Price", "Fee", "Source"],
        (d.results ?? []).map(t => [
          fmt.id(t.uuid.slice(0, 8)),
          fmt.datetime(t.ts, "datetime"),
          fmt.action(t.act),
          fmt.pair(t.pair),
          fmt.value(t.vol),
          fmt.value(t.prc),
          `${fmt.value(t.fee)} ${t.fc}`,
          t.src
        ])
      );
      if (d.total !== undefined) log(`\nTotal: ${d.total}`);
    }
  },
  [hookKey("transactionRoutes", "getDetail")]: {
    print: (data, ctx) => {
      if (getOutputFormat(ctx.cmd) !== "table") return formatResponse(data, ctx.cmd);
      const d = data as {
        ledgerId?: string;
        transactionId?: string;
        transactionType?: string;
        detail?: TransactionAs;
      };
      const t = d.detail;
      if (!t) return printJson(data);

      printKeyValue([
        ["Ledger ID", fmt.id(d.ledgerId ?? "-")],
        ["Transaction ID", fmt.id(d.transactionId ?? t.uuid)],
        ["Transaction Type", d.transactionType ?? "-"],
        ["Date", fmt.datetime(t.ts, "datetime")],
        ["Action", fmt.action(t.act)],
        ["Base", t.bc],
        ["Counter", t.cc],
        ["Pair", fmt.pair(t.pair)],
        ["Volume", fmt.value(t.vol)],
        ["Price", fmt.value(t.prc)],
        ["Fee", `${fmt.value(t.fee)} ${t.fc}`],
        ["Source", t.src],
        ["Comment", t.comment || "-"]
      ]);

      // Everything not shown above (cryptic engine fields, PL, feedback)
      const {
        uuid: _uuid,
        ts: _ts,
        act: _act,
        pair: _pair,
        bc: _bc,
        cc: _cc,
        vol: _vol,
        prc: _prc,
        fee: _fee,
        fc: _fc,
        src: _src,
        comment: _comment,
        ...rest
      } = t;
      if (Object.keys(rest).length > 0) {
        log(`\n${sectionTitle("Details")}\n`);
        printHuman(rest);
      }
    }
  },
  [hookKey("ledgerRoutes", "summary")]: {
    print: (data, ctx) => {
      if (getOutputFormat(ctx.cmd) !== "table") return formatResponse(data, ctx.cmd);
      const summary = (data as { summary?: LedgerSummaryAs }).summary;
      if (!summary) return printJson(data);
      printLedgerSummary(summary);
    }
  },
  [hookKey("ledgerRoutes", "process")]: {
    handler: async ctx => {
      const data = await dispatch(ctx);
      const status = (data as { processStatus?: { state?: string } }).processStatus;
      // Any machine format, not just --json: prose on stdout breaks a CSV reader.
      const machine = getOutputFormat(ctx.cmd) !== "table";

      if (ctx.locals?.wait !== true) {
        if (machine) return formatResponse(status ?? data, ctx.cmd);
        info(`Processing triggered. Status: ${status?.state ?? "unknown"}`);
        return;
      }

      if (!machine) info(`Processing triggered. Status: ${status?.state ?? "unknown"} — waiting…`);
      const finalState = await waitForLedgerProcessing(ctx.ledgerId as string, machine);
      if (machine) formatResponse({ state: finalState }, ctx.cmd);
      else info(`Processing finished. Status: ${fmt.state(finalState)}`);
      if (finalState !== "DONE") process.exitCode = 1;
    }
  },
  [hookKey("ledgerRoutes", "download")]: {
    print: (data, ctx) => {
      if (getOutputFormat(ctx.cmd) !== "table") return formatResponse(data, ctx.cmd);
      info("Download triggered. You will receive an email with the download link.");
    }
  }
};

export function getHook(cmdDef: CommandDef): RuntimeHook | undefined {
  return hooks[hookKey(cmdDef.groupKey, cmdDef.routeKey)];
}
