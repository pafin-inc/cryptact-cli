import { Command } from "commander";
import type { ExchangeEndpointsOptions, ExchangeEndpointsResponse } from "../../../cli-spec";
import { apiGet } from "../../../lib/api-client";
import { isJsonMode, printJson, printTable } from "../../../lib/output";

export async function handler({
  options,
  cmd
}: {
  options: ExchangeEndpointsOptions;
  cmd: Command;
}): Promise<void> {
  const data = await apiGet<ExchangeEndpointsResponse>(
    `/exchange-api/exchange/endpoints?exchange=${encodeURIComponent(options.exchange as string)}`
  );

  if (isJsonMode(cmd)) {
    printJson(data.endpoints);
    return;
  }

  printTable(
    ["Endpoint"],
    (data.endpoints || []).map(e => [e.endpoint])
  );
}
