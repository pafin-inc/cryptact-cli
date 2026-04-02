// Auto-generated config with production defaults
// Override via environment variables for development/testing

import * as fs from "fs";
import * as path from "path";

function findPackageJson(): { version: string } {
  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    const candidate = path.join(dir, "package.json");
    if (fs.existsSync(candidate)) {
      return JSON.parse(fs.readFileSync(candidate, "utf-8"));
    }
    dir = path.dirname(dir);
  }
  throw new Error("Could not find package.json");
}

export const { version } = findPackageJson();

export interface CliConfig {
  apiUrl: string;
  hydraHost: string;
  pafinUrl: string;
  clientId: string;
}

export function getConfig(): CliConfig {
  return {
    apiUrl: process.env.CRYPTACT_API_URL || "https://api.cryptact.com",
    hydraHost: process.env.CRYPTACT_HYDRA_HOST || "https://oidc.pafin.com",
    pafinUrl: process.env.CRYPTACT_PAFIN_URL || "https://www.pafin.com",
    clientId: process.env.CRYPTACT_CLIENT_ID || "88d8dcf4-e91b-4fc2-a8f6-620586be1dfe"
  };
}
