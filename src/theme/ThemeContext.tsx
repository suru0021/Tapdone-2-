import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { palettes, Palette, ThemeMode, BASIC_THEMES, PREMIUM_THEMES } from "./colors";

interface ThemeCtx {
  mode: ThemeMode;
  colors: Palette;
  appIcon: string;
  customAppIcon: string | null;
  setMode: (m: ThemeMode) => void;
  setAppIcon: (icon: string) => void;
  removeCustomAppIcon: () => void;
  toggle: () => void;
  isPremiumTheme: (m: ThemeMode) => boolean;
  isPremiumUser: boolean;
  isPremiumPreview: boolean;
  premiumPreviewSecondsLeft: number;
}

const ThemeContext = createContext<ThemeCtx>({
  mode: "forest", colors: palettes.forest, appIcon: "Sparkles",
  customAppIcon: null, setMode: () => {}, setAppIcon: () => {},
  removeCustomAppIcon: () => {}, toggle: () => {},
  isPremiumTheme: () => false, isPremiumUser: false,
  isPremiumPreview: false, premiumPreviewSecondsLeft: 0,
});

const KEY = "tapdone:themeMode";
const ICON_KEY = "tapdone:appIcon";
const CUSTOM_ICON_KEY = "tapdone:customAppIcon";
const PREVIEW_EXPIRY_KEY = "tapdone:premium_preview_expiry";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>("forest");
  const [appIcon, setAppIconState] = useState<string>("Sparkles");
  const [customAppIcon, setCustomAppIconState] = useState<string | null>(null);
  const [premiumPreviewSecondsLeft, setPremiumPreviewSecondsLeft] = useState(0);
  const [isPremiumUser, setIsPremiumUser] = useState(() => localStorage.getItem("tapdone:is_premium") === "true");

  const isPremiumPreview = premiumPreviewSecondsLeft > 0;

  useEffect(() => {
    const v = localStorage.getItem(KEY) as ThemeMode | null;
    if (v && (v in palettes)) setModeState(v as ThemeMode);
    const savedIcon = localStorage.getItem(ICON_KEY);
    if (savedIcon) setAppIconState(savedIcon);
    const savedCustom = localStorage.getItem(CUSTOM_ICON_KEY);
    if (savedCustom) setCustomAppIconState(savedCustom);

    // Check preview timer
    const checkPreview = () => {
      const expiry = localStorage.getItem(PREVIEW_EXPIRY_KEY);
      if (!expiry) { setPremiumPreviewSecondsLeft(0); return; }
      const left = Math.max(0, Math.floor((parseInt(expiry) - Date.now()) / 1000));
      setPremiumPreviewSecondsLeft(left);
      if (left === 0) {
        // Revert to basic theme if on premium theme
        const currentMode = localStorage.getItem(KEY) as ThemeMode;
        if (currentMode && PREMIUM_THEMES.includes(currentMode)) {
          setModeState("forest");
          localStorage.setItem(KEY, "forest");
        }
        localStorage.removeItem(PREVIEW_EXPIRY_KEY);
        localStorage.removeItem("tapdone:premium_preview");
      }
    };

    checkPreview();
    const interval = setInterval(checkPreview, 1000);
    return () => clearInterval(interval);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(KEY, m);
    const isDarkish = !["light"].includes(m);
    document.documentElement.classList.toggle('dark', isDarkish);
    document.documentElement.setAttribute('data-theme', m);
  }, []);

  const isPremiumTheme = useCallback((m: ThemeMode) => PREMIUM_THEMES.includes(m), []);

  const toggle = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const setAppIcon = useCallback((icon: string) => {
    setAppIconState(icon);
    localStorage.setItem(ICON_KEY, icon);
  }, []);

  const removeCustomAppIcon = useCallback(() => {
    setCustomAppIconState(null);
    localStorage.removeItem(CUSTOM_ICON_KEY);
  }, []);

  return (
    <ThemeContext.Provider value={{
      mode, colors: palettes[mode] || palettes.forest,
      appIcon, customAppIcon, setMode, setAppIcon, removeCustomAppIcon, toggle,
      isPremiumTheme, isPremiumUser, isPremiumPreview, premiumPreviewSecondsLeft,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Call this when preview is activated — sets 10 min expiry
export const activatePremiumPreview = () => {
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  localStorage.setItem(PREVIEW_EXPIRY_KEY, expiry.toString());
  localStorage.setItem("tapdone:premium_preview", "true");
};
