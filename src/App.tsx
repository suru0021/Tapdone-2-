import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext";
import { HabitProvider } from "./store/HabitContext";
import { ProfileProvider } from "./store/ProfileContext";
import Celebration from "./components/Celebration";
import { adService } from "./services/AdService";
import { Capacitor } from "@capacitor/core";
import { useTheme } from "./theme/ThemeContext";

const Layout     = lazy(() => import("./components/Layout"));
const Home       = lazy(() => import("./pages/Home"));
const Stats      = lazy(() => import("./pages/Stats"));
const Settings   = lazy(() => import("./pages/Settings"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AddHabit   = lazy(() => import("./pages/AddHabit"));
const Profile    = lazy(() => import("./pages/Profile"));
const Premium    = lazy(() => import("./pages/Premium"));

const Spinner = () => {
  const { colors } = useTheme();
  return (
    <div className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: colors.background }}>
      <div className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{ borderColor: colors.border, borderTopColor: colors.accentPrimary }}/>
    </div>
  );
};

const Root = () => {
  const { colors } = useTheme();
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem("tapdone:onboarded") === "1"
  );

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    // Initialize ads immediately — preloads rewarded+interstitial in background
    adService.initialize().catch(() => {});
    // Banner after 2.5s — lets app render first
    const t = setTimeout(() => adService.showBanner().catch(() => {}), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = () => setOnboarded(true);
    window.addEventListener("tapdone:onboarded", handler);
    const storageHandler = (e: StorageEvent) => {
      if (e.key === "tapdone:onboarded" && e.newValue === "1") setOnboarded(true);
    };
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("tapdone:onboarded", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  return (
    <div style={{ backgroundColor: colors.background, minHeight: "100vh" }}>
      <Router>
        <Celebration />
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={
              onboarded
                ? <Navigate to="/home" replace />
                : <Navigate to="/onboarding" replace />
            }/>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route element={<Layout />}>
              <Route path="/home"     element={<Home />} />
              <Route path="/stats"    element={<Stats />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/add-habit" element={<AddHabit />} />
            <Route path="/profile"   element={<Profile />} />
            <Route path="/premium"   element={<Premium />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <HabitProvider>
          <Root />
        </HabitProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}
