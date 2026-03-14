import { getStoredJSON } from "./storage";

export function setFavicon(href: string): void {
  if (!href) return;
  const existing = document.querySelectorAll('link[rel*="icon"]');
  existing.forEach((favicon) => favicon.parentNode?.removeChild(favicon));
  const link = document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "icon";
  link.href = href;
  document.getElementsByTagName("head")[0].appendChild(link);
}

export function applyDisguise(baseTitle: string, baseIcon: string): void {
  const icon = getStoredJSON<string>("gams", { key: "icon" });
  const title = getStoredJSON<string>("gams", { key: "title" });
  const nextTitle = title ?? baseTitle;
  document.title = nextTitle;
  const titleEl = document.querySelector("title");
  if (titleEl) titleEl.textContent = nextTitle;
  setFavicon(icon ?? baseIcon);
}

export function getBroadcastDisguise(): BroadcastChannel | null {
  return typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("BroadcastDisguise")
    : null;
}
