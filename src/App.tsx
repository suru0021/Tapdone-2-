import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext";
import { HabitProvider } from "./store/HabitContext";
import { ProfileProvider } from "./store/ProfileContext";
import { AnimatePresence } from "motion/react";
import Celebration from "./components/Celebration";
import { adService } from "./services/AdService";

// Lazy Pages
const Layout = lazy(() => import("./components/Layout"));
const Home = lazy(() => import("./pages/Home"));
const Stats = lazy(() => import("./pages/Stats"));
const Settings = lazy(() => import("./pages/Settings"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AddHabit = lazy(() => import("./pages/AddHabit"));
const Profile = lazy(() => import("./pages/Profile"));
const Premium = lazy(() => import("./pages/Premium"));

const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black">
    <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
  </div>
);

const Root = () => {
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem("tapdone:onboarded") === "1");

  useEffect(() => {
    // Initialize Ads and show Banner
    adService.initialize().then(() => {
      adService.showBanner();
    });

    const handleStorage = () => {
      setOnboarded(localStorage.getItem("tapdone:onboarded") === "1");
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(handleStorage, 500);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <Celebration />
      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={onboarded ? <Navigate to="/home" replace /> : <Navigate to="/onboarding" replace />} />
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
        </AnimatePresence>
      </Suspense>
    </Router>
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
