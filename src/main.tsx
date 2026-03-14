import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function inferPage(): string {
  const hash = window.location.hash.toLowerCase();
  if (hash.startsWith("#/settings")) return "settings";
  if (hash.startsWith("#/about")) return "about";
  if (hash.startsWith("#/game-embed")) return "game-embed";

  const lower = window.location.pathname.toLowerCase();
  if (lower.endsWith("settings.html")) return "settings";
  if (lower.endsWith("/games/about.html") || lower.endsWith("about.html"))
    return "about";
  if (lower.endsWith("gameembed.html")) return "game-embed";
  return "home";
}

function Root() {
  const [page, setPage] = useState(() => inferPage());

  useEffect(() => {
    const handleChange = () => setPage(inferPage());
    window.addEventListener("hashchange", handleChange);
    window.addEventListener("popstate", handleChange);
    return () => {
      window.removeEventListener("hashchange", handleChange);
      window.removeEventListener("popstate", handleChange);
    };
  }, []);

  return <App page={page} />;
}

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}
