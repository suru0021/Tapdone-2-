import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { ACHIEVEMENTS } from "../constants/achievements";
import { Star, X } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

const CONFETTI_COLORS = ["#a855f7", "#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#ffffff"];

// CSS-only confetti — GPU accelerated, no motion library needed
const ConfettiPiece: React.FC<{ color: string; delay: number; x: number }> = ({ color, delay, x }) => (
  <div
    className="fixed top-0 w-2 h-3 rounded-sm pointer-events-none"
    style={{
      left: `${x}%`,
      backgroundColor: color,
      zIndex: 200,
      willChange: "transform",
      animation: `confettiFall 2.5s ${delay}s ease-in forwards`,
    }}
  />
);

const CONFETTI_COLORS = ["#a855f7", "#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#ffffff"];

const Celebration: React.FC = () => {
  const { colors } = useTheme();
  const [activeAchievement, setActiveAchievement] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleUnlock = (e: any) => {
      const ids = e.detail as string[];
      if (!ids || ids.length === 0) return;

      // Clear any existing timer
      if (timerRef.current) clearTimeout(timerRef.current);

      setActiveAchievement(ids[ids.length - 1]);
      setShowConfetti(true);

      // Hide confetti after 2.5s
      setTimeout(() => setShowConfetti(false), 2500);

      // Auto-hide popup after 5s
      timerRef.current = setTimeout(() => setActiveAchievement(null), 5000);
    };

    window.addEventListener("achievement-unlocked", handleUnlock);
    return () => {
      window.removeEventListener("achievement-unlocked", handleUnlock);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const meta = ACHIEVEMENTS.find(a => a.id === activeAchievement);

  const confettiPieces = Array.from({ length: 10 }, (_, i) => ({
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: i * 0.12,
    x: 5 + (i * 9.5),
  }));

  return (
    <>
      {/* CSS Confetti — no library needed */}
      <AnimatePresence>
        {showConfetti && confettiPieces.map((p, i) => (
          <ConfettiPiece key={i} {...p} />
        ))}
      </AnimatePresence>

      {/* Achievement popup */}
      <AnimatePresence>
        {activeAchievement && meta && (
          <motion.div
            key={activeAchievement}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-28 left-4 right-4 z-[150] p-5 rounded-[28px] border-2 shadow-2xl flex items-center gap-4"
            style={{
              backgroundColor: colors.surface,
              borderColor: meta.color,
              boxShadow: `0 16px 40px -8px ${meta.color}55`,
            }}
          >
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: meta.color + "22", color: meta.color }}
            >
              <meta.icon size={28} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Star size={10} fill={meta.color} color={meta.color} />
                <span
                  className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: colors.textSecondary, opacity: 0.7 }}
                >
                  Achievement Unlocked
                </span>
              </div>
              <h3
                className="text-base font-black tracking-tight leading-tight truncate"
                style={{ color: colors.textPrimary }}
              >
                {meta.name}
              </h3>
              <p
                className="text-xs font-medium leading-snug line-clamp-2"
                style={{ color: colors.textSecondary, opacity: 0.6 }}
              >
                {meta.description}
              </p>
            </div>

            {/* Close button */}
            <button
              onTouchEnd={(e) => { e.preventDefault(); setActiveAchievement(null); }}
              onClick={() => setActiveAchievement(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: colors.border }}
            >
              <X size={14} style={{ color: colors.textSecondary }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Celebration;
