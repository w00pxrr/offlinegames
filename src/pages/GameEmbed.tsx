import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDisguise } from "../hooks/useDisguise";
import { getStoredJSON } from "../utils/storage";
import { recommendedGames } from "../data/recommended";

type FilterState = {
  brightness: number;
  contrast: number;
  hue: number;
  blur: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  invert: number;
  opacity: number;
  dropShadow: number;
};

type RecommendedGame = {
  name: string;
  href: string;
  img: string;
};

const defaultFilters: FilterState = {
  brightness: 100,
  contrast: 100,
  hue: 0,
  blur: 0,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  opacity: 1,
  dropShadow: 0,
};

function resolveUrl(rawUrl?: string | null) {
  if (!rawUrl) return "";
  try {
    return new URL(rawUrl, window.location.href).href;
  } catch {
    return rawUrl;
  }
}

function getGameVisits(): Record<string, { count: number }> {
  const raw = localStorage.getItem("gams_game_visits");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getSortedRecommendedGames(): RecommendedGame[] {
  const visits = getGameVisits();
  if (Object.keys(visits).length === 0) return recommendedGames.slice(0, 6);

  return [...recommendedGames]
    .sort((a, b) => {
      const aCount = visits[a.name.toLowerCase().replace(/\s/g, "")]?.count || 0;
      const bCount = visits[b.name.toLowerCase().replace(/\s/g, "")]?.count || 0;
      return bCount - aCount;
    })
    .slice(0, 6);
}

export default function GameEmbedPage() {
  const params = useMemo(() => {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf("?");
    if (queryIndex === -1) return new URLSearchParams(window.location.search);
    return new URLSearchParams(hash.slice(queryIndex + 1));
  }, []);
  const initialName = params.get("name") || "Gam";
  const initialIcon = resolveUrl(params.get("icon")) || "/img/gams-g.png";
  const initialSrc = resolveUrl(params.get("src"));

  const [currentName, setCurrentName] = useState(initialName);
  const [currentIcon, setCurrentIcon] = useState(initialIcon);
  const [frameSrc, setFrameSrc] = useState(initialSrc);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [windowLock, setWindowLock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hideSidebar, setHideSidebar] = useState(false);

  const popoutMode =
    (getStoredJSON<string>("gams", { key: "popoutMode" }) as string) || "top";

  const recommended = useMemo(() => getSortedRecommendedGames(), []);

  useDisguise(currentName, currentIcon);

  useEffect(() => {
    document.title = currentName;
  }, [currentName]);

  useEffect(() => {
    if (windowLock) {
      window.onbeforeunload = () =>
        "Are you sure you want to leave this page? Your changes may not be saved.";
    } else {
      window.onbeforeunload = null;
    }
    return () => {
      window.onbeforeunload = null;
    };
  }, [windowLock]);

  useEffect(() => {
    const updateFullscreenState = () => {
      const active =
        !!document.fullscreenElement ||
        !!(document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
        !!(document as Document & { msFullscreenElement?: Element }).msFullscreenElement;
      setIsFullscreen(active);
      document.body.classList.toggle("fullscreen-active", active);
    };
    document.addEventListener("fullscreenchange", updateFullscreenState);
    document.addEventListener("webkitfullscreenchange", updateFullscreenState);
    document.addEventListener("msfullscreenchange", updateFullscreenState);
    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreenState);
      document.removeEventListener("webkitfullscreenchange", updateFullscreenState);
      document.removeEventListener("msfullscreenchange", updateFullscreenState);
    };
  }, []);

  const filterStyle = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px) saturate(${filters.saturate}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%) opacity(${filters.opacity}) drop-shadow(0 0 ${filters.dropShadow}px rgba(0,0,0,0.4))`;

  const openFullscreen = () => {
    const element = document.getElementById("frame");
    if (!element) return;

    if (!document.fullscreenElement) {
      const request =
        element.requestFullscreen ||
        (element as HTMLElement & { webkitRequestFullscreen?: () => void })
          .webkitRequestFullscreen ||
        (element as HTMLElement & { msRequestFullscreen?: () => void })
          .msRequestFullscreen;
      request?.call(element);
    } else {
      const exit =
        document.exitFullscreen ||
        (document as Document & { webkitExitFullscreen?: () => void })
          .webkitExitFullscreen ||
        (document as Document & { msExitFullscreen?: () => void }).msExitFullscreen;
      exit?.call(document);
    }
  };

  const updateFilter = (key: keyof FilterState, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const sendVirtualKey = useCallback((eventType: "keydown" | "keyup", keyValue: string) => {
    const frame = document.getElementById("frame") as HTMLIFrameElement | null;
    if (!frame) return;

    const keyCodeMap: Record<string, number> = {
      ArrowUp: 38,
      ArrowDown: 40,
      ArrowLeft: 37,
      ArrowRight: 39,
      " ": 32,
    };
    const codeMap: Record<string, string> = {
      ArrowUp: "ArrowUp",
      ArrowDown: "ArrowDown",
      ArrowLeft: "ArrowLeft",
      ArrowRight: "ArrowRight",
      " ": "Space",
    };
    const keyCode = keyCodeMap[keyValue] ?? 0;
    const code = codeMap[keyValue] ?? keyValue;

    const dispatchArrowEvent = (target: EventTarget | null) => {
      if (!target || typeof (target as Window).dispatchEvent !== "function") return;
      const event = new KeyboardEvent(eventType, {
        key: keyValue,
        code,
        which: keyCode,
        keyCode,
        bubbles: true,
        cancelable: true,
      });
      (target as Window).dispatchEvent(event);
    };

    dispatchArrowEvent(window);
    try {
      if (frame.contentWindow) {
        frame.contentWindow.focus();
        dispatchArrowEvent(frame.contentWindow);
        if (frame.contentWindow.document) {
          dispatchArrowEvent(frame.contentWindow.document);
          if (frame.contentWindow.document.body) {
            dispatchArrowEvent(frame.contentWindow.document.body);
          }
        }
      }
    } catch {
      // ignore cross-origin
    }
  }, []);

  const renderRecommended = (game: RecommendedGame) => (
    <button
      key={game.name}
      type="button"
      className="card-tile card-tile-compact text-left text-xs text-textSecondary transition hover:text-textPrimary"
      onClick={() => {
        const href = resolveUrl(game.href);
        const icon = resolveUrl(game.img);
        setFrameSrc(href);
        setCurrentName(game.name);
        setCurrentIcon(icon);
      }}
    >
      <img
        src={game.img}
        alt={game.name}
        className="aspect-square w-full rounded-lg border border-panelBorder object-cover"
        width={160}
        height={160}
        loading="lazy"
        decoding="async"
      />
      <span className="block text-center text-xs font-semibold">{game.name}</span>
    </button>
  );

  return (
    <div className="relative flex min-h-screen overflow-hidden text-textSecondary">
      <aside
        className={`w-72 border-r border-panelBorder bg-panel p-4 ${
          isFullscreen || hideSidebar ? "hidden" : ""
        }`}
      >
        <h3 className="section-title">Recommended games</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">{recommended.map(renderRecommended)}</div>
      </aside>

      <main className="relative flex-1">
        <iframe
          id="frame"
          title="Game frame"
          src={frameSrc}
          className="absolute inset-0 h-full w-full border-0"
          style={{ filter: filterStyle }}
        />
      </main>

      <div
        className="info-menu"
        data-popout={popoutMode}
      >
        <div className="flex items-center gap-3">
          <img
            id="icon-img"
            src={currentIcon}
            alt="Game icon"
            className="h-12 w-12 rounded-xl"
          />
          <div className="flex-1 overflow-hidden">
            <h1 className="truncate text-sm font-semibold text-textPrimary">{currentName}</h1>
          </div>
          <a
            href="../../index.html"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-textSecondary"
            title="Back to home"
          >
            Home
          </a>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={openFullscreen}
            className="rounded-full border border-panelBorder bg-[var(--gams-bg)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-textSecondary"
          >
            {isFullscreen ? "Exit full" : "Fullscreen"}
          </button>
          <button
            type="button"
            onClick={() => setHideSidebar((prev) => !prev)}
            className="rounded-full border border-panelBorder bg-[var(--gams-bg)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-textSecondary"
          >
            {hideSidebar ? "Show sidebar" : "Hide sidebar"}
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-full border border-panelBorder bg-[var(--gams-bg)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-textSecondary"
          >
            Settings
          </button>
        </div>
      </div>

      <div className="mobile-controls" aria-label="Mobile game controls">
        <div className="mobile-dpad" aria-label="Mobile arrow controls">
          {[
            ["ArrowUp", "▲"],
            ["ArrowLeft", "◀"],
            ["ArrowDown", "▼"],
            ["ArrowRight", "▶"],
          ].map(([keyValue, label]) => (
            <button
              key={keyValue}
              type="button"
              className="arrow-btn"
              data-key={keyValue}
              onPointerDown={(event) => {
                event.preventDefault();
                sendVirtualKey("keydown", keyValue);
              }}
              onPointerUp={(event) => {
                event.preventDefault();
                sendVirtualKey("keyup", keyValue);
              }}
              onPointerLeave={(event) => {
                event.preventDefault();
                sendVirtualKey("keyup", keyValue);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="space-btn"
          onPointerDown={(event) => {
            event.preventDefault();
            sendVirtualKey("keydown", " ");
          }}
          onPointerUp={(event) => {
            event.preventDefault();
            sendVirtualKey("keyup", " ");
          }}
          onPointerLeave={(event) => {
            event.preventDefault();
            sendVirtualKey("keyup", " ");
          }}
        >
          Space
        </button>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="glass-panel w-[90vw] max-w-2xl px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Settings</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-sm font-semibold text-textSecondary"
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-4 text-sm text-textSecondary">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={windowLock}
                  onChange={(event) => setWindowLock(event.target.checked)}
                />
                Ask before closing window
              </label>
              {(
                [
                  ["Brightness", "brightness", 10, 200, 100],
                  ["Contrast", "contrast", 0, 200, 100],
                  ["Hue", "hue", 0, 360, 0],
                  ["Blur", "blur", 0, 10, 0],
                  ["Saturate", "saturate", 0, 200, 100],
                  ["Grayscale", "grayscale", 0, 100, 0],
                  ["Sepia", "sepia", 0, 100, 0],
                  ["Invert", "invert", 0, 100, 0],
                  ["Opacity", "opacity", 0, 1, 1],
                  ["Drop Shadow", "dropShadow", 0, 10, 0],
                ] as Array<[string, keyof FilterState, number, number, number]>
              ).map(([label, key, min, max, step]) => (
                <label key={key} className="grid gap-2">
                  <span>{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={filters[key]}
                    onChange={(event) => updateFilter(key, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
