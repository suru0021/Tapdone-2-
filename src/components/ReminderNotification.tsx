import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../theme/ThemeContext";
import { Bell, Sparkles, Flame } from "lucide-react";
import * as Lucide from "lucide-react";

interface ReminderNotificationProps {
  isVisible: boolean;
  habitId: string;
  habitName: string;
  habitIcon: string;
  habitColor: string;
  reminderTime: string;
  streak: number;
  onClose: () => void;
  onComplete: () => void;
}

const ReminderNotification: React.FC<ReminderNotificationProps> = ({
  isVisible,
  habitId,
  habitName,
  habitIcon,
  habitColor,
  reminderTime,
  streak,
  onClose,
  onComplete,
}) => {
  const { colors } = useTheme();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 30000); 
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, habitId]); // Re-run if habitId changes

  const IconComp = (Lucide as any)[habitIcon] || Sparkles;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
           key={habitId}
           layout
          initial={{ opacity: 0, y: -120, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed top-8 left-6 right-6 z-[200] flex justify-center"
        >
          <div 
            className="w-full max-w-md rounded-[44px] border shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] overflow-hidden glass relative"
            style={{ 
              borderColor: colors.border, 
              backgroundColor: colors.surface + "F8",
            }}
          >
            {/* Background Glow */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 0%, ${habitColor}, transparent 80%)` }}
            />
            
            <div className="p-1 relative z-10">
               <div className="p-7">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div 
                        className="w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-2xl border-2"
                        style={{ backgroundColor: `${habitColor}15`, borderColor: `${habitColor}30`, color: habitColor }}
                      >
                        {habitIcon.startsWith('data:image/') ? (
                          <img src={habitIcon} alt={habitName} className="w-10 h-10 object-contain" />
                        ) : (
                          <IconComp size={32} strokeWidth={2.5} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: habitColor }} />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: colors.textSecondary }}>
                             Focus Time • {reminderTime}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight leading-none" style={{ color: colors.textPrimary }}>
                          {habitName}
                        </h3>
                      </div>
                    </div>

                    <button 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 text-white/30 hover:bg-white/10 transition-colors"
                      onClick={onClose}
                    >
                      <Lucide.X size={18} />
                    </button>
                  </div>

                  <div 
                    className="p-5 rounded-[32px] border mb-8 bg-zinc-500/5 flex items-center justify-between"
                    style={{ borderColor: colors.border }}
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <Flame size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Active Streak</p>
                          <p className="text-sm font-black italic">{streak} Days</p>
                       </div>
                    </div>
                    <div className="h-8 w-[1px] bg-white/5" />
                    <div className="flex flex-col items-end">
                       <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Status</p>
                       <p className="text-sm font-black italic text-orange-500">Awaiting</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 h-16 rounded-[28px] font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center border"
                      style={{ borderColor: colors.border, color: colors.textPrimary }}
                    >
                      Later
                    </button>
                    <button
                      onClick={() => {
                        onComplete();
                        onClose();
                      }}
                      className="flex-[2] h-16 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                      style={{ backgroundColor: habitColor, color: '#fff' }}
                    >
                      <Lucide.CheckCircle2 size={18} />
                      Done for today
                    </button>
                  </div>
               </div>
            </div>

            {/* Progress Bar at bottom */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 30, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1.5"
              style={{ backgroundColor: habitColor }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReminderNotification;
