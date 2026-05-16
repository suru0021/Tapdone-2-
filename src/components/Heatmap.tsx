import React, { useMemo } from "react";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { useTheme } from "../theme/ThemeContext";

interface HeatmapProps {
  completions: Record<string, string[]>; // { habitId: [dateStrings] }
  days?: number;
}

const Heatmap: React.FC<HeatmapProps> = ({ completions, days = 91 }) => {
  const { colors } = useTheme();

  const data = useMemo(() => {
    const end = new Date();
    const start = subDays(end, days - 1);
    const interval = eachDayOfInterval({ start, end });
    
    // Flatten all completion dates across all habits
    const allDates = Object.values(completions).flat() as string[];
    const dateCounts: Record<string, number> = {};
    allDates.forEach(d => {
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    });

    return interval.map(date => {
      const ds = format(date, "yyyy-MM-dd");
      return {
        date,
        count: dateCounts[ds] || 0,
      };
    });
  }, [completions, days]);

  const getColor = (count: number) => {
    if (count === 0) return colors.border;
    if (count === 1) return colors.accentPrimary + "44";
    if (count === 2) return colors.accentPrimary + "88";
    if (count >= 3) return colors.accentPrimary;
    return colors.border;
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-wrap gap-1.5 justify-center">
        {data.map((d, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-sm transition-all hover:scale-125"
            style={{ 
              backgroundColor: getColor(d.count),
              boxShadow: d.count > 0 ? `0 0 10px ${getColor(d.count)}44` : "none"
            }}
            title={`${format(d.date, "MMM d")}: ${d.count} habits`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-3 px-2 text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: colors.textSecondary }}>
        <span>Last 3 months</span>
        <div className="flex gap-1.5 items-center">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(c => (
              <div key={c} className="w-2 h-2 rounded-sm" style={{ backgroundColor: getColor(c) }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
