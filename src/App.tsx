import React, { Suspense } from "react";
import { useTheme } from "./hooks/useTheme";

const HomePage = React.lazy(() => import("./pages/Home"));
const SettingsPage = React.lazy(() => import("./pages/Settings"));
const AboutPage = React.lazy(() => import("./pages/About"));
const GameEmbedPage = React.lazy(() => import("./pages/GameEmbed"));

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

  return <Suspense fallback={null}>{content}</Suspense>;
}
