import React from "react";
import { motion } from "motion/react";
import { Flame } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

interface StreakFlameProps {
  count: number;
  size?: number;
}

const StreakFlame: React.FC<StreakFlameProps> = ({ count, size = 20 }) => {
  const { colors } = useTheme();

  if (count === 0) return null;

  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-lg overflow-hidden relative"
      style={{ 
        backgroundColor: colors.surface, 
        borderColor: count >= 7 ? colors.accentPrimary : colors.border,
        boxShadow: count >= 7 ? `0 10px 20px -5px ${colors.accentPrimary}33` : "none"
      }}
    >
      {/* Animated Glow Background for high streaks */}
      {count >= 7 && (
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 z-0"
          style={{ backgroundColor: colors.accentPrimary }}
        />
      )}

      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0],
        }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="relative z-10"
      >
        <Flame 
          size={size} 
          fill={count >= 7 ? colors.accentPrimary : "#FB923C"} 
          color={count >= 30 ? "#FACC15" : (count >= 7 ? colors.accentPrimary : "#FB923C")} 
        />
      </motion.div>
      
      <span className="text-sm font-black tracking-tighter relative z-10" style={{ color: colors.textPrimary }}>
        {count}
      </span>

      {count >= 30 && (
         <span className="text-[10px] font-black uppercase tracking-widest text-[#FACC15] ml-1 shadow-sm relative z-10">GODLIKE</span>
      )}
    </motion.div>
  );
};

export default StreakFlame;
