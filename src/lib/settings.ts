import { apiGet } from "./api-client";

let cachedLang: "en" | "ja" | undefined;

export async function getLang(): Promise<"en" | "ja"> {
  if (cachedLang) return cachedLang;
  try {
    const data = await apiGet<{ language?: string }>("/settings/user");
    cachedLang = data.language === "ja" ? "ja" : "en";
  } catch {
    cachedLang = "en";
  }
  return cachedLang;
}
