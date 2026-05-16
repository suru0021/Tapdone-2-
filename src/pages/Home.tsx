import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Trash2, AlertCircle, Undo, X as CloseIcon, ArrowUpDown, Clock, SortAsc, Zap, TrendingUp, Award, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../theme/ThemeContext";
import { useHabits, todayStr, habitsDueOn } from "../store/HabitContext";
import { useProfile } from "../store/ProfileContext";
import { PREDEFINED_ICONS } from "../components/IconPicker";
import ReminderNotification from "../components/ReminderNotification";
import { UserCircle } from "lucide-react";
import ProgressRing from "../components/ProgressRing";
import HabitCard from "../components/HabitCard";
import StreakFlame from "../components/StreakFlame";
import Heatmap from "../components/Heatmap";
import SmartTip from "../components/SmartTip";
import { adService } from "../services/AdService";
import WeeklyReportOverlay from "../components/WeeklyReportOverlay";

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  const userName = name.split(' ')[0];
  if (hour < 12) return `Good morning, ${userName} ☀️`;
  if (hour < 17) return `Good afternoon, ${userName} ☕️`;
  return `Good evening, ${userName} 🌙`;
};

const motivationalLine = (pct: number, completed: number, total: number) => {
  if (total === 0) return "Quiet growth begins with a single step.";
  if (pct === 1) return "Beautiful. Every small win builds a legacy.";
  if (pct === 0) return "A fresh beginning. Breathe and start small.";
  if (total - completed === 1) return "Just one small step remains for today.";
  return "Focus on the momentum. You're showing up.";
};

