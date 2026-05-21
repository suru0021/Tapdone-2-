import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Crown, Check, Sparkles, BarChart3, Palette, Bell, Play, Loader, Clock, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../theme/ThemeContext";
import { activatePremiumPreview } from "../theme/ThemeContext";
import { adService } from "../services/AdService";
import { THEME_META, PREMIUM_THEMES, BASIC_THEMES } from "../theme/colors";
import ThemeBackground from "../components/ThemeBackground";

const FEATURES = [
  { Icon: Palette,   title: "10 Exclusive Themes",    sub: "Ferrari, Bugatti, Galaxy, Neon & more" },
  { Icon: BarChart3, title: "Advanced Analytics",     sub: "Monthly heatmap, habit deep-dive, trend graphs" },
  { Icon: Bell,      title: "Smart Reminders",        sub: "Multiple reminders per habit, streak protection" },
  { Icon: Sparkles,  title: "Unlimited Habits",       sub: "No limits — track everything you want" },
  { Icon: Check,     title: "No Ads, Ever",           sub: "100% calm, distraction-free experience" },
];

const AD_COUNT = 4;

const Premium: React.FC = () => {
  const { colors, mode, setMode, isPremiumUser, isPremiumPreview, premiumPreviewSecondsLeft } = useTheme();
  const navigate = useNavigate();

  const [adLoading, setAdLoading] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const canAccessPremium = isPremiumUser || isPremiumPreview;

  const handleWatchAds = async () => {
    // Instant feedback — show loading state immediately
    setAdLoading(true);
    setAdProgress(0);

    // Small vibration feedback if available
    if ((navigator as any).vibrate) (navigator as any).vibrate(30);

    // Tiny delay so UI updates before ad loads
    await new Promise(r => setTimeout(r, 100));

    try {
      const success = await adService.showRewardedSequence(AD_COUNT, (current, _total) => {
        setAdProgress(current);
      });
      setAdLoading(false);
      setAdProgress(0);
      if (success) {
        activatePremiumPreview();
        setMode("ferrari");
      } else {
        // Don't show alert — just reset silently, user already saw what happened
        setAdLoading(false);
      }
    } catch (e) {
      setAdLoading(false);
      setAdProgress(0);
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 220 }}
      className="fixed inset-0 z-[60] flex flex-col overflow-y-auto"
      style={{ backgroundColor: colors.background }}
    >
      <ThemeBackground />
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-4">
        <div />
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border flex items-center justify-center"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </header>

      <div className="flex-1 px-6 max-w-md mx-auto w-full pb-52 space-y-6">

        {/* Title */}
        <div className="flex flex-col items-center text-center pt-2 pb-2">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            className="w-20 h-20 rounded-[28px] border-2 flex items-center justify-center mb-5 shadow-2xl"
            style={{ borderColor: colors.accentPrimary + "60", backgroundColor: colors.surface,
              boxShadow: `0 0 40px ${colors.accentPrimary}30` }}
          >
            <Crown size={34} style={{ color: colors.accentPrimary }} />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: colors.textPrimary }}>
            TapDone Premium
          </h1>
          <p className="text-sm font-medium leading-relaxed opacity-60 max-w-[260px]" style={{ color: colors.textSecondary }}>
            Unlock the full experience. One-time forever.
          </p>
        </div>

        {/* Preview Active Banner */}
        <AnimatePresence>
          {isPremiumPreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-2xl border-2 flex items-center gap-3"
              style={{ backgroundColor: colors.accentPrimary + "15", borderColor: colors.accentPrimary + "50" }}
            >
              <Clock size={20} style={{ color: colors.accentPrimary }} />
              <div className="flex-1">
                <p className="text-xs font-black" style={{ color: colors.accentPrimary }}>Preview Active!</p>
                <p className="text-[10px] opacity-70" style={{ color: colors.textSecondary }}>
                  All premium themes unlocked
                </p>
              </div>
              <span className="text-lg font-black tabular-nums" style={{ color: colors.accentPrimary }}>
                {formatTime(premiumPreviewSecondsLeft)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ad Loading Progress */}
        <AnimatePresence>
          {adLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-5 rounded-2xl border flex flex-col gap-3"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: colors.textPrimary }}>
                  Watching Ad {adProgress}/{AD_COUNT}
                </span>
                <Loader size={16} className="animate-spin" style={{ color: colors.accentPrimary }} />
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors.accentPrimary }}
                  animate={{ width: `${(adProgress / AD_COUNT) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-[10px] opacity-50 text-center" style={{ color: colors.textSecondary }}>
                {AD_COUNT - adProgress} ads remaining — please don't close
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Themes Preview */}
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3 px-1" style={{ color: colors.textSecondary }}>
            Exclusive Themes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PREMIUM_THEMES.map((themeKey) => {
              const meta = THEME_META[themeKey];
              const isActive = mode === themeKey;
              const locked = !canAccessPremium;
              return (
                <motion.button
                  key={themeKey}
                  whileTap={{ scale: locked ? 1 : 0.96 }}
                  onClick={() => {
                    if (!locked) setMode(themeKey);
                  }}
                  className="p-3 rounded-2xl border flex items-center gap-3 text-left relative overflow-hidden"
                  style={{
                    backgroundColor: isActive ? colors.accentPrimary + "20" : colors.surface,
                    borderColor: isActive ? colors.accentPrimary + "80" : colors.border,
                    opacity: locked ? 0.7 : 1,
                  }}
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate" style={{ color: colors.textPrimary }}>{meta.name}</p>
                    <p className="text-[9px] opacity-50 truncate" style={{ color: colors.textSecondary }}>{meta.desc}</p>
                  </div>
                  {locked && (
                    <Lock size={12} style={{ color: colors.textTertiary }} />
                  )}
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: colors.accentPrimary }} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-1" style={{ color: colors.textSecondary }}>
            Everything Included
          </h2>
          {FEATURES.map((f, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                <f.Icon size={18} style={{ color: colors.accentPrimary }} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>{f.title}</h3>
                <p className="text-[11px] opacity-50 leading-tight" style={{ color: colors.textSecondary }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="fixed bottom-0 left-0 right-0 p-5 px-6 border-t flex flex-col gap-3 z-[70]"
        style={{ borderColor: colors.border, backgroundColor: colors.background }}
      >
        {/* Buy Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowComingSoon(true)}
          className="w-full h-14 rounded-[20px] text-base font-black tracking-tight shadow-xl"
          style={{ backgroundColor: colors.accentPrimary, color: colors.background }}
        >
          {isPremiumUser ? "✓ Premium Active" : "Unlock Forever — ₹299"}
        </motion.button>

        {/* Watch Ad Button */}
        {!isPremiumUser && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={adLoading || isPremiumPreview}
            onClick={handleWatchAds}
            className="w-full h-12 rounded-[20px] text-xs font-black tracking-widest uppercase border flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ borderColor: colors.border, color: colors.textPrimary }}
          >
            {adLoading ? (
              <><Loader size={14} className="animate-spin" /> Loading Ad {adProgress}/{AD_COUNT}...</>
            ) : isPremiumPreview ? (
              <><Check size={14} /> Preview Active — {formatTime(premiumPreviewSecondsLeft)}</>
            ) : (
              <><Play size={14} fill="currentColor" /> Watch {AD_COUNT} Ads → 10 Min Preview</>
            )}
          </motion.button>
        )}
      </footer>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowComingSoon(false)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-2xl font-black mb-2" style={{ color: colors.textPrimary }}>Coming Soon...</h2>
              <p className="text-sm opacity-60 leading-relaxed mb-6" style={{ color: colors.textSecondary }}>
                Payment is being set up. Use "Watch Ads" to preview premium features for now!
              </p>
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full h-12 rounded-2xl font-bold"
                style={{ backgroundColor: colors.accentPrimary, color: colors.background }}
              >
                Got it!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Premium;
