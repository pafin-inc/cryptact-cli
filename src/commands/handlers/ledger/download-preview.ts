import { Command } from "commander";
import type { LedgerDownloadPreviewResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { getLang, isJsonMode, printJson, printTable } from "../../../lib/output";

const headers = {
  en: {
    fileName: "File Name",
    type: "Type"
  },
  ja: {
    fileName: "ファイル名",
    type: "種類"
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
  const data = await apiGet<LedgerDownloadPreviewResponse>(
    `/ledger/${ledgerId}/download-files-preview`
  );
  const files = data.downloadFiles;

  if (isJsonMode(cmd)) {
    printJson(files);
    return;
  }

  const lang = await getLang();
  const h = headers[lang];

  printTable(
    [h.fileName, h.type],
    (files || []).map(r => [String(r.id ?? ""), String(r.type ?? "")])
  );
}