const Home: React.FC = () => {
  const { colors, appIcon } = useTheme();
  const { habits, isCompletedOn, toggleToday, streakFor, completionsThisWeek, deleteHabit, restoreHabit, completions, ready, globalStreak, overallConsistency, achievements } = useHabits();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, name: string } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<{ habit: any, completions: string[] } | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "alpha" | "streak">("date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [activeReminder, setActiveReminder] = useState<{
    id: string;
    name: string;
    icon: string;
    color: string;
    time: string;
    streak: number;
  } | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if it's Sunday and we haven't shown the report for this week
    const now = new Date();
    const day = now.getDay();
    if (day === 0) { // Sunday
      const monday = new Date(now);
      monday.setDate(now.getDate() - 6);
      monday.setHours(0,0,0,0);
      const weekId = monday.toISOString().split('T')[0];
      const lastSeen = localStorage.getItem("tapdone:last_report_week");
      if (lastSeen !== weekId && habits.length > 0) {
        setShowWeeklyReport(true);
        localStorage.setItem("tapdone:last_report_week", weekId);
      }
    }
  }, [habits]);

  useEffect(() => {
    const savedSort = localStorage.getItem("tapdone:sort");
    if (savedSort === "date" || savedSort === "alpha" || savedSort === "streak") {
      setSortBy(savedSort);
    }
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const handleSortChange = (newSort: "date" | "alpha" | "streak") => {
    setSortBy(newSort);
    localStorage.setItem("tapdone:sort", newSort);
    setShowSortMenu(false);
  };

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(now);
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentDate]);

  const today = useMemo(() => todayStr(currentDate), [currentDate]);
  const dueToday = useMemo(() => {
    const due = habitsDueOn(habits, currentDate);
    return [...due].sort((a, b) => {
      if (sortBy === "alpha") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "streak") {
        return streakFor(b.id) - streakFor(a.id);
      }
      // default: date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [habits, sortBy, streakFor]);
  const completedToday = dueToday.filter((h) => isCompletedOn(h.id, today)).length;
  const total = dueToday.length;
  const progress = total === 0 ? 0 : completedToday / total;

  const longestStreakActive = useMemo(() => {
    let m = 0;
    habits.forEach((h) => { const s = streakFor(h.id); if (s > m) m = s; });
    return m;
  }, [habits, streakFor]);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });

  const handleToggle = async (id: string) => {
    const wasCompleted = isCompletedOn(id, todayStr());
    await toggleToday(id);
    // Show ad when habit is marked as DONE (not when un-marking)
    if (!wasCompleted) {
      adService.onHabitCompleted();
    }
  };

  const handleLongPress = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      const habitToDelete = habits.find(h => h.id === deleteConfirm.id);
      if (habitToDelete) {
        const habitCompletions = completions[deleteConfirm.id] || [];
        setLastDeleted({ habit: habitToDelete, completions: habitCompletions });
        
        deleteHabit(deleteConfirm.id);
        setShowUndo(true);
        
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        undoTimerRef.current = setTimeout(() => {
          setShowUndo(false);
        }, 5000);
      }
      setDeleteConfirm(null);
    }
  };

  const handleRestore = () => {
    if (lastDeleted) {
      restoreHabit(lastDeleted.habit, lastDeleted.completions);
      setLastDeleted(null);
      setShowUndo(false);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    }
  };

  useEffect(() => {
    if (!ready || habits.length === 0) return;

    const checkReminders = () => {
      // Don't trigger new reminders if one is already showing
      if (activeReminder) return;

      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTimeVal = currentH * 60 + currentM;
      const today = todayStr();

      // Find all habits that have a reminder time that has passed today
      const passedReminders = habits.filter(h => {
        if (!h.reminderTime) return false;
        const [h_time, m_time] = h.reminderTime.split(":").map(Number);
        const reminderTimeVal = h_time * 60 + m_time;
        
        if (currentTimeVal >= reminderTimeVal) {
          // Check if already completed today
          if (isCompletedOn(h.id, today)) return false;

          // Check if already shown today
          const shownKey = `tapdone:reminder_shown:${h.id}:${today}`;
          return !localStorage.getItem(shownKey);
        }
        return false;
      });

      if (passedReminders.length > 0) {
        // Sort by most recent passage
        passedReminders.sort((a, b) => {
          const [ah, am] = a.reminderTime!.split(":").map(Number);
          const [bh, bm] = b.reminderTime!.split(":").map(Number);
          return (bh * 60 + bm) - (ah * 60 + am);
        });

        const latest = passedReminders[0];
        setActiveReminder({
          id: latest.id,
          name: latest.name,
          icon: latest.icon,
          color: latest.color,
          time: latest.reminderTime!,
          streak: streakFor(latest.id)
        });
      }
    };

    // Initial check
    checkReminders();
    
    // Periodic check (every second for immediate feedback)
    const interval = setInterval(checkReminders, 1000);
    return () => clearInterval(interval);
  }, [ready, habits, activeReminder, streakFor, isCompletedOn]);

  if (!ready) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 pt-10"
    >
      <AnimatePresence>
        {showUndo && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-24 left-6 right-6 z-[100]"
          >
            <div 
              className="p-4 rounded-3xl flex items-center justify-between border shadow-2xl glass"
              style={{ borderColor: colors.border }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-red-500/10 text-red-500">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: colors.textPrimary }}>Habit removed</h4>
                  <p className="text-[10px] opacity-40 font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>"{lastDeleted?.habit.name}"</p>
                </div>
              </div>
              <button 
                onClick={handleRestore}
                className="px-5 h-11 rounded-2xl text-xs font-black uppercase tracking-widest transition-transform active:scale-95 shadow-sm bg-white text-black"
              >
                Restore
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WeeklyReportOverlay isOpen={showWeeklyReport} onClose={() => setShowWeeklyReport(false)} />
      
      <ReminderNotification
        isVisible={!!activeReminder}
        habitId={activeReminder?.id || ""}
        habitName={activeReminder?.name || ""}
        habitIcon={activeReminder?.icon || ""}
        habitColor={activeReminder?.color || ""}
        reminderTime={activeReminder?.time || ""}
        streak={activeReminder?.streak || 0}
        onClose={() => {
          if (activeReminder) {
            localStorage.setItem(`tapdone:reminder_shown:${activeReminder.id}:${todayStr()}`, "true");
          }
          setActiveReminder(null);
        }}
        onComplete={() => {
          if (activeReminder) {
            handleToggle(activeReminder.id);
            localStorage.setItem(`tapdone:reminder_shown:${activeReminder.id}:${todayStr()}`, "true");
          }
        }}
      />

      {/* App Icon / Profile in Header */}
      <div className="flex flex-col mb-12">
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-40 mb-1.5" 
          style={{ color: colors.textSecondary }}
        >
          {dateLabel}
        </motion.span>
        
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-4xl font-serif italic font-medium tracking-tight leading-none mb-3" style={{ color: colors.textPrimary }}>
              {getGreeting(profile.name)}
            </h1>
            <p className="text-sm font-medium opacity-50 max-w-[240px] leading-relaxed" style={{ color: colors.textSecondary }}>
              {motivationalLine(progress, completedToday, total)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
             <div 
               className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border shadow-sm cursor-pointer transition-all hover:scale-110 active:scale-95 glass"
               style={{ backgroundColor: colors.surface + "80", borderColor: colors.border }}
               onClick={() => navigate('/profile')}
             >
               {(() => {
                 const isPredefined = profile.image && PREDEFINED_ICONS.some(i => i.name === profile.image);
                 if (profile.image && !isPredefined) {
                   return <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />;
                 }
                 const IconComp = isPredefined 
                   ? PREDEFINED_ICONS.find(i => i.name === profile.image)?.comp || UserCircle 
                   : UserCircle;
                 return <IconComp size={22} style={{ color: colors.accentPrimary }} />;
               })()}
             </div>
             <StreakFlame count={globalStreak} />
          </div>
        </div>
      </div>

      <div className="flex justify-center my-6">
        <ProgressRing progress={progress} size={220} strokeWidth={10} label="today's progress" />
      </div>

      {/* Chain Strike Mode */}
      <section className="mb-12 p-1 rounded-[40px] border shadow-xl relative overflow-hidden" 
               style={{ borderColor: colors.border, background: `linear-gradient(135deg, ${colors.surface}, ${colors.background})` }}>
         <div className="p-6 relative z-10">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 px-2 flex items-center gap-2" style={{ color: colors.textSecondary }}>
                Consistency Chain
              </h3>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border" style={{ borderColor: colors.border }}>
                 <Flame size={12} className="text-orange-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">{globalStreak} Day Momentum</span>
              </div>
           </div>
           
           <div className="flex justify-between items-center px-2 relative">
              {[...Array(7)].map((_, i) => {
                 const date = new Date();
                 date.setDate(date.getDate() - (6 - i));
                 const ds = todayStr(date);
                 const isDone = habitsDueOn(habits, date).length > 0 && 
                              Object.values(completions).some(c => (c as string[]).includes(ds));
                 const isToday = i === 6;
                 const nodeEmoji = ["⚡️", "🎯", "🚀", "💎", "🔥", "💫", "🏆"][i];
                 
                 return (
                    <div key={i} className="flex flex-col items-center gap-4 relative z-10">
                       <span className="text-[8px] font-bold uppercase tracking-widest opacity-20" style={{ color: colors.textSecondary }}>
                          {date.toLocaleDateString(undefined, { weekday: 'short' }).charAt(0)}
                       </span>
                       <motion.div 
                          initial={false}
                          whileHover={{ scale: 1.1 }}
                          animate={{ 
                            scale: isDone ? 1 : 0.8,
                          }}
                          className="w-11 h-11 rounded-[1.25rem] flex items-center justify-center border-2 transition-all relative"
                          style={{ 
                            backgroundColor: isDone ? colors.accentPrimary + "05" : "transparent",
                            borderColor: isToday ? colors.accentPrimary : (isDone ? colors.accentPrimary + "30" : colors.border),
                            boxShadow: isDone ? `0 4px 20px ${colors.accentPrimary}15` : "none"
                          }}
                        >
                          {isDone ? (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }} 
                              className="text-lg drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                            >
                              {nodeEmoji}
                            </motion.div>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                          )}
                          {isToday && !isDone && (
                             <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white animate-pulse shadow-[0_0_8px_white]" />
                          )}
                        </motion.div>
                    </div>
                 );
              })}
           </div>
         </div>

         <div className="absolute -top-20 -left-20 w-64 h-64 bg-accentPrimary/5 rounded-full blur-[100px] opacity-20 pointer-events-none" />
      </section>

      {/* Quick Widgets Grid */}
      <div className="grid grid-cols-2 gap-4 mb-12">
         <motion.div 
           whileHover={{ y: -4 }}
           whileTap={{ scale: 0.98 }}
           className="p-6 rounded-[32px] border bg-surface flex flex-col gap-5 group cursor-pointer shadow-sm"
           style={{ backgroundColor: colors.surface, borderColor: colors.border }}
           onClick={() => navigate('/stats')}
         >
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
               <TrendingUp size={22} />
            </div>
            <div>
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 mb-1" style={{ color: colors.textSecondary }}>Activity</h4>
               <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif italic" style={{ color: colors.textPrimary }}>{overallConsistency}</span>
                  <span className="text-[10px] font-bold opacity-30">%</span>
               </div>
            </div>
         </motion.div>

         <motion.div 
           whileHover={{ y: -4 }}
           whileTap={{ scale: 0.98 }}
           className="p-6 rounded-[32px] border bg-surface flex flex-col gap-5 group cursor-pointer shadow-sm"
           style={{ backgroundColor: colors.surface, borderColor: colors.border }}
           onClick={() => navigate('/profile')}
         >
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
               <Award size={22} />
            </div>
            <div>
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 mb-1" style={{ color: colors.textSecondary }}>Badges</h4>
               <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif italic" style={{ color: colors.textPrimary }}>{achievements.length}</span>
                  <span className="text-[10px] font-bold opacity-30">Earned</span>
               </div>
            </div>
         </motion.div>
      </div>

      {/* Weekly Insights Section */}
      {habits.length > 0 && (
        <section 
          onClick={() => navigate('/stats')}
          className="mb-8 p-6 rounded-[32px] border overflow-hidden relative group cursor-pointer transition-transform active:scale-[0.98]" 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight" style={{ color: colors.textPrimary }}>Weekly Activity</h3>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-40" style={{ color: colors.textSecondary }}>Consistency Heatmap</p>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <Heatmap completions={completions} />
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-500/10 transition-colors" />
        </section>
      )}

      <SmartTip />

      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-black tracking-tighter" style={{ color: colors.textPrimary }}>
          Today's habits
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
            style={{ 
              backgroundColor: isEditMode ? colors.danger + "15" : colors.surface,
              color: isEditMode ? colors.danger : colors.textSecondary,
              border: `1px solid ${isEditMode ? colors.danger + "33" : colors.border}`
            }}
          >
            <Trash2 size={12} strokeWidth={isEditMode ? 3 : 2} />
            <span>{isEditMode ? "Done" : "Delete"}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
              style={{ 
                backgroundColor: colors.surface,
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`
              }}
            >
              <ArrowUpDown size={12} />
              <span>Sort</span>
            </button>

          <AnimatePresence>
            {showSortMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowSortMenu(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-40 rounded-xl border shadow-xl z-50 p-1.5"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                >
                  {[
                    { id: "date", label: "Date Added", icon: Clock },
                    { id: "alpha", label: "Alphabetical", icon: SortAsc },
                    { id: "streak", label: "Streak Length", icon: Zap },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSortChange(option.id as any)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-colors"
                      style={{ 
                        backgroundColor: sortBy === option.id ? colors.accentPrimary + "15" : "transparent",
                        color: sortBy === option.id ? colors.accentPrimary : colors.textPrimary
                      }}
                    >
                      <option.icon size={14} opacity={sortBy === option.id ? 1 : 0.5} />
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

    <div className="space-y-1">
        {dueToday.length === 0 ? (
          <div className="rounded-[40px] p-12 flex flex-col items-center text-center overflow-hidden relative border border-dashed" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <div className="absolute inset-0 opacity-10 blur-3xl" style={{ background: `radial-gradient(circle at center, ${colors.accentPrimary}, transparent)` }} />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 mb-8 rounded-[40px] flex items-center justify-center p-0.5 shadow-2xl relative z-10"
              style={{ background: `linear-gradient(135deg, ${colors.accentPrimary}, ${colors.accentSecondary})` }}
            >
              <div className="w-full h-full rounded-[38px] flex items-center justify-center" style={{ backgroundColor: colors.surface }}>
                <Sparkles size={48} style={{ color: colors.accentPrimary }} />
              </div>
            </motion.div>
            <h3 className="text-2xl font-black tracking-tighter mb-2 relative z-10" style={{ color: colors.textPrimary }}>
              {habits.length === 0 ? "The beginning of you." : "Peak Consistency."}
            </h3>
            <p className="text-sm leading-relaxed max-w-[240px] font-medium opacity-60 mb-8 relative z-10" style={{ color: colors.textSecondary }}>
              {habits.length === 0
                ? "Small repetitive actions build empires. Start your first habit today."
                : "You've cleared your path for today. Deep breaths, you're doing great."}
            </p>
            {habits.length === 0 && (
              <button 
                onClick={() => navigate('/add-habit')}
                className="px-8 h-14 rounded-2xl font-black text-sm tracking-widest uppercase transition-transform active:scale-95 z-20 relative shadow-xl"
                style={{ backgroundColor: colors.accentPrimary, color: colors.surface }}
              >
                Create First Habit
              </button>
            )}
          </div>
        ) : (
          dueToday.map((h) => (
            <HabitCard
              key={h.id}
              id={h.id}
              name={h.name}
              iconName={h.icon}
              color={h.color}
              streak={streakFor(h.id)}
              completed={isCompletedOn(h.id, today)}
              reminderTime={h.reminderTime}
              weeklyGoal={h.weeklyGoal}
              weeklyCompletions={completionsThisWeek(h.id)}
              showManage={isEditMode}
              isHighlighted={activeReminder?.id === h.id}
              onToggle={() => handleToggle(h.id)}
              onDelete={() => handleLongPress(h.id, h.name)}
              onEdit={() => navigate(`/add-habit?id=${h.id}`)}
              onLongPress={() => handleLongPress(h.id, h.name)}
            />
          ))
        )}
      </div>

      <div className="h-24" />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm rounded-[32px] p-8 shadow-2xl overflow-hidden"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                  <Trash2 className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2" style={{ color: colors.textPrimary }}>
                  Delete habit?
                </h3>
                <p className="text-sm leading-relaxed mb-8" style={{ color: colors.textSecondary }}>
                  Are you sure you want to delete <span className="font-bold" style={{ color: colors.textPrimary }}>"{deleteConfirm.name}"</span>? This action cannot be undone.
                </p>
                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={confirmDelete}
                    className="w-full h-14 rounded-2xl font-bold transition-transform active:scale-95 bg-red-500 text-white shadow-lg shadow-red-500/20"
                  >
                    Yes, delete it
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="w-full h-14 rounded-2xl font-bold transition-transform active:scale-95 border"
                    style={{ borderColor: colors.border, color: colors.textPrimary }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
