import { Command } from "commander";
import type { LedgerStatusResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { fmt, isJsonMode, printJson, printKeyValue } from "../../../lib/output";
import { getLang } from "../../../lib/settings";

const labels = {
  en: {
    state: "State",
    processId: "Process ID",
    ts: "Timestamp",
    lastUpdateTs: "Last Update",
    error: "Error"
  },
  ja: {
    state: "状態",
    processId: "プロセスID",
    ts: "タイムスタンプ",
    lastUpdateTs: "最終更新",
    error: "エラー"
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
  const data = await apiGet<LedgerStatusResponse>(`/ledger/${ledgerId}/process-status`);
  const extracted = data.processStatus;

  if (isJsonMode(cmd)) {
    printJson(extracted);
    return;
  }

  const lang = await getLang();
  const l = labels[lang];

  printKeyValue([
    [l.state, fmt.state(String(extracted.state ?? ""))],
    [l.processId, fmt.id(String(extracted.processId ?? ""))],
    [
      l.ts,
      fmt.datetime(extracted.ts !== null ? (extracted.ts as number) * 1000 : null, "datetime")
    ],
    [
      l.lastUpdateTs,
      fmt.datetime(
        extracted.lastUpdateTs !== null ? (extracted.lastUpdateTs as number) * 1000 : null,
        "datetime"
      )
    ],
    [l.error, extracted.error !== null ? String(extracted.error) : "-"]
  ]);
}
