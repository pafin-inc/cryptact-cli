type Platform = "macos" | "windows" | "linux" | "unknown";

function getPlatform(): Platform {
  switch (process.platform) {
    case "darwin":
      return "macos";
    case "win32":
      return "windows";
    case "linux":
      return "linux";
    default:
      return "unknown";
  }
}

export function isWindows() {
  return getPlatform() === "windows";
}
