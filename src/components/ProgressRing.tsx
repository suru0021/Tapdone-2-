import React, { memo } from "react";
import { motion } from "motion/react";
import { useTheme } from "../theme/ThemeContext";

interface Props {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  trackColor?: string;
  color?: string;
}

const ProgressRing: React.FC<Props> = memo(({
  progress, size = 180, strokeWidth = 10, showLabel = true, label, trackColor, color,
}) => {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const pct = Math.round(clampedProgress * 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor || colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-50"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color || colors.success}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clampedProgress) }}
          transition={{ duration: 1.5, ease: "anticipate" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      {showLabel && (
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <motion.span 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black tracking-tighter tabular-nums" 
            style={{ color: colors.textPrimary }}
          >
            {pct}<span className="text-sm opacity-40 ml-0.5">%</span>
          </motion.span>
          {label && (
            <span className="text-[10px] mt-1 tracking-[0.2em] uppercase font-black opacity-40" style={{ color: colors.textSecondary }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

export default ProgressRing;
