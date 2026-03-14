import React from "react";
import { useTheme } from "./hooks/useTheme";
import HomePage from "./pages/Home";
import SettingsPage from "./pages/Settings";
import AboutPage from "./pages/About";
import GameEmbedPage from "./pages/GameEmbed";

type AppProps = {
  page: string;
};

export default function App({ page }: AppProps) {
  const { theme, toggleTheme } = useTheme();

  let content: React.ReactNode;
  if (page === "settings") {
    content = <SettingsPage isDark={theme === "dark"} onToggleTheme={toggleTheme} />;
  } else if (page === "about") {
    content = <AboutPage isDark={theme === "dark"} onToggleTheme={toggleTheme} />;
  } else if (page === "game-embed") {
    content = <GameEmbedPage />;
  } else {
    content = <HomePage isDark={theme === "dark"} onToggleTheme={toggleTheme} />;
  }

  return <>{content}</>;
}
