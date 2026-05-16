import { Trophy, Flame, Star, Zap, Target, Award } from "lucide-react";

export interface AchievementMeta {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
}

export const ACHIEVEMENTS: AchievementMeta[] = [
  {
    id: "first_step",
    name: "First Step",
    description: "Completed your first habit. The journey begins!",
    icon: Trophy,
    color: "#FACC15", // Yellow
  },
  {
    id: "streak_3",
    name: "Kindling",
    description: "Maintained a 3-day global streak. The fire is lit.",
    icon: Flame,
    color: "#FB923C", // Orange
  },
  {
    id: "streak_7",
    name: "7-Day Warrior",
    description: "A full week of consistency. You're getting stronger.",
    icon: Zap,
    color: "#60A5FA", // Blue
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    description: "30 days of dedication. This is who you are now.",
    icon: Target,
    color: "#A78BFA", // Purple
  },
  {
    id: "habit_master",
    name: "Habit Master",
    description: "Reached a 30-day streak on a single habit.",
    icon: Star,
    color: "#F472B6", // Pink
  },
  {
    id: "warrior",
    name: "Ultimate Warrior",
    description: "100 total habit completions across all habits.",
    icon: Award,
    color: "#4ADE80", // Green
  }
];
