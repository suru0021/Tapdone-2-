import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, ChevronRight, Share2, TrendingUp, Target, Flame } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import { useHabits, todayStr } from "../store/HabitContext";
import ProgressRing from "./ProgressRing";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const WeeklyReportOverlay: React.FC<Props> = ({ isOpen, onClose }) => {
  const { colors } = useTheme();
  const { habits, completions, completionsThisWeek, globalStreak } = useHabits();

  const stats = useMemo(() => {
    const totalGoal = habits.reduce((acc, h) => acc + (h.weeklyGoal || 7), 0);
    const totalDone = habits.reduce((acc, h) => acc + completionsThisWeek(h.id), 0);
    const pct = totalGoal === 0 ? 0 : Math.round((totalDone / totalGoal) * 100);
    
    // Find most consistent habit
    let mostConsistent = null;
    let maxDone = -1;
    habits.forEach(h => {
      const c = completionsThisWeek(h.id);
      if (c > maxDone) {
        maxDone = c;
        mostConsistent = h;
      }
    });

    return { pct, totalDone, totalGoal, mostConsistent };
  }, [habits, completionsThisWeek]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex flex-col p-6 overflow-y-auto" style={{ backgroundColor: colors.background }}>
        <div className="absolute inset-0 opacity-10 blur-3xl pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${colors.accentPrimary}, transparent)` }} />
        
        <header className="flex items-center justify-between mb-10 relative z-10">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <Sparkles size={24} style={{ color: colors.accentPrimary }} />
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full flex items-center justify-center border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2 block" style={{ color: colors.textSecondary }}>The Weekly Report</span>
            <h1 className="text-5xl font-black tracking-tighter mb-8 leading-none" style={{ color: colors.textPrimary }}>
              Your Week in <br/><span style={{ color: colors.accentPrimary }}>Motion.</span>
            </h1>
          </motion.div>

          <div className="grid gap-6">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
               className="p-8 rounded-[40px] border flex flex-col items-center text-center gap-6"
               style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
               <ProgressRing progress={stats.pct / 100} size={160} strokeWidth={10} color={colors.accentPrimary} label="Completion Rate" />
               <div className="flex items-center gap-6">
                 <div className="text-center">
                   <p className="text-2xl font-black" style={{ color: colors.textPrimary }}>{stats.totalDone}</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: colors.textSecondary }}>Finished</p>
                 </div>
                 <div className="w-[1px] h-8 bg-white/10" />
                 <div className="text-center">
                   <p className="text-2xl font-black" style={{ color: colors.textPrimary }}>{stats.totalGoal}</p>
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: colors.textSecondary }}>Goals</p>
                 </div>
               </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-[32px] border flex flex-col gap-4"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Flame size={20} />
                </div>
                <div>
                   <p className="text-xs font-bold opacity-40 uppercase tracking-widest" style={{ color: colors.textSecondary }}>Best Streak</p>
                   <p className="text-2xl font-black" style={{ color: colors.textPrimary }}>{globalStreak}d</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-[32px] border flex flex-col gap-4"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <TrendingUp size={20} />
                </div>
                <div>
                   <p className="text-xs font-bold opacity-40 uppercase tracking-widest" style={{ color: colors.textSecondary }}>Efficiency</p>
                   <p className="text-2xl font-black" style={{ color: colors.textPrimary }}>{stats.pct}%</p>
                </div>
              </motion.div>
            </div>

            {stats.mostConsistent && (
               <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-8 rounded-[40px] border flex items-center gap-6 bg-gradient-to-br from-zinc-900 to-black"
                style={{ borderColor: colors.border }}
              >
                <div 
                  className="w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 border-2"
                  style={{ backgroundColor: stats.mostConsistent.color + "22", borderColor: stats.mostConsistent.color + "44", color: stats.mostConsistent.color }}
                >
                  <Target size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1" style={{ color: colors.textSecondary }}>Leading Habit</p>
                  <h4 className="text-xl font-black tracking-tight" style={{ color: colors.textPrimary }}>{stats.mostConsistent.name}</h4>
                  <p className="text-xs font-medium opacity-60 mt-1" style={{ color: colors.textSecondary }}>Unstoppable consistency this week.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <footer className="mt-12 mb-6">
           <button 
             onClick={onClose}
             className="w-full h-16 rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-transform active:scale-95 flex items-center justify-center gap-2"
             style={{ backgroundColor: colors.textPrimary, color: colors.background }}
           >
             Continue to Today
             <ChevronRight size={18} />
           </button>
        </footer>
      </div>
    </AnimatePresence>
  );
};

export default WeeklyReportOverlay;
