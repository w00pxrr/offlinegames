import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { gamesData, GameData } from "../data/games";
import { useDisguise } from "../hooks/useDisguise";
import { clearCookie, getCookie, getStoredJSON, setCookie, storeJSON } from "../utils/storage";

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

function enableAnalytics(): void {
  if (document.querySelector('script[data-umami="true"]')) return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://cloud.umami.is/script.js";
  script.dataset.websiteId = "ac0c3422-a178-4ef1-92f3-8d6f875896d0";
  script.dataset.umami = "true";
  document.head.appendChild(script);
}

function hasSettingsCookieConsent(consent: CookieConsent | null): boolean {
  return !!(consent && consent.settings === true);
}

function getFavoriteIds(consent: CookieConsent | null): string[] {
  if (!hasSettingsCookieConsent(consent)) return [];
  const raw = getCookie("gams_favorites");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed as string[];
  } catch {
    return [];
  }
  return [];
}

function saveFavoriteIds(ids: string[]): void {
  setCookie("gams_favorites", JSON.stringify(ids), 3650);
}

function getGameVisits(): Record<string, { count: number; lastVisit: number; name: string }> {
  const raw = localStorage.getItem("gams_game_visits");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function recordGameVisit(gameId: string, gameName: string): void {
  const visits = getGameVisits();
  const now = Date.now();
  if (visits[gameId]) {
    visits[gameId].count++;
    visits[gameId].lastVisit = now;
  } else {
    visits[gameId] = { count: 1, lastVisit: now, name: gameName };
  }

  const allEntries = Object.entries(visits);
  if (allEntries.length > 100) {
    allEntries.sort((a, b) => b[1].lastVisit - a[1].lastVisit);
    const trimmed = Object.fromEntries(allEntries.slice(0, 100));
    localStorage.setItem("gams_game_visits", JSON.stringify(trimmed));
  } else {
    localStorage.setItem("gams_game_visits", JSON.stringify(visits));
  }
}

function getLatestGames(): GameData[] {
  const allowedSections = ["HTML5/unity Webgl", "Flash"];
  const filtered = gamesData.filter((g) => allowedSections.includes(g.section));
  const sorted = [...filtered].sort((a, b) => b.index - a.index);
  return sorted.slice(0, 4);
}

function getTopVisitedGames(limit = 4): GameData[] {
  const visits = getGameVisits();
  const entries = Object.entries(visits);
  if (entries.length === 0) return getLatestGames();

  entries.sort((a, b) => {
    if (b[1].count !== a[1].count) return b[1].count - a[1].count;
    return b[1].lastVisit - a[1].lastVisit;
  });

  const topGameIds = new Set(entries.slice(0, limit).map((e) => e[0]));
  const recommended: GameData[] = [];
  for (const [gameId] of entries) {
    if (recommended.length >= limit) break;
    const game = gamesData.find((g) => g.id === gameId);
    if (game) recommended.push(game);
  }

  if (recommended.length < limit) {
    const latest = getLatestGames();
    for (const game of latest) {
      if (recommended.length >= limit) break;
      if (!topGameIds.has(game.id)) recommended.push(game);
    }
  }
  return recommended.slice(0, limit);
}

type HomeProps = {
  isDark: boolean;
  onToggleTheme: (nextDark: boolean) => void;
};

export default function HomePage({ isDark, onToggleTheme }: HomeProps) {
  const [gamMode, setGamMode] = useState(
    (getStoredJSON<string>("gams", { key: "gamMode" }) as string) || "embed"
  );
  const [consent, setConsent] = useState<CookieConsent | null>(() => loadCookieConsent());
  const [showConsent, setShowConsent] = useState(() => !loadCookieConsent());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCategory, setCurrentCategory] = useState("all");
  const [favorites, setFavorites] = useState<string[]>(() => getFavoriteIds(consent));

  const baseIcon =
    (document.querySelector('link[rel*="icon"]') as HTMLLinkElement | null)?.href ||
    "/img/gams-g.png";
  useDisguise("LearningArcade", baseIcon);

  useEffect(() => {
    storeJSON("gams", { key: "gamMode", value: gamMode });
  }, [gamMode]);

  useEffect(() => {
    if (consent?.analytics) enableAnalytics();
    if (consent && !consent.settings) clearCookie("gams_favorites");
    setFavorites(getFavoriteIds(consent));
  }, [consent]);

  const filteredGames = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const favoriteSet = new Set(favorites);
    const matchesSearch = (g: GameData) => !term || g.name.toLowerCase().includes(term);

    if (currentCategory === "favorites") {
      return gamesData.filter((g) => favoriteSet.has(g.id) && matchesSearch(g));
    }

    return gamesData.filter((g) => {
      const matchesCategory =
        currentCategory === "all" || g.category === currentCategory;
      return matchesCategory && matchesSearch(g);
    });
  }, [currentCategory, favorites, searchTerm]);

  const recommended = useMemo(() => getTopVisitedGames(), []);

  const toggleFavorite = (gameId: string) => {
    if (!hasSettingsCookieConsent(consent)) return;
    const next = new Set(favorites);
    if (next.has(gameId)) next.delete(gameId);
    else next.add(gameId);
    const nextList = Array.from(next);
    saveFavoriteIds(nextList);
    setFavorites(nextList);
  };

  const handleOpenGame = (game: GameData) => {
    const href = new URL(game.href, window.location.href).href;
    const pic = new URL(game.img, window.location.href).href;
    recordGameVisit(game.id, game.name);

    const gameShellQuery = new URLSearchParams({
      icon: pic,
      name: game.name,
      src: href,
    }).toString();
    const gameShellUrl = new URL("games/g/gameEmbed.html", window.location.href);
    gameShellUrl.search = gameShellQuery;

    let mode = gamMode;
    if (game.type === "raw") mode = "raw";

    if (mode === "raw") {
      window.open(href);
      return;
    }
    if (mode === "direct") {
      window.location.href = gameShellUrl.toString();
      return;
    }
    if (mode === "blank") {
      const w = window.open();
      if (!w) return;
      const doc = w.document;
      const body = doc.body;
      body.style.margin = "0";
      const iframe = doc.createElement("iframe");
      iframe.style.width = "100vw";
      iframe.style.height = "100vh";
      iframe.setAttribute("frameborder", "0");
      iframe.src = gameShellUrl.toString();
      body.appendChild(iframe);

      const scriptContent = `const BroadcastDisguise = new BroadcastChannel('BroadcastDisguise');
function setFavicon(href) {
var existFav = document.querySelectorAll('link[rel*="icon"]');
existFav.forEach(function(favicon) { favicon.parentNode.removeChild(favicon); });
var link = document.createElement('link');
link.type = 'image/x-icon';
link.rel = 'icon';
link.href = href;
document.getElementsByTagName('head')[0].appendChild(link);
}
function getStoredJSON(key, data) {
if (data && data.key && (localStorage[key] !== 'null')) {
  var inStore = JSON.parse(localStorage[key]);
  if ((typeof inStore === 'object') && Object.prototype.hasOwnProperty.call(inStore, data.key)) {
    return inStore[data.key];
  }
}
if (localStorage[key] && !data) { return JSON.parse(localStorage[key]); }
return null;
}
function applyDisguise() {
var icon = getStoredJSON('gams', {key: 'icon'});
var title = getStoredJSON('gams', {key: 'title'});
if (title) { document.title = title; } else { document.title = 'about:blank'; }
if (icon) { setFavicon(icon); } else { setFavicon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABRklEQVR42mKgOqjq75ds7510YNL0uV9nAGqniqwKYiCIHIIjcAK22BGQLRdgBWvc3fnWk/FJhrkPO1xPgGvqPfLfJMHhT1yqurvS48bPaJhjD2efgidnVwa2yv59xecvEvi0UWCXq9t0ItfP2MMZ7nwIpkA8F1n8uLxZHM6yrBH7FIl2gFXDHYsErkn2hyKLHtcKrFntk58uVQJ+kSdQnmjhID4cwLLa8+K0BXsfNWCqBOsFdo2Yldv43DBrkxd30cjnNyYBhK0SQGkI9pG4Mu40D5b374DRCAyhHqXVfTmOwivivMkJxBz5wnHCtBfGgNFC+ChWKWRf3hsQIlyEoIv4IYEo5wkgtBLRekY9DE4Uin4Keae6hydGnljPmE8kRcCine6827AMsJ1IuW9ibnlQpXLBCR/WC875m2BP+VSu3c/0m+8V08OBngc0pxcAAAAASUVORK5CYII='); }
}
applyDisguise();
if (BroadcastDisguise) {
BroadcastDisguise.onmessage = () => { applyDisguise(); };
}`;
      const script = doc.createElement("script");
      script.textContent = scriptContent;
      doc.head.appendChild(script);
      return;
    }

    window.open(gameShellUrl.toString());
  };

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const renderTiles = (list: GameData[]) =>
    list.map((game) => (
      <article
        key={game.id}
        className="card-tile card-tile-compact group text-left"
      >
        <button
          onClick={() => handleOpenGame(game)}
          className="flex flex-col gap-2 text-left"
          type="button"
        >
          <img
            src={game.img}
            alt={game.name}
            className="aspect-square w-full rounded-lg border border-panelBorder object-cover"
            width={256}
            height={256}
            loading="lazy"
            decoding="async"
          />
          <div className="px-1">
            <p className="text-sm font-semibold text-textPrimary">{game.name}</p>
          </div>
        </button>
        <button
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-panelBorder bg-[var(--gams-bg)] text-lg text-amber-400 shadow-soft transition group-hover:scale-110"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(game.id);
          }}
          title="Toggle favorite"
          aria-label="Toggle favorite"
          type="button"
        >
          {favoriteSet.has(game.id) ? "★" : "☆"}
        </button>
      </article>
    ));

  const favoriteGames = useMemo(
    () => filteredGames.filter((g) => favoriteSet.has(g.id)),
    [filteredGames, favoriteSet]
  );
  const otherGames = useMemo(
    () => filteredGames.filter((g) => !favoriteSet.has(g.id)),
    [filteredGames, favoriteSet]
  );

  const sortedFavoriteGames = useMemo(
    () => [...favoriteGames].sort((a, b) => a.name.localeCompare(b.name)),
    [favoriteGames]
  );
  const sortedOtherGames = useMemo(
    () => [...otherGames].sort((a, b) => a.name.localeCompare(b.name)),
    [otherGames]
  );

  return (
    <Layout
      title="LearningArcade"
      subtitle="Fun educational games for schools"
      showControls
      isDark={isDark}
      onToggleTheme={onToggleTheme}
      gamMode={gamMode}
      onGamModeChange={setGamMode}
    >
      <section className="glass-panel mb-6 px-6 py-5">
        <div className="flex flex-col gap-3">
          <label className="section-title">Search games</label>
          <input
            className="rounded-2xl border border-panelBorder bg-[var(--gams-bg)] px-4 py-3 text-base font-semibold text-textPrimary shadow-soft"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </section>

      <section className="glass-panel mb-6 px-6 py-5" id="categories">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-title">Categories</p>
            <p className="mt-2 text-sm text-textSecondary">
              Filter the library by genre or focus.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["favorites", "Favorites"],
              ["action", "Action"],
              ["puzzle", "Puzzle"],
              ["adventure", "Adventure"],
              ["sports", "Sports"],
              ["tools", "Tools"],
              ["runner", "Runner"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                  currentCategory === value
                    ? "border-transparent bg-[var(--gams-link)] text-white"
                    : "border-panelBorder bg-[var(--gams-bg)] text-textSecondary hover:text-textPrimary"
                }`}
                onClick={() => setCurrentCategory(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {recommended.length > 0 ? (
        <section className="glass-panel mb-6 px-6 py-5" id="recommended-section">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-title">Recommended for you</p>
              <p className="mt-2 text-sm text-textSecondary">
                Based on your recent plays and favorites.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {renderTiles(recommended)}
          </div>
        </section>
      ) : null}

      <section className="glass-panel px-6 py-5" id="games">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-title">Games</p>
            <p className="mt-2 text-sm text-textSecondary">
              Total Games:{" "}
              <span className="font-semibold text-textPrimary">{filteredGames.length}</span>
            </p>
          </div>
          <a
            className="rounded-full border border-panelBorder bg-[var(--gams-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-textSecondary transition hover:text-textPrimary"
            href="https://github.com/w00pxrr/w00pxrr.github.io"
          >
            Report a bug
          </a>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {currentCategory === "favorites" ? (
            favoriteGames.length > 0 ? (
              renderTiles(sortedFavoriteGames)
            ) : (
              <div className="sm:col-span-4 lg:col-span-8 text-sm text-textSecondary">
                No favorites yet.
              </div>
            )
          ) : (
            <>
              {favoriteGames.length > 0 ? (
                <div className="sm:col-span-4 lg:col-span-8">
                  <p className="section-title">Favorites</p>
                </div>
              ) : null}
              {favoriteGames.length > 0 ? renderTiles(sortedFavoriteGames) : null}
              {renderTiles(sortedOtherGames)}
            </>
          )}
        </div>
      </section>

      {showConsent ? (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-panelBorder bg-panel p-4 shadow-glass backdrop-blur-xl">
          <p className="text-sm font-semibold text-textPrimary">Cookie Preferences</p>
          <p className="mt-1 text-xs text-textSecondary">
            Choose whether to allow analytics cookies and settings cookies.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-textSecondary">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!consent?.settings}
                onChange={(event) =>
                  setConsent((prev) => ({ ...(prev || {}), settings: event.target.checked }))
                }
              />
              Settings cookies
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!consent?.analytics}
                onChange={(event) =>
                  setConsent((prev) => ({ ...(prev || {}), analytics: event.target.checked }))
                }
              />
              Analytics cookies
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-[var(--gams-link)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
              onClick={() => {
                const next = { settings: true, analytics: true };
                saveCookieConsent(next);
                setConsent(next);
                setShowConsent(false);
              }}
            >
              Accept all
            </button>
            <button
              type="button"
              className="rounded-full border border-panelBorder bg-[var(--gams-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-textSecondary"
              onClick={() => {
                if (consent) saveCookieConsent(consent);
                setShowConsent(false);
              }}
            >
              Save choices
            </button>
            <button
              type="button"
              className="rounded-full border border-panelBorder bg-[var(--gams-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-textSecondary"
              onClick={() => {
                const next = { settings: false, analytics: false };
                saveCookieConsent(next);
                setConsent(next);
                setShowConsent(false);
              }}
            >
              Reject all
            </button>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
