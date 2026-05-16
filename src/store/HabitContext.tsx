import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Preferences } from '@capacitor/preferences';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  reminderTime?: string | null;
  frequency: "daily" | "weekdays" | "weekends";
  weeklyGoal: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  unlockedAt: string;
}

export interface HabitState {
  habits: Habit[];
  completions: Record<string, string[]>;
  achievements?: Achievement[];
}

interface HabitCtx extends HabitState {
  ready: boolean;
  addHabit: (h: Omit<Habit, "id" | "createdAt">) => Promise<void>;
  restoreHabit: (h: Habit, c: string[]) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleToday: (id: string) => Promise<boolean>;
  isCompletedOn: (id: string, date: string) => boolean;
  streakFor: (id: string) => number;
  longestStreakFor: (id: string) => number;
  totalCompletionsFor: (id: string) => number;
  completionsThisWeek: (id: string) => number;
  clearCustomIcon: (iconUrl: string) => Promise<void>;
  exportData: () => string;
  importData: (json: string) => Promise<boolean>;
  clearAll: () => Promise<void>;
  globalStreak: number;
  overallConsistency: number;
  checkAchievements: () => void;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
}

const HabitContext = createContext<HabitCtx | null>(null);
const KEY = "tapdone:state:v1";

export const todayStr = (d: Date = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const dateFromStr = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const isHabitDueOn = (habit: Habit, date: Date) => {
  const day = date.getDay();
  if (habit.frequency === "weekdays") return day >= 1 && day <= 5;
  if (habit.frequency === "weekends") return day === 0 || day === 6;
  return true;
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Record<string, string[]>>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { value } = await Preferences.get({ key: KEY });
        // Fallback to localStorage for migration
        const legacy = localStorage.getItem(KEY);
        const raw = value || legacy;

        if (raw) {
          const parsed = JSON.parse(raw) as HabitState;
          setHabits(parsed.habits || []);
          setCompletions(parsed.completions || {});
          setAchievements(parsed.achievements || []);
          
          if (legacy && !value) {
            await Preferences.set({ key: KEY, value: raw });
          }
        }
      } catch (e) {
        console.error("Failed to load habits", e);
      }
      setReady(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (ready) {
      const state: HabitState = { habits, completions, achievements };
      const serialized = JSON.stringify(state);
      localStorage.setItem(KEY, serialized);
      Preferences.set({ key: KEY, value: serialized });
    }
  }, [habits, completions, achievements, ready]);

  const addHabit = useCallback(async (h: Omit<Habit, "id" | "createdAt">) => {
    const newH: Habit = {
      ...h,
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [newH, ...prev]);
  }, []);

  const restoreHabit = useCallback(async (h: Habit, c: string[]) => {
    setHabits(prev => [h, ...prev]);
    setCompletions(prev => ({ ...prev, [h.id]: c }));
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    setHabits(prev => prev.filter((h) => h.id !== id));
    setCompletions(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const isCompletedOn = useCallback(
    (id: string, date: string) => (completions[id] || []).includes(date),
    [completions]
  );

  const toggleToday = useCallback(async (id: string) => {
    const today = todayStr();
    let isNowCompleted = false;
    setCompletions(prev => {
      const arr = prev[id] || [];
      const has = arr.includes(today);
      isNowCompleted = !has;
      const newArr = has ? arr.filter((d) => d !== today) : [...arr, today];
      return { ...prev, [id]: newArr };
    });
    return isNowCompleted;
  }, []);

  const streakFor = useCallback((id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return 0;
    const set = new Set(completions[id] || []);
    let count = 0;
    const cursor = new Date();
    let started = false;
    while (true) {
      const ds = todayStr(cursor);
      const due = isHabitDueOn(habit, cursor);
      if (due) {
        if (set.has(ds)) {
          count++;
          started = true;
        } else {
          if (!started && ds === todayStr()) {
            // skip today (not done yet)
          } else {
            break;
          }
        }
      }
      cursor.setDate(cursor.getDate() - 1);
      if (count > 3650) break;
      if (cursor < new Date(habit.createdAt)) break;
    }
    return count;
  }, [habits, completions]);

  const longestStreakFor = useCallback((id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return 0;
    const set = new Set(completions[id] || []);
    if (set.size === 0) return 0;
    const dates = Array.from(set).sort();
    let longest = 0;
    let current = 0;
    const start = dateFromStr(dates[0] as string);
    const end = new Date();
    const cursor = new Date(start);
    while (cursor <= end) {
      if (isHabitDueOn(habit, cursor)) {
        const ds = todayStr(cursor);
        if (set.has(ds)) {
          current++;
          if (current > longest) longest = current;
        } else {
          current = 0;
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return longest;
  }, [habits, completions]);

  const totalCompletionsFor = useCallback(
    (id: string) => (completions[id] || []).length,
    [completions]
  );

  const completionsThisWeek = useCallback((id: string) => {
    const arr = completions[id] || [];
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    return arr.filter(d => {
      const date = dateFromStr(d);
      return date >= monday;
    }).length;
  }, [completions]);

  const clearCustomIcon = useCallback(async (iconUrl: string) => {
    setHabits(prev => prev.map(h => {
      if (h.icon === iconUrl) {
        return { ...h, icon: "Droplet" };
      }
      return h;
    }));
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify({ habits, completions, achievements, exportedAt: new Date().toISOString() }, null, 2);
  }, [habits, completions, achievements]);

  const importData = useCallback(async (json: string) => {
    try {
      const parsed = JSON.parse(json) as HabitState;
      if (!Array.isArray(parsed.habits)) return false;
      setHabits(parsed.habits);
      setCompletions(parsed.completions || {});
      setAchievements(parsed.achievements || []);
      return true;
    } catch {
      return false;
    }
  }, []);

  const globalStreak = useMemo(() => {
    const daySet = new Set<string>();
    (Object.values(completions) as string[][]).forEach(arr => arr.forEach((d: string) => daySet.add(d)));
    if (daySet.size === 0) return 0;

    let count = 0;
    const cursor = new Date();
    let started = false;
    while (true) {
      const ds = todayStr(cursor);
      // check if *any* habit was due this day
      const dueHabits = habits.filter(h => isHabitDueOn(h, cursor));
      if (dueHabits.length > 0) {
        if (daySet.has(ds)) {
          count++;
          started = true;
        } else {
          if (!started && ds === todayStr()) {
            // allow skip today if not yet done
          } else {
            break;
          }
        }
      }
      cursor.setDate(cursor.getDate() - 1);
      if (count > 3650) break;
      if (daySet.size > 0 && cursor < dateFromStr(Array.from(daySet).sort()[0] as string)) break;
    }
    return count;
  }, [habits, completions]);

  const overallConsistency = useMemo(() => {
    const totalComps = (Object.values(completions) as string[][]).reduce((acc, curr) => acc + curr.length, 0);
    const daySet = new Set<string>();
    (Object.values(completions) as string[][]).forEach(arr => arr.forEach((d: string) => daySet.add(d)));
    if (habits.length === 0 || daySet.size === 0) return 0;
    
    const start = dateFromStr(Array.from(daySet).sort()[0] as string);
    const end = new Date();
    let totalDue = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      totalDue += habits.filter(h => isHabitDueOn(h, cursor)).length;
      cursor.setDate(cursor.getDate() + 1);
    }
    
    return totalDue > 0 ? Math.round((totalComps / totalDue) * 100) : 0;
  }, [habits, completions]);

  const checkAchievements = useCallback(() => {
    const newUnlocks: string[] = [];
    const unlockedIds = new Set(achievements.map(a => a.id));

    const addIf = (id: string, cond: boolean) => {
      if (cond && !unlockedIds.has(id)) newUnlocks.push(id);
    };

    const overallLongest = Math.max(0, ...habits.map(h => longestStreakFor(h.id)));
    const totalDone = (Object.values(completions) as string[][]).reduce((a, b) => a + b.length, 0);

    addIf("first_step", totalDone >= 1);
    addIf("streak_3", globalStreak >= 3);
    addIf("streak_7", globalStreak >= 7);
    addIf("streak_30", globalStreak >= 30);
    addIf("habit_master", overallLongest >= 30);
    addIf("warrior", totalDone >= 100);

    if (newUnlocks.length > 0) {
      setAchievements(prev => [
        ...prev,
        ...newUnlocks.map(id => ({ id, unlockedAt: new Date().toISOString() }))
      ]);
      
      // Trigger a custom event for the UI to show celebrate
      window.dispatchEvent(new CustomEvent("achievement-unlocked", { detail: newUnlocks }));
    }
  }, [achievements, habits, completions, globalStreak, longestStreakFor]);

  useEffect(() => {
    if (ready) {
      checkAchievements();
    }
  }, [ready, completions, habits, checkAchievements]);

  const clearAll = useCallback(async () => {
    setHabits([]);
    setCompletions({});
    setAchievements([]);
    localStorage.removeItem(KEY);
  }, []);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, []);

  const value = useMemo<HabitCtx>(() => ({
    habits, completions, achievements, ready, addHabit, restoreHabit, deleteHabit, toggleToday,
    isCompletedOn, streakFor, longestStreakFor, totalCompletionsFor,
    completionsThisWeek, clearCustomIcon,
    exportData, importData, clearAll,
    globalStreak, overallConsistency, checkAchievements, updateHabit
  }), [habits, completions, achievements, ready, addHabit, restoreHabit, deleteHabit, toggleToday,
       isCompletedOn, streakFor, longestStreakFor, totalCompletionsFor,
       completionsThisWeek, clearCustomIcon, exportData, importData, clearAll,
       globalStreak, overallConsistency, checkAchievements, updateHabit]);

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
};

export const useHabits = () => {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be used inside HabitProvider");
  return ctx;
};

export const habitsDueOn = (habits: Habit[], date: Date) =>
  habits.filter((h) => isHabitDueOn(h, date));
