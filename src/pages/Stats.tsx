import React, { useMemo, useEffect } from "react";
import { Trophy, TrendingUp, Calendar, Flame, Target, Award } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../theme/ThemeContext";
import { useHabits, todayStr, habitsDueOn } from "../store/HabitContext";
import Heatmap from "../components/Heatmap";
import { ACHIEVEMENTS } from "../constants/achievements";
import { adService } from "../services/AdService";

const Stats: React.FC = () => {
  const { colors } = useTheme();
  
  useEffect(() => {
    adService.showBanner();
    return () => {
      adService.hideBanner();
    };
  }, []);
  const { habits, completions, longestStreakFor, streakFor, completionsThisWeek, globalStreak, overallConsistency, achievements } = useHabits();

  const weekly = useMemo(() => {
    const out: { day: string; pct: number; date: string; isToday: boolean }[] = [];
    const now = new Date();
    const todayStrNow = todayStr(now);
    
    // Find Monday of the current week
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dueList = habitsDueOn(habits, d);
      const ds = todayStr(d);
      const completedCount = dueList.filter((h) => (completions[h.id] || []).includes(ds)).length;
      const pct = dueList.length === 0 ? 0 : completedCount / dueList.length;
      const dayLabel = d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
      out.push({ day: dayLabel, pct, date: ds, isToday: ds === todayStrNow });
    }
    return out;
  }, [habits, completions]);

  const weeklyAvg = useMemo(() => {
    const validPcts = weekly.filter(w => new Date(w.date) <= new Date());
    if (validPcts.length === 0) return 0;
    const sum = validPcts.reduce((acc, curr) => acc + curr.pct, 0);
    return sum / validPcts.length;
  }, [weekly]);

  const monthlyPct = useMemo(() => {
    let dueTotal = 0, completedTotal = 0;
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dueList = habitsDueOn(habits, d);
      const ds = todayStr(d);
      dueTotal += dueList.length;
      completedTotal += dueList.filter((h) => (completions[h.id] || []).includes(ds)).length;
    }
    return dueTotal === 0 ? 0 : completedTotal / dueTotal;
  }, [habits, completions]);

  const longestStreakOverall = useMemo(() => {
    let m = 0; habits.forEach((h) => { const s = longestStreakFor(h.id); if (s > m) m = s; });
    return m;
  }, [habits, longestStreakFor]);

  const totalCompletions = useMemo(() => {
    let t = 0;
    (Object.values(completions) as string[][]).forEach((arr) => {
      if (arr) t += (arr as string[]).length;
    });
    return t;
  }, [completions]);

  const heatmapData = useMemo(() => {
    const out: Record<string, number> = {};
    (Object.values(completions) as string[][]).forEach((arr) => {
      if (arr) (arr as string[]).forEach((d) => { out[d] = (out[d] || 0) + 1; });
    });
    return out;
  }, [completions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 pt-10 relative z-10"
    >
      <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: colors.textPrimary }}>
        Statistics
      </h1>
      <p className="text-sm font-medium mb-8" style={{ color: colors.textSecondary }}>
        Quiet progress, day after day.
      </p>

      <div className="flex gap-2.5 mb-6">
        {[
          { icon: Trophy, value: longestStreakOverall, label: "Best Streak" },
          { icon: Flame, value: `${globalStreak}d`, label: "Global Streak" },
          { icon: Target, value: `${overallConsistency}%`, label: "Consistency" },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex-1 rounded-2xl border p-4 flex flex-col gap-2 relative overflow-hidden"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <stat.icon size={18} style={{ color: colors.accentPrimary }} />
            <span className="text-2xl font-black tracking-tight" style={{ color: colors.textPrimary }}>
              {stat.value}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-60" style={{ color: colors.textSecondary }}>
              {stat.label}
            </span>
            {i === 0 && (
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                <Trophy size={64} style={{ color: colors.accentPrimary }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5 mb-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold tracking-tight" style={{ color: colors.textPrimary }}>Current Week</h3>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: colors.textSecondary }}>
            Avg: {Math.round(weeklyAvg * 100)}%
          </span>
        </div>
        <div className="flex items-end justify-between h-40 gap-2">
          {weekly.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center h-full group">
              <div className="flex-1 w-full flex flex-col justify-end bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(8, w.pct * 100)}%` }}
                  className="w-full relative z-10"
                  style={{ 
                    backgroundColor: w.pct > 0 ? colors.success : colors.border,
                    opacity: w.isToday ? 1 : 0.8
                  }}
                />
                {w.isToday && (
                  <div className="absolute inset-0 border-2 border-dashed rounded-xl z-20 pointer-events-none opacity-40" style={{ borderColor: colors.textPrimary }} />
                )}
                {/* Percentage Label */}
                <div className="absolute top-2 w-full text-center z-30 pointer-events-none">
                  <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.textPrimary }}>
                    {Math.round(w.pct * 100)}%
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase mt-3 ${w.isToday ? 'opacity-100' : 'opacity-40'}`} style={{ color: w.isToday ? colors.success : colors.textTertiary }}>
                {w.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border p-6 mb-6" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black tracking-tighter" style={{ color: colors.textPrimary }}>Consistency</h3>
            <p className="text-[11px] font-bold opacity-40 uppercase tracking-widest" style={{ color: colors.textSecondary }}>Daily Progress Map</p>
          </div>
          <Calendar size={18} opacity={0.3} />
        </div>
        <Heatmap completions={completions} days={112} />
      </div>

      <div className="rounded-[32px] border p-6 mb-6" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black tracking-tighter" style={{ color: colors.textPrimary }}>Achievements</h3>
            <p className="text-[11px] font-bold opacity-40 uppercase tracking-widest" style={{ color: colors.textSecondary }}>{achievements.length}/{ACHIEVEMENTS.length} Badges</p>
          </div>
          <Award size={18} opacity={0.3} />
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {ACHIEVEMENTS.map(meta => {
            const isUnlocked = achievements.some(a => a.id === meta.id);
            return (
              <div 
                key={meta.id} 
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all"
                style={{ 
                  backgroundColor: isUnlocked ? meta.color + "11" : colors.background, 
                  borderColor: isUnlocked ? meta.color + "33" : colors.border,
                  opacity: isUnlocked ? 1 : 0.4
                }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5"
                  style={{ color: isUnlocked ? meta.color : colors.textTertiary }}
                >
                  <meta.icon size={20} fill={isUnlocked ? meta.color + "22" : "transparent"} />
                </div>
                <span className="text-[10px] font-black leading-tight tracking-tight px-1" style={{ color: isUnlocked ? colors.textPrimary : colors.textTertiary }}>
                  {meta.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[32px] border p-6 space-y-5 mb-8" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-black tracking-tighter" style={{ color: colors.textPrimary }}>Breakdown</h3>
            <p className="text-[11px] font-bold opacity-40 uppercase tracking-widest" style={{ color: colors.textSecondary }}>Per Habit Activity</p>
          </div>
          <TrendingUp size={18} opacity={0.3} />
        </div>
        {habits.length === 0 ? (
          <p className="text-xs font-medium opacity-60" style={{ color: colors.textSecondary }}>Add a habit to see streaks here.</p>
        ) : (
          habits.map((h) => {
            const thisWeek = completionsThisWeek(h.id);
            const goal = h.weeklyGoal || 7;
            const progressPct = Math.min(1, thisWeek / goal);
            
            return (
              <div key={h.id} className="pt-3 first:pt-0 border-t first:border-t-0" style={{ borderTopColor: colors.border }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                  <p className="text-sm font-bold truncate flex-1" style={{ color: colors.textPrimary }}>{h.name}</p>
                  <span className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>
                    {thisWeek}/{goal}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct * 100}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: progressPct >= 1 ? colors.success : h.color }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-40" style={{ color: colors.textSecondary }}>
                    Current Streak: {streakFor(h.id)}d
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-40" style={{ color: colors.textSecondary }}>
                    Best: {longestStreakFor(h.id)}d
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="h-32" />
    </motion.div>
  );
};

export default Stats;
