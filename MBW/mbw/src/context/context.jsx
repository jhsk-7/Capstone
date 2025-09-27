"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  isDark: false,
  toggleDark: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  // Initialize from storage or system preference
  useEffect(() => {
    // guard for SSR
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const enableDark = stored === "dark" || (!stored && prefersDark);
    setIsDark(enableDark);
  }, []);

  // Sync <html class="dark"> + persist
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", isDark);

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }
  }, [isDark]);

  const toggleDark = () => setIsDark((v) => !v);

  const value = useMemo(() => ({ isDark, toggleDark }), [isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}