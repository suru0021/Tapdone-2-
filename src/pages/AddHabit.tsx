import React, { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X, Clock, Pipette, History, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../theme/ThemeContext";
import { useHabits, Habit } from "../store/HabitContext";
import { HABIT_COLORS } from "../theme/colors";
import IconPicker, { PREDEFINED_ICONS } from "../components/IconPicker";
import AnalogClockPicker from "../components/AnalogClockPicker";

const FREQS: { id: "daily" | "weekdays" | "weekends"; label: string }[] = [
  { id: "daily", label: "Every day" },
  { id: "weekdays", label: "Weekdays" },
  { id: "weekends", label: "Weekends" },
];

const AddHabit: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const habitId = searchParams.get("id");
  const { habits, addHabit, updateHabit, clearCustomIcon } = useHabits();

  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("Droplet");
  const [customIcon, setCustomIcon] = useState<string | null>(() => localStorage.getItem("tapdone:lastCustomHabitIcon"));
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<"daily" | "weekdays" | "weekends">("daily");
  const [weeklyGoal, setWeeklyGoal] = useState(7);
  const [reminder, setReminder] = useState("");
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  const loadedRef = useRef(false);

  // Load existing habit for editing
  useEffect(() => {
    if (habitId && habits.length > 0 && !loadedRef.current) {
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        setName(habit.name);
        setIconName(habit.icon);
        setColor(habit.color);
        setFrequency(habit.frequency);
        setWeeklyGoal(habit.weeklyGoal);
        setReminder(habit.reminderTime || "");
        
        if (habit.icon.startsWith('data:image/')) {
          setCustomIcon(habit.icon);
        }
        
        if (!HABIT_COLORS.includes(habit.color)) {
          setCustomColor(habit.color);
        }
        loadedRef.current = true;
      }
    }
  }, [habitId, habits]);

  // Draft Logic
  const DRAFT_KEY = "habit_form_draft";

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Only show prompt if the draft actually has some meaningful content
        if (draft.name?.trim() || draft.customIcon || draft.customColor || draft.reminder) {
          setShowDraftPrompt(true);
        }
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  useEffect(() => {
    const draft = {
      name,
      iconName,
      customIcon,
      color,
      customColor,
      frequency,
      weeklyGoal,
      reminder
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [name, iconName, customIcon, color, customColor, frequency, weeklyGoal, reminder]);

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setName(draft.name || "");
        setIconName(draft.iconName || "Droplet");
        setCustomIcon(draft.customIcon || null);
        setColor(draft.color || HABIT_COLORS[0]);
        setCustomColor(draft.customColor || null);
        setFrequency(draft.frequency || "daily");
        setWeeklyGoal(draft.weeklyGoal || 7);
        setReminder(draft.reminder || "");
      } catch (e) {
        console.error("Failed to restore draft", e);
      }
    }
    setShowDraftPrompt(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setShowDraftPrompt(false);
  };

  const toggleAmPm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!reminder) return;

    const [h, m] = reminder.split(':');
    const hours = parseInt(h);
    const newHours = (hours + 12) % 24;
    const formattedHours = newHours.toString().padStart(2, '0');
    setReminder(`${formattedHours}:${m}`);
  };

  const onSave = async () => {
    if (!name.trim()) { alert("Give your habit a name."); return; }
    
    const habitData = {
      name: name.trim(),
      icon: iconName,
      color,
      reminderTime: reminder || null,
      frequency,
      weeklyGoal
    };

    if (habitId) {
      await updateHabit(habitId, habitData);
    } else {
      await addHabit(habitData);
    }
    
    localStorage.removeItem(DRAFT_KEY);
    navigate('/home');
  };

  const handleFrequencyChange = (f: "daily" | "weekdays" | "weekends") => {
    setFrequency(f);
    if (f === "daily") setWeeklyGoal(7);
    else if (f === "weekdays") setWeeklyGoal(5);
    else if (f === "weekends") setWeeklyGoal(2);
  };

  const isCustomIconSelected = iconName.startsWith('data:image/');

  useEffect(() => {
    if (customIcon) {
      localStorage.setItem("tapdone:lastCustomHabitIcon", customIcon);
    } else {
      localStorage.removeItem("tapdone:lastCustomHabitIcon");
    }
  }, [customIcon]);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] flex flex-col h-full"
      style={{ backgroundColor: colors.background }}
    >
      <header className="flex items-center justify-between px-6 pt-12 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl border flex items-center justify-center transition-all active:scale-90 glass"
          style={{ backgroundColor: colors.surface + "80", borderColor: colors.border, color: colors.textPrimary }}
        >
          <X size={20} strokeWidth={2} />
        </button>
        <h1 className="text-xl font-serif italic font-medium tracking-tight" style={{ color: colors.textPrimary }}>
          {habitId ? "Refine Habit" : "New Journey"}
        </h1>
        <div className="w-11" />
      </header>

      <AnimatePresence>
        {showDraftPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="px-6 mb-4"
          >
            <div 
              className="p-4 rounded-2xl flex items-center justify-between border shadow-lg backdrop-blur-md"
              style={{ 
                backgroundColor: colors.surface + "EE", 
                borderColor: color + "44",
                boxShadow: `0 10px 25px -5px ${color}22`
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: color + "22", color: color }}>
                  <History size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: colors.textPrimary }}>Continue where you left off?</h4>
                  <p className="text-[10px] opacity-60 font-medium" style={{ color: colors.textSecondary }}>We found a draft of your habit.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={discardDraft}
                  className="px-3 h-8 rounded-lg text-[10px] font-bold opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: colors.textPrimary }}
                >
                  Discard
                </button>
                <button 
                  onClick={restoreDraft}
                  className="px-4 h-8 rounded-lg text-[10px] font-bold shadow-sm transition-transform active:scale-95"
                  style={{ backgroundColor: color, color: colors.background }}
                >
                  Restore
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto space-y-8 pb-32 scrollbar-hide">
        {/* Colourful Hero Section */}
        <section className="px-6">
          <div 
            className="w-full h-44 rounded-[40px] overflow-hidden relative flex items-center justify-center shadow-xl border-4"
            style={{ 
              background: `linear-gradient(135deg, ${color}, ${color}dd)`,
              borderColor: colors.surface
            }}
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
            <motion.div
              key={iconName}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white/20 backdrop-blur-xl p-8 rounded-[32px] border border-white/30 shadow-2xl overflow-hidden flex items-center justify-center"
              style={isCustomIconSelected ? { padding: 0, width: 110, height: 110 } : {}}
            >
              {isCustomIconSelected ? (
                <img src={iconName} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                React.createElement(PREDEFINED_ICONS.find(i => i.name === iconName)?.comp || PREDEFINED_ICONS[0].comp, { 
                  size: 52, 
                  color: "#FFFFFF", 
                  strokeWidth: 2 
                })
              )}
            </motion.div>
          </div>
        </section>

        <div className="px-6 space-y-10">
          <section>
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 mb-3 px-1 block" style={{ color: colors.textSecondary }}>Identity</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Morning meditation..."
            className="w-full h-16 px-6 rounded-[28px] border text-lg font-medium outline-none focus:ring-4 transition-all glass"
            style={{
              backgroundColor: colors.surface + "80",
              borderColor: colors.border,
              color: colors.textPrimary,
              // @ts-ignore
              "--tw-ring-color": color + '15'
            }}
            maxLength={40}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[11px] font-bold uppercase tracking-widest opacity-60" style={{ color: colors.textSecondary }}>Icon</label>
          </div>
          <IconPicker 
            selectedIcon={iconName}
            customIcon={customIcon}
            onSelect={(icon) => {
              setIconName(icon);
              if (icon.startsWith('data:image/')) {
                setCustomIcon(icon);
              }
            }}
            onDeleteCustom={() => {
              if (customIcon) {
                clearCustomIcon(customIcon);
              }
              setCustomIcon(null);
              localStorage.removeItem("tapdone:lastCustomHabitIcon");
              setIconName(PREDEFINED_ICONS[0].name);
            }}
            accentColor={color}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] font-bold uppercase tracking-widest opacity-60 block" style={{ color: colors.textSecondary }}>Color choice</label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold opacity-60 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5" style={{ color: color }}>{color.toUpperCase()}</span>
              {customColor && (
                <button 
                  onClick={() => setCustomColor(null)} 
                  className="text-[9px] font-bold uppercase opacity-40 hover:opacity-100 transition-opacity"
                  style={{ color: colors.danger }}
                >
                  Reset Custom
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Custom Color Input Row */}
            <div className="flex items-center gap-3 p-3 rounded-2xl border bg-black/5 dark:bg-white/5" style={{ borderColor: colors.border }}>
              <label 
                className="w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 shadow-sm"
                style={{ backgroundColor: customColor || 'transparent', borderColor: colors.border, color: customColor ? '#FFFFFF' : colors.textSecondary }}
              >
                <Pipette size={20} className={customColor ? "drop-shadow-md" : ""} />
                <input 
                  type="color" 
                  value={customColor || color}
                  className="hidden" 
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setCustomColor(newColor);
                    setColor(newColor);
                  }} 
                />
              </label>
              
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-tighter" style={{ color: colors.textPrimary }}>Custom Color Picker</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] opacity-40">#</span>
                  <input 
                    type="text"
                    value={color.replace('#', '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 6) {
                        const newColor = `#${val}`;
                        setColor(newColor);
                        if (val.length === 6 || val.length === 3) {
                          setCustomColor(newColor);
                        }
                      }
                    }}
                    className="bg-transparent border-none outline-none text-sm font-mono font-bold w-full p-0"
                    style={{ color: colors.textPrimary }}
                    placeholder="FFFFFF"
                  />
                </div>
              </div>

              {customColor && color === customColor && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-1.5 h-1.5 rounded-full bg-white" 
                  />
                </motion.div>
              )}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-7 gap-2">
              {HABIT_COLORS.map((c) => {
                const active = color === c;
                return (
                  <motion.button
                    layout
                    key={c}
                    onClick={() => setColor(c)}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ 
                      scale: active ? 1.2 : 1,
                      zIndex: active ? 10 : 1
                    }}
                    className="aspect-square rounded-full border-2 transition-all shrink-0 relative flex items-center justify-center"
                    style={{
                      backgroundColor: c,
                      borderColor: active ? colors.textPrimary : "transparent"
                    }}
                  >
                    {active && (
                      <motion.div 
                        layoutId="activeColorDot"
                        className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" 
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30" style={{ color: colors.textSecondary }}>Frequency</label>
          </div>
          <div className="flex gap-3">
            {FREQS.map((f) => {
              const active = frequency === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleFrequencyChange(f.id)}
                  className="flex-1 h-14 rounded-2xl border text-xs font-bold tracking-widest uppercase transition-all"
                  style={{
                    backgroundColor: active ? colors.textPrimary : colors.surface,
                    borderColor: active ? colors.textPrimary : colors.border,
                    color: active ? colors.background : colors.textSecondary
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest opacity-60 block" style={{ color: colors.textSecondary }}>Weekly Goal</label>
              <p className="text-[10px] opacity-40 mt-0.5">Target number of days per week</p>
            </div>
            <div 
              className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5"
              style={{ backgroundColor: color + "15", borderColor: color + "33" }}
            >
              <motion.span 
                key={weeklyGoal}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-sm font-black" 
                style={{ color: color }}
              >
                {weeklyGoal}
              </motion.span>
              <span className="text-[10px] font-bold opacity-60 uppercase" style={{ color: color }}>days</span>
            </div>
          </div>
          
          <div className="relative pt-2 pb-6">
            <input 
              type="range"
              min="1"
              max="7"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-black/5 dark:bg-white/10 accent-current transition-all"
              style={{ 
                color: color,
                // Custom styles for the track to show progress could be added here if needed
              }}
            />
            
            <div className="flex justify-between mt-4 px-1">
              {[1, 2, 3, 4, 5, 6, 7].map(num => {
                const isActive = weeklyGoal === num;
                const isReached = weeklyGoal >= num;
                return (
                  <button
                    key={num}
                    onClick={() => setWeeklyGoal(num)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <motion.div 
                      animate={{ 
                        scale: isActive ? 1.5 : 1,
                        backgroundColor: isReached ? color : (isDark ? "#333" : "#eee")
                      }}
                      className="w-1.5 h-1.5 rounded-full transition-colors"
                    />
                    <span 
                      className="text-[10px] font-black transition-all"
                      style={{ 
                        color: isActive ? color : colors.textSecondary,
                        opacity: isActive ? 1 : 0.4
                      }}
                    >
                      {num}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[11px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-1.5" style={{ color: colors.textSecondary }}>
              <Clock size={12} />
              Set Time (optional)
            </label>
            {reminder && (
              <button 
                onClick={() => setReminder("")}
                className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: colors.danger }}
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="p-8 rounded-[40px] border flex flex-col items-center justify-center relative overflow-hidden" 
               style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <AnalogClockPicker 
              value={reminder} 
              onChange={setReminder} 
              accentColor={color} 
            />
          </div>
        </section>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-6 px-8 border-t bg-inherit max-w-md mx-auto z-[70]" style={{ borderColor: colors.border }}>
        <button
          onClick={onSave}
          className="w-full h-14 rounded-[20px] text-base font-bold tracking-tight shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
          style={{ backgroundColor: colors.accentPrimary, color: colors.background }}
        >
          {habitId ? <Save size={18} /> : null}
          {habitId ? "Save changes" : "Add habit"}
        </button>
      </footer>
    </motion.div>
  );
};

export default AddHabit;
