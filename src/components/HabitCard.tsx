import React, { memo, useRef, useState } from "react";
import { Check, Flame, Circle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../theme/ThemeContext";
import { palettes } from "../theme/colors";
import * as Lucide from "lucide-react";

interface Props {
  id: string;
  name: string;
  iconName: string;
  color: string;
  streak: number;
  completed: boolean;
  weeklyGoal?: number;
  weeklyCompletions?: number;
  reminderTime?: string | null;
  showManage?: boolean;
  isHighlighted?: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onLongPress?: () => void;
}

const HabitCard: React.FC<Props> = memo(({ name, iconName, color, streak, completed, weeklyGoal, weeklyCompletions, reminderTime, showManage, isHighlighted, onToggle, onDelete, onEdit, onLongPress }) => {
  const { colors } = useTheme();
  const [isLongPress, setIsLongPress] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = () => {
    setIsLongPress(false);
    timerRef.current = setTimeout(() => {
      setIsLongPress(true);
      onLongPress?.();
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 600);
  };

  const endPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLongPress) {
      setIsLongPress(false);
       return;
    }
    onToggle();
  };

  const IconComp = React.useMemo(() => {
    const isCustomIcon = iconName.startsWith('data:image/');
    if (isCustomIcon) return null;
    // @ts-ignore
    return (Lucide[iconName as keyof typeof Lucide] || Circle) as React.FC<any>;
  }, [iconName]);

  const isCustomIcon = iconName.startsWith('data:image/');
  const showReminder = reminderTime && !completed;

  const displayTime = React.useMemo(() => {
    if (!reminderTime) return "";
    const [h, m] = reminderTime.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }, [reminderTime]);

  return (
    <motion.div
      layout
      layoutId={name}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1,
        y: 0,
        scale: isHighlighted ? 1.05 : 1,
        backgroundColor: completed ? colors.surfaceElevated + "40" : (isHighlighted ? colors.surfaceElevated : colors.surface),
        borderColor: isHighlighted ? color : (completed ? "transparent" : colors.border),
        boxShadow: isHighlighted ? `0 20px 40px -10px ${color}30` : (completed ? "none" : "0 4px 20px rgba(0,0,0,0.02)")
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", damping: isHighlighted ? 20 : 25, stiffness: isHighlighted ? 300 : 400 }}
      className={`flex items-center p-5 rounded-[32px] border mb-4 cursor-pointer select-none transition-all group overflow-hidden ${isHighlighted ? 'ring-4 ring-offset-4 ring-offset-zinc-950' : ''}`}
      style={{
        // @ts-ignore
        "--tw-ring-color": isHighlighted ? `${color}20` : "transparent"
      }}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      onClick={handleClick}
    >
      {isHighlighted && (
        <motion.div 
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 z-0 bg-white/5 pointer-events-none"
          style={{ backgroundColor: `${color}10` }}
        />
      )}
      <div
        className="w-14 h-14 rounded-[22px] flex items-center justify-center mr-5 transition-all group-hover:scale-105 overflow-hidden shrink-0 border border-transparent shadow-inner"
        style={{ 
          backgroundColor: completed ? `${color}10` : `${color}15`,
          borderColor: completed ? "transparent" : `${color}20`
        }}
      >
        {isCustomIcon ? (
          <img src={iconName} alt={name} className="w-full h-full object-cover p-3" />
        ) : (
          IconComp && <IconComp size={24} color={color} strokeWidth={2} className={completed ? "opacity-30 blur-[0.5px]" : ""} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className="text-[16px] font-bold truncate tracking-tight transition-all"
          style={{ 
            color: colors.textPrimary,
            opacity: completed ? 0.2 : 0.9
          }}
        >
          {name}
        </h3>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1.5">
            <Flame size={12} className={streak > 0 ? "text-glow" : "opacity-20"} style={{ color: streak > 0 ? color : colors.textTertiary }} strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-30" style={{ color: colors.textSecondary }}>
              {streak} day streak
            </span>
          </div>

          <AnimatePresence>
            {showReminder && (
              <motion.div 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full border bg-white/5"
                style={{ borderColor: colors.border }}
              >
                <Lucide.Clock size={10} style={{ color: colors.textSecondary }} opacity={0.5} />
                <span className="text-[9px] font-bold tracking-tight opacity-40" style={{ color: colors.textSecondary }}>
                  {displayTime}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <AnimatePresence>
          {showManage && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center glass border transition-opacity hover:opacity-100"
                style={{ borderColor: colors.border, color: colors.textPrimary }}
              >
                <Lucide.Settings2 size={18} opacity={0.6} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-500/10 transition-colors"
                style={{ color: colors.danger }}
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!showManage && (
          <motion.div
            initial={false}
            animate={{
              backgroundColor: completed ? color : "transparent",
              borderColor: completed ? "transparent" : colors.border,
              scale: completed ? [1, 1.1, 1] : 1,
              opacity: completed ? 1 : 0.4
            }}
            transition={{ 
              scale: { duration: 0.3, times: [0, 0.5, 1] },
              backgroundColor: { duration: 0.3 },
            }}
            className="w-11 h-11 rounded-[20px] border-2 flex items-center justify-center shrink-0 shadow-inner"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: completed ? 1 : 0, 
              }}
              transition={{ type: "spring", damping: 15, stiffness: 400 }}
            >
              <Check size={22} color={palettes.dark.background} strokeWidth={4} />
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

export default HabitCard;
