import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Info, Flame, AlertCircle, Sparkles } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import { useHabits, todayStr, habitsDueOn } from "../store/HabitContext";

const SmartTip: React.FC = () => {
  const { colors } = useTheme();
  const { habits, isCompletedOn, globalStreak } = useHabits();

  const tip = useMemo(() => {
    const today = todayStr();
    const dueToday = habitsDueOn(habits, new Date());
    const incomplete = dueToday.filter(h => !isCompletedOn(h.id, today));

    const emotionalAffirmations = [
      "Small acts, repeated, grow into giants.",
      "You were enough before you did anything today.",
      "Gentle consistency over rigid perfection.",
      "Celebrate the fact that you showed up.",
      "The path is as beautiful as the destination."
    ];

    if (incomplete.length === 0 && habits.length > 0) {
      return {
        icon: Sparkles,
        text: "Today's journey is complete. Rest well.",
        color: colors.success
      };
    }

    if (incomplete.length === 1) {
      return {
        icon: Flame,
        text: `Your ${globalStreak} day momentum is strong. Just one more?`,
        color: "#FB923C"
      };
    }

    if (incomplete.length > 1) {
      const randomAffirmation = emotionalAffirmations[Math.floor(Math.random() * emotionalAffirmations.length)];
      return {
        icon: Sparkles,
        text: randomAffirmation,
        color: colors.accentPrimary
      };
    }

    return null;
  }, [habits, isCompletedOn, globalStreak, colors]);

  if (!tip) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-6 p-6 rounded-[32px] flex items-center gap-5 border shadow-sm mb-12 glass"
      style={{ backgroundColor: colors.surface + "80", borderColor: colors.border }}
    >
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: tip.color + "10", color: tip.color }}
      >
        <tip.icon size={22} className="text-glow" />
      </div>
      <p className="text-sm font-serif italic leading-relaxed opacity-80" style={{ color: colors.textPrimary }}>
        "{tip.text}"
      </p>
    </motion.div>
  );
};

export default SmartTip;
