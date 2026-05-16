import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Crown, Check, Sparkles, BarChart3, Palette, Bell, Play } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../theme/ThemeContext";
import { adService } from "../services/AdService";

const FEATURES = [
  { Icon: Sparkles, title: "Premium themes", sub: "Unlock soft pastels, monochrome and warm earth tones" },
  { Icon: BarChart3, title: "Advanced analytics", sub: "Year-long heatmap, monthly insights, trend lines" },
  { Icon: Palette, title: "Custom icons & colors", sub: "Hundreds more icons and accent palettes" },
  { Icon: Bell, title: "Smart reminders", sub: "Adaptive nudges that respect your schedule" },
  { Icon: Check, title: "No ads, ever", sub: "100% calm, distraction-free experience" },
];

const Premium: React.FC = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleWatchAd = async () => {
    setLoading(true);
    const success = await adService.showRewarded();
    setLoading(false);
    if (success) {
      alert("Reward Unlocked! Premium themes are now available for this session.");
      // In a real app, you'd persist this in state/localstorage
      localStorage.setItem("tapdone:premium_preview", "true");
      navigate('/settings');
    } else {
      alert("Ad failed to load. Please try again later.");
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] flex flex-col h-full overflow-y-auto"
      style={{ backgroundColor: colors.background }}
    >
      <header className="flex items-center justify-end px-6 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-transform active:scale-90"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </header>

      <div className="flex-1 px-8 space-y-8 max-w-md mx-auto pb-32">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-[28px] border flex items-center justify-center mb-8 bg-inherit shadow-lg" style={{ borderColor: colors.border }}>
            <Crown size={32} style={{ color: colors.textPrimary }} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3" style={{ color: colors.textPrimary }}>TapDone Premium</h1>
          <p className="text-[15px] font-medium leading-relaxed" style={{ color: colors.textSecondary }}>
            One-time payment. Unlock everything, forever. Calm, distraction-free, yours to keep.
          </p>
        </div>

        <div className="p-6 rounded-[24px] border border-2 flex items-center justify-between" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-60" style={{ color: colors.textSecondary }}>Lifetime</p>
            <p className="text-3xl font-bold mt-1" style={{ color: colors.textPrimary }}>$9.99</p>
          </div>
          <div className="bg-green-500/20 px-3 py-1.5 rounded-full">
            <span className="text-[11px] font-bold text-green-500 uppercase tracking-widest">One-time</span>
          </div>
        </div>

        <div className="space-y-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                <f.Icon size={18} style={{ color: colors.textPrimary }} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight" style={{ color: colors.textPrimary }}>{f.title}</h3>
                <p className="text-xs font-medium opacity-60 leading-normal" style={{ color: colors.textSecondary }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-6 px-8 border-t bg-inherit max-w-md mx-auto z-[70] flex flex-col gap-3" style={{ borderColor: colors.border }}>
        <button
          onClick={() => alert("Premium functionality Coming Soon!")}
          className="w-full h-14 rounded-[20px] text-base font-bold tracking-tight shadow-xl transition-transform active:scale-95"
          style={{ backgroundColor: colors.accentPrimary, color: colors.background }}
        >
          Unlock Forever
        </button>
        <button
          disabled={loading}
          onClick={handleWatchAd}
          className="w-full h-12 rounded-[20px] text-xs font-bold tracking-widest uppercase border flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          style={{ borderColor: colors.border, color: colors.textPrimary }}
        >
          {loading ? "Loading..." : <><Play size={14} fill="currentColor" /> Watch Ad for Preview</>}
        </button>
      </footer>
    </motion.div>
  );
};

export default Premium;
