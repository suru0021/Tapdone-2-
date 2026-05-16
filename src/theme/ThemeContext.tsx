import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { palettes, Palette, ThemeMode } from "./colors";

interface ThemeCtx {
  mode: ThemeMode;
  colors: Palette;
  appIcon: string;
  customAppIcon: string | null;
  setMode: (m: ThemeMode) => void;
  setAppIcon: (icon: string) => void;
  removeCustomAppIcon: () => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  mode: "forest",
  colors: palettes.forest,
  appIcon: "Sparkles",
  customAppIcon: null,
  setMode: () => {},
  setAppIcon: () => {},
  removeCustomAppIcon: () => {},
  toggle: () => {},
});

const KEY = "tapdone:themeMode";
const ICON_KEY = "tapdone:appIcon";
const CUSTOM_ICON_KEY = "tapdone:customAppIcon";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>("forest");
  const [appIcon, setAppIconState] = useState<string>("Sparkles");
  const [customAppIcon, setCustomAppIconState] = useState<string | null>(null);

  useEffect(() => {
    const v = localStorage.getItem(KEY);
    const validModes: ThemeMode[] = ["light", "dark", "midnight", "forest", "ocean", "pastel", "brutalist"];
    if (v && (validModes as string[]).includes(v)) {
      setModeState(v as ThemeMode);
    }

    const savedIcon = localStorage.getItem(ICON_KEY);
    if (savedIcon) {
      setAppIconState(savedIcon);
    }

    const savedCustom = localStorage.getItem(CUSTOM_ICON_KEY);
    if (savedCustom) {
      setCustomAppIconState(savedCustom);
    }
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(KEY, m);
    // Add custom theme class or just dark for basic tailwind dark mode
    const isDarkish = m !== 'light' && m !== 'pastel' && m !== 'brutalist';
    document.documentElement.classList.toggle('dark', isDarkish);
    document.documentElement.setAttribute('data-theme', m);
  }, []);

  const setAppIcon = useCallback((icon: string) => {
    setAppIconState(icon);
    localStorage.setItem(ICON_KEY, icon);
    
    if (icon.startsWith('data:image/')) {
      setCustomAppIconState(icon);
      localStorage.setItem(CUSTOM_ICON_KEY, icon);
    }
  }, []);

  const removeCustomAppIcon = useCallback(() => {
    setCustomAppIconState(null);
    localStorage.removeItem(CUSTOM_ICON_KEY);
    if (appIcon.startsWith('data:image/')) {
      setAppIconState("Sparkles");
      localStorage.setItem(ICON_KEY, "Sparkles");
    }
  }, [appIcon]);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const modes: ThemeMode[] = ["light", "dark", "midnight", "forest", "ocean", "pastel", "brutalist"];
      const currentIndex = modes.indexOf(prev);
      const next = modes[(currentIndex + 1) % modes.length];
      localStorage.setItem(KEY, next);
      const isDarkish = next !== 'light' && next !== 'pastel' && next !== 'brutalist';
      document.documentElement.classList.toggle('dark', isDarkish);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    const isDarkish = mode !== 'light' && mode !== 'pastel' && mode !== 'brutalist';
    document.documentElement.classList.toggle('dark', isDarkish);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, colors: palettes[mode], appIcon, customAppIcon, setMode, setAppIcon, removeCustomAppIcon, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
