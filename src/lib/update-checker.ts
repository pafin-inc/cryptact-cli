import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { version as currentVersion } from "./config";
import { error, fmt } from "./output";
import { isWindows } from "./platform";

const CACHE_DIR = path.join(os.homedir(), ".config", "cryptact-cli");
const CACHE_FILE = path.join(CACHE_DIR, "update-check.json");
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const NOTICE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes between showing notices
const NOTICE_WAIT_TIMEOUT_MS = 5000; // Max time to wait for update check on exit
const NPM_PACKAGE = "@pafin/cryptact-cli";

// Test overrides via environment variables:
// CRYPTACT_UPDATE_CHECK_DISABLE: Set to "1" to disable update checks

interface UpdateCache {
  lastCheck: number;
  lastNotice: number;
  latestVersion: string | null;
}

interface UpdateCheckResult {
  shouldNotify: boolean;
  latestVersion: string | null;
}

let updateCheckPromise: Promise<UpdateCheckResult> | null = null;

function loadCache(): UpdateCache | null {
  try {
    const content = fs.readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(content) as UpdateCache;
  } catch {
    return null;
  }
}

function saveCache(cache: UpdateCache): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true, mode: 0o700 });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), { mode: 0o600 });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EACCES" || code === "EPERM") {
      error(fmt.color("yellow", `Warning: Cannot write update cache to ${CACHE_DIR}`));

      if (isWindows()) {
        error(
          fmt.color(
            "gray",
            `Grant write permissions to ${fmt.color("white", CACHE_DIR)} and try again.`
          )
        );
      } else {
        error(
          fmt.color(
            "gray",
            `Grant write permissions or run: ${fmt.color("white", `chmod 700 ${CACHE_DIR}`)}`
          )
        );
      }
    }
    // Silently ignore other cache write failures
  }
}

function compareVersions(a: string, b: string): number {
  const parseVersion = (v: string) =>
    v
      .replace(/^v/, "")
      .split(".")
      .map(n => parseInt(n, 10) || 0);
  const partsA = parseVersion(a);
  const partsB = parseVersion(b);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

async function fetchLatestVersion(): Promise<string | null> {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 5000).unref?.();

  try {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(NPM_PACKAGE)}/latest`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      }
    );

    if (!response.ok) return null;
    const data = (await response.json()) as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  }
}

/**
 * Starts the update check in the background.
 * Call this early, then call waitForUpdateNotice() after command completes.
 */
export function startUpdateCheck(): void {
  if (process.env.CRYPTACT_UPDATE_CHECK_DISABLE === "1") {
    return;
  }

  updateCheckPromise = performUpdateCheck();
}

/**
 * Waits for the update check to complete and prints notice if applicable.
 * Should be called after command execution completes.
 */
export async function waitForUpdateNotice(): Promise<void> {
  if (!updateCheckPromise) {
    return;
  }

  const timeout = new Promise<UpdateCheckResult>(resolve => {
    setTimeout(() => resolve({ shouldNotify: false, latestVersion: null }), NOTICE_WAIT_TIMEOUT_MS);
  });

  const result = await Promise.race([updateCheckPromise, timeout]);

  if (result.shouldNotify && result.latestVersion) {
    printUpdateNotice(result.latestVersion);
    // Update lastNotice timestamp after showing
    const cache = loadCache();
    if (cache) {
      saveCache({ ...cache, lastNotice: Date.now() });
    }
  }
}

async function performUpdateCheck(): Promise<UpdateCheckResult> {
  const cache = loadCache();
  const now = Date.now();

  // Check if we should skip showing notice (shown recently)
  if (cache?.lastNotice && now - cache.lastNotice < NOTICE_INTERVAL_MS) {
    return { shouldNotify: false, latestVersion: null };
  }

  // If cache is fresh, use cached version
  if (cache && now - cache.lastCheck < CHECK_INTERVAL_MS) {
    if (cache.latestVersion && compareVersions(cache.latestVersion, currentVersion) > 0) {
      return { shouldNotify: true, latestVersion: cache.latestVersion };
    }
    return { shouldNotify: false, latestVersion: cache.latestVersion };
  }

  // Fetch latest version
  try {
    const latestVersion = await fetchLatestVersion();
    saveCache({ lastCheck: now, lastNotice: cache?.lastNotice ?? 0, latestVersion });

    if (latestVersion && compareVersions(latestVersion, currentVersion) > 0) {
      return { shouldNotify: true, latestVersion };
    }
    return { shouldNotify: false, latestVersion };
  } catch {
    return { shouldNotify: false, latestVersion: null };
  }
}

function printUpdateNotice(latestVersion: string): void {
  error("");
  error(
    fmt.color(
      "cyan",
      `  Update available: ${fmt.color("red", currentVersion)} → ${fmt.color(
        "green",
        latestVersion
      )}`
    )
  );
  error(fmt.color("cyan", `  Run: ${fmt.color("white", `npm install -g ${NPM_PACKAGE}`)}`));
  error("");
}
