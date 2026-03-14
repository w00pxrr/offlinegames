import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function inferPageFromPath(pathname: string): string {
  const lower = pathname.toLowerCase();
  if (lower.endsWith("settings.html")) return "settings";
  if (lower.endsWith("/games/about.html") || lower.endsWith("about.html"))
    return "about";
  if (lower.endsWith("gameembed.html")) return "game-embed";
  return "home";
}

const rootEl = document.getElementById("root");
if (rootEl) {
  const page = rootEl.getAttribute("data-page") || inferPageFromPath(window.location.pathname);
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App page={page} />
    </React.StrictMode>
  );
}
