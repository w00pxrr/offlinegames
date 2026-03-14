import { useEffect, useState } from "react";
import { getStoredJSON, storeJSON } from "../utils/storage";

type ThemeMode = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-reduced-motion", "true");
    const savedTheme = getStoredJSON<string>("gams", { key: "theme" });
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      return;
    }

    const media = window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
    if (media) {
      const applyAutoTheme = (isDark: boolean) => {
        const nextTheme: ThemeMode = isDark ? "dark" : "light";
        setTheme(nextTheme);
        document.documentElement.classList.toggle("dark", isDark);
      };
      applyAutoTheme(media.matches);
      media.addEventListener("change", (e) => applyAutoTheme(e.matches));
      return;
    }

    document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = (nextDark: boolean) => {
    const nextTheme: ThemeMode = nextDark ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextDark);
    storeJSON("gams", { key: "theme", value: nextTheme });
  };

  return { theme, toggleTheme };
}
