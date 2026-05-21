import { useState, useEffect, lazy, Suspense, memo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext";
import { HabitProvider } from "./store/HabitContext";
import { ProfileProvider } from "./store/ProfileContext";
import Celebration from "./components/Celebration";
import { adService } from "./services/AdService";
import { Capacitor } from "@capacitor/core";
import { useTheme } from "./theme/ThemeContext";

const Layout = lazy(() => import("./components/Layout"));
const Home = lazy(() => import("./pages/Home"));
const Stats = lazy(() => import("./pages/Stats"));
const Settings = lazy(() => import("./pages/Settings"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AddHabit = lazy(() => import("./pages/AddHabit"));
const Profile = lazy(() => import("./pages/Profile"));
const Premium = lazy(() => import("./pages/Premium"));

const Spinner = memo(() => {
  const { colors } = useTheme();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{
          borderColor: colors.border,
          borderTopColor: colors.accentPrimary,
        }}
      />
    </div>
  );
});

export const notifyOnboardingDone = () => {
  localStorage.setItem("tapdone:onboarded", "1");
  window.dispatchEvent(new Event("tapdone:onboarded"));
};

const Root = memo(() => {
  const { colors } = useTheme();

  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem("tapdone:onboarded") === "1"
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (Capacitor.isNativePlatform()) {
      requestIdleCallback?.(() => {
        adService.initialize().catch(() => {});
      });

      timeout = setTimeout(() => {
        adService.showBanner().catch(() => {});
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const handler = () => setOnboarded(true);

    const storageHandler = (e: StorageEvent) => {
      if (e.key === "tapdone:onboarded" && e.newValue === "1") {
        setOnboarded(true);
      }
    };

    window.addEventListener("tapdone:onboarded", handler, { passive: true });
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener("tapdone:onboarded", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: colors.background,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Router>
        <Celebration />

        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route
              path="/"
              element={
                onboarded ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Navigate to="/onboarding" replace />
                )
              }
            />

            <Route path="/onboarding" element={<Onboarding />} />

            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="/add-habit" element={<AddHabit />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/premium" element={<Premium />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
});

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
