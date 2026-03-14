export type StoredJSONKeyOpt = { key: string };

export function getStoredJSON<T = string | object | boolean | null>(
  key: string,
  data?: StoredJSONKeyOpt
): T | null {
  if (data?.key && localStorage[key] !== "null") {
    try {
      const inStore = JSON.parse(localStorage[key]) as Record<string, unknown>;
      if (
        typeof inStore === "object" &&
        Object.prototype.hasOwnProperty.call(inStore, data.key)
      ) {
        return inStore[data.key] as T;
      }
    } catch {
      return null;
    }
  }
  if (localStorage[key] && !data) {
    try {
      return JSON.parse(localStorage[key]) as T;
    } catch {
      return null;
    }
  }
  return null;
}

export function storeJSON(
  key: string,
  data: { key: string; value: string }
): string {
  let inStore: Record<string, unknown>;
  if (localStorage[key]) {
    try {
      inStore = (JSON.parse(localStorage[key]) as Record<string, unknown>) || {};
    } catch {
      inStore = {};
    }
    inStore[data.key] = data.value;
  } else {
    inStore = { [data.key]: data.value };
  }
  localStorage[key] = JSON.stringify(inStore);
  return localStorage[key];
}

export function removeJSON(key: string, data: { key: string }): void {
  if (!localStorage[key]) return;
  try {
    const inStore = JSON.parse(localStorage[key]) as Record<string, unknown>;
    if (typeof inStore === "object" && inStore) {
      delete inStore[data.key];
      localStorage[key] = JSON.stringify(inStore);
    }
  } catch {
    localStorage.removeItem(key);
  }
}

export function setCookie(name: string, value: string, days?: number): void {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    expires +
    "; path=/; SameSite=Lax" +
    secure;
}

export function clearCookie(name: string): void {
  document.cookie =
    name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
}

export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}
