import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "motion/react";
import { ACHIEVEMENTS } from "../constants/achievements";
import { Trophy, Star } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

const Celebration: React.FC = () => {
  const { colors } = useTheme();
  const [activeAchievement, setActiveAchievement] = useState<string | null>(null);

  useEffect(() => {
    const handleUnlock = (e: any) => {
      const ids = e.detail as string[];
      if (ids.length > 0) {
        // Show the last unlocked one for simplicity, or queue them
        setActiveAchievement(ids[ids.length - 1]);
        
        // Throw some confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: [colors.accentPrimary, colors.success, "#FACC15"]
        });

        // Auto-hide after 5 seconds
        setTimeout(() => setActiveAchievement(null), 5000);
      }
    };

    window.addEventListener("achievement-unlocked", handleUnlock);
    return () => window.removeEventListener("achievement-unlocked", handleUnlock);
  }, [colors]);

  const meta = ACHIEVEMENTS.find(a => a.id === activeAchievement);

  return (
    <AnimatePresence>
      {activeAchievement && meta && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          className="fixed bottom-24 left-6 right-6 z-[100] p-6 rounded-[32px] border-2 shadow-2xl flex items-center gap-5"
          style={{ 
            backgroundColor: colors.surface, 
            borderColor: meta.color,
            boxShadow: `0 20px 50px -10px ${meta.color}44`
          }}
        >
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: meta.color + "22", color: meta.color }}
          >
            <meta.icon size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Star size={12} fill={meta.color} color={meta.color} />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: colors.textSecondary }}>Achievement Unlocked</span>
            </div>
            <h3 className="text-lg font-black tracking-tighter leading-tight" style={{ color: colors.textPrimary }}>{meta.name}</h3>
            <p className="text-xs font-medium opacity-60 leading-relaxed" style={{ color: colors.textSecondary }}>{meta.description}</p>
          </div>
          <button 
            onClick={() => setActiveAchievement(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
          >
            <Trophy size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Celebration;
