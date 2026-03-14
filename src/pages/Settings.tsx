import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { useDisguise } from "../hooks/useDisguise";
import {
  getStoredJSON,
  removeJSON,
  storeJSON,
} from "../utils/storage";

type CookieConsent = { settings?: boolean; analytics?: boolean };
const consentStorageKey = "gams_cookie_consent_v1";

function loadCookieConsent(): CookieConsent | null {
  const raw = localStorage.getItem(consentStorageKey);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    return null;
  }
  return null;
}

function saveCookieConsent(consent: CookieConsent): void {
  localStorage.setItem(consentStorageKey, JSON.stringify(consent));
}

type SettingsProps = {
  isDark: boolean;
  onToggleTheme: (nextDark: boolean) => void;
};

export default function SettingsPage({ isDark, onToggleTheme }: SettingsProps) {
  const baseIcon =
    (document.querySelector('link[rel*="icon"]') as HTMLLinkElement | null)?.href ||
    "/img/gams-g.png";
  const { broadcast, apply } = useDisguise("Settings - LearningArcade", baseIcon);

  const [popoutMode, setPopoutMode] = useState(
    (getStoredJSON<string>("gams", { key: "popoutMode" }) as string) || "top"
  );
  const [consent, setConsent] = useState<CookieConsent | null>(() => loadCookieConsent());
  const [cookieStatus, setCookieStatus] = useState("Not saved yet.");
  const [tabName, setTabName] = useState("");

  useEffect(() => {
    storeJSON("gams", { key: "popoutMode", value: popoutMode });
  }, [popoutMode]);

  const presetIcons = useMemo(
    () => [
      {
        title: "Classes",
        src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABsklEQVQYV6WPMY9MYRSGnzO5K5mrsczINCujkBh3ihU1CX9BMSsKtqTQ6mzDr5BFQiLRSkRoFRu7icIQ3YoCESHL3DEbmfMqzjc3d1BxmvPlS97nPK9J4n8mm75Yvsz00zkzYTYPkwypAbJ4e2xkyBuw0LpvPzfaMpURrgMUAIhgBZGBGgGznIzpGMx4OW7xatLGbBYGJJTecoHHu2h+pZ/vgP8gQ4YQw3GbB1+OQgIgkS80kYvR7igBHLkzaImi+Q1kZKEJuJB71WDvnpy1M1dBsPb0BqNJiWpGqSWN6GRJ05ELubiwvEJ33xLdxSVWT5xHVRclw8ilCoY89STwt7fu0V08BMD687thKM1biKhgM3CtwmhScu3xdSRR7pZVuPInDicDknoA+p0eRecY/U4PgOGH12y83WT783aAHDSrIBlAquBcOXmJ00dOUZ+i02Nw/CwPh4+4+exWfMqQjExuYIDC4vdwfQ7v786FEWSoAYiiucPgwDuGb9bnQlVloCw/stJ+T5F/j4MyrHxyUKCw+NsIIK4pbbAAy8gkWwUu2uzSDKT6+jMIINkdU93xH+YXTrImgXmBBtYAAAAASUVORK5CYII=",
      },
      {
        title: "My Drive - Google Drive",
        src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACt0lEQVQ4jY1TS2iUZxQ9997v/39nxsngpJqkOogPgkV84GMhtggS2k1BXSha6kIEC8WNFMEgmF+p6MKVIOLKjYr2AS2BFkoVuujGivhA0YVUQ8QuGsXRSf7H993rwlQFo/Qs7z2Hc87iAG+DprgBAGyKn5tCbP0nBj5uP+5s1aBODVRPLD+58M4Z2tK+/D43AoCV5zfOB+T62L9PakV7Ak81wua+xzg17/aY97q0+ikeTZINAPiVPH3pbgGHo1pcq9cqWZFpWfd5ufeD+1k83brZZIgAm+S+kcBAINiKc5vWcyy/w6sKE/090sZX0+/iUP8Il+qCONPgw9p4AH9ZCqYU+jrBqZURiI4SEwHQwIK5H1ZHvpn3zyMIq5kpRxSRylEzEIb+q5CCQbAVjdYOV4lWaxE8DBzF4FHqOtAYL44jEWaA/LgFV6X1xUXZQgSzFEwAsPi7zc1ppjdIuM988By72HJ/9cq2H1fZaUrKVnQtSqzf5+olZqe53hPV5fQZOgwASfCDrupmWxkCQM7MUFi5FyCjHcgilPtAIIDE5xqkTgs98x4A4CXnti1iwq4wEZTA4ESgeX72xhfDl5CmnKZgGrCf0fHDLjEiIkMGJcbu8Z/Qotbg959wqF00IwcD2Fneqi+5GaHpFQECIEfFFugtd+zel0sj7xMjhpF2UMvXEmBRz867v3FcXVfm7TCr0S2ze3tIoS9Tw8AwPCeHr68esQ0PzgRUmq6TF8M9f17ewACViPNBwzOqVIRmdtd8COOlllkR/EQZfFaGMivEZ/6Hj7b7sRl9DHruy0bYT4AJYNS50juaLNs5Y07v3DVdtS4BxcIuFpFYWGIhF0vMzGPVhhASWjP6y7fNS7cvGEBvbMFo3cFnnxPLLLAFU5AIgAAEKIjZAHXm/cM/hpq/TortXcv933gBpn4539/Ch68AAAAASUVORK5CYII=",
      },
      {
        title: "Google",
        src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACIklEQVQ4jYWSS0iUURTHf/fe8RvHooE2VlT2FNqUGWmNEYUR9lhEEVJhUIsoXOQuap1Rq6KHNQt3LaPAIOxhlNTChUwLMU3NR1CklUzg6xvPd1ro2KhTHjjcA/e8/uf/hzmmqsUiEheRLhHxp/2TiDxQ1aK5+ZmFeSJSrwuYiMRVNZKuMxnFz51zu9T3GX/6iPGmRqS/F5WAUMEawuUVRI5UYjwPEWl2zlUYY8YMgIjUW2vPBkPfSV6uYbKvJ+uW3rZSojfuABAEQdw5d96oajHQqr7P8IUqpL8X43lEjp3EK4mBtfgt75l4+4po7U3cytWZPbcyjUlTidv642ipDu7foX7bh2zgs92jDhHpUlWdbNmuEw15OvqweqE7ZjboCAEFADrSjs1LkRM7NAt3+bWRebfYudFx9XguwFqbwePs9z/mT/6NLdAHMBpex28W0/C1Y1Zy05VFM75nUwiAZVGT/v5sgdcA3UurOPUrxvXOFhJD7fOmdn4LeNc5NbpkfWimv5mWZ8KXFKdfXqInOYBnc6gsPEjZ8mKssbQOtvEkMczYl0oK8z3un4lgppbYkhZS3Fp7bnD0Jxeba+lODmTFviFcxq29NeRHDUEQ1DnnqtNSjohIo3Nutx+keNz9gmf9zfQkB0ChYMkK9q2KcaLwMJFQGFV9Y4w5YIwZzyBBI2lRLcD9PVXN/SdFqlokInUi0iEiE9P+UUTuqurmufl/AKTzsFGmvUNUAAAAAElFTkSuQmCC",
      },
      {
        title: "Google Docs",
        src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAdElEQVQ4jWN0bvse////nwkMDIwCDKSBB4yMzA2MTm1f7jP8Z1AgUTMMfGCiQDMDAwODAAsyb28VN1G6nNu+wtlMFNjOwMDAwIDiAmSTiQXUdcFoGOAPA1yuGxxh8IECBzxgYmBgKGRgZHhAut7/HxgYGBoB3s8g7yv6EgQAAAAASUVORK5CYII=",
      },
      {
        title: "Drafts (24) -  G-Mail",
        src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACEUlEQVQ4jcWSP0jUYRjHP8/7/t7z/JelHAhJEN2QUmKFp1DkkIVubVK0NCSI0ODWdksNQRQJQhq0NQQ1ZYM5aIiY1iZEdIKQQ/BT01S8636/92nIjgyusb7Ld/n+4fnywP+GAMw2NdW7hO3cNW7hfC4X/s2gr0jFB2z7znY8V9fDusmC0YQddcaMO1+c+nDqeFc589adxq6oIpiyVsargmBUsxiTSaediQsn86pYkZbqZMX42sXMkGYxpdYsJjzXOaTLdeOBo4U8BBq3ksEFd699kitvbsRtyxNE6sFItRO5tzrTnvlyyd0EWJ0pPnQJ+rw3+MhjRJj43hS9XLpMAPD0wjBLuRf0zN7G+oiCT1Ahpi8ffW8FqLC2Oe89VXi21DG808rzrSNsp3OYynrUasxcy1Ue9z7RsOZwmMST957AmObAmOa89ySN8FmT4eDGWX22e4xg78A9UlxUYKXxNPczDwYo5kecCAoo4ESQOBq51XZ0YDFqIClxadjSUABOI/lYk16rnV4cjNB+gU2BzQjtr51+P5hrDNYSovK7Z18AQKUvWIDU5MJYLHTHQndqcmEMoDLC/qkPfrGIART1cakh9Xr+3T6194KzIILGP72mY52iIvMeH3r1obW2UO6RxJgCsQ9RH+J1PtfbUQyyWfFnHun1hm8cAljZYaNcwLaVtweD+ARAYSv1Fcn6ctp/hx+qpdgPE5JfygAAAABJRU5ErkJggg==",
      },
    ],
    []
  );

  const applyTitle = () => {
    if (!tabName) return;
    storeJSON("gams", { key: "title", value: tabName });
    broadcast();
    apply();
  };

  const applyIcon = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataURL = event.target?.result;
      if (typeof dataURL !== "string") return;
      storeJSON("gams", { key: "icon", value: dataURL });
      broadcast();
      apply();
    };
    reader.readAsDataURL(file);
  };

  const removeDisguise = () => {
    removeJSON("gams", { key: "icon" });
    removeJSON("gams", { key: "title" });
    broadcast();
    apply();
  };

  const applyPreset = (title: string, src: string) => {
    setTabName(title);
    storeJSON("gams", { key: "icon", value: src });
    storeJSON("gams", { key: "title", value: title });
    broadcast();
    apply();
    requestAnimationFrame(() => apply());
  };

  const saveConsent = () => {
    if (!consent) return;
    saveCookieConsent(consent);
    setCookieStatus("Preferences saved.");
  };

  const resetConsent = () => {
    localStorage.removeItem(consentStorageKey);
    setConsent(null);
    setCookieStatus("Consent reset.");
  };

  return (
    <Layout
      title="Settings"
      subtitle="Configure your preferences"
      showControls
      isDark={isDark}
      onToggleTheme={onToggleTheme}
    >
      <section className="glass-panel mb-6 px-6 py-5" id="settings">
        <h2 className="section-title">Popout menu position</h2>
        <p className="mt-2 text-sm text-textSecondary">
          Display the game info menu when using the “New Tab” popout.
        </p>
        <select
          className="mt-4 w-full rounded-xl border border-panelBorder bg-[var(--gams-bg)] px-4 py-3 text-sm font-semibold text-textPrimary shadow-soft"
          value={popoutMode}
          onChange={(event) => setPopoutMode(event.target.value)}
        >
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </section>

      <section className="glass-panel mb-6 px-6 py-5">
        <h2 className="section-title">Cookie preferences</h2>
        <p className="mt-2 text-sm text-textSecondary">
          Control analytics and settings cookies for LearningArcade.
        </p>
        <div className="mt-4 flex flex-col gap-2 text-sm text-textSecondary">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!consent?.settings}
              onChange={(event) =>
                setConsent((prev) => ({ ...(prev || {}), settings: event.target.checked }))
              }
            />
            Settings cookies (favorites/preferences)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!consent?.analytics}
              onChange={(event) =>
                setConsent((prev) => ({ ...(prev || {}), analytics: event.target.checked }))
              }
            />
            Analytics cookies (Umami)
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveConsent}
            className="rounded-full bg-[var(--gams-link)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
          >
            Save cookie preferences
          </button>
          <button
            type="button"
            onClick={resetConsent}
            className="rounded-full border border-panelBorder bg-[var(--gams-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-textSecondary"
          >
            Reset consent
          </button>
        </div>
        <p className="mt-3 text-xs text-textSecondary">{cookieStatus}</p>
      </section>

      <section className="glass-panel px-6 py-5">
        <h2 className="section-title">Disguise</h2>
        <p className="mt-2 text-sm text-textSecondary">
          Change the tab name and icon to blend in.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Classes"
              value={tabName}
              onChange={(event) => setTabName(event.target.value)}
              className="flex-1 rounded-xl border border-panelBorder bg-[var(--gams-bg)] px-4 py-3 text-sm font-semibold text-textPrimary shadow-soft"
            />
            <button
              type="button"
              onClick={applyTitle}
              className="rounded-full bg-[var(--gams-link)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
            >
              Apply title
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => applyIcon(event.target.files?.[0])}
              className="flex-1 rounded-xl border border-panelBorder bg-[var(--gams-bg)] px-4 py-3 text-sm text-textSecondary"
            />
            <button
              type="button"
              onClick={() => removeDisguise()}
              className="rounded-full border border-panelBorder bg-[var(--gams-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-textSecondary"
            >
              Remove disguise
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="section-title">Presets</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {presetIcons.map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => applyPreset(preset.title, preset.src)}
                className="flex flex-col items-center gap-2 rounded-xl border border-panelBorder bg-[var(--gams-bg)] p-3 text-xs text-textSecondary transition hover:text-textPrimary"
              >
                <img src={preset.src} alt={preset.title} className="h-8 w-8" />
                <span>{preset.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
