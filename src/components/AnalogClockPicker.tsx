import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Sun, Moon } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

interface AnalogClockPickerProps {
  value: string; // HH:mm
  onChange: (value: string) => void;
  accentColor: string;
}

const AnalogClockPicker: React.FC<AnalogClockPickerProps> = ({ value, onChange, accentColor }) => {
  const { colors } = useTheme();
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const [isAm, setIsAm] = useState(true);
  const [isLive, setIsLive] = useState(!value);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeHand, setActiveHand] = useState<"minutes" | null>(null);
  
  // Refs to avoid stale closures in stable callbacks
  const stateRef = useRef({ hours, minutes, isAm });
  const lastAngleRef = useRef<number | null>(null);
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stateRef.current = { hours, minutes, isAm };
  }, [hours, minutes, isAm]);

  // Parse incoming value
  useEffect(() => {
    if (value && !activeHand && !showSuccess) {
      const [h, m] = value.split(":").map(Number);
      setHours(h % 12 || 12);
      setMinutes(m);
      setIsAm(h < 12);
      setIsLive(false);
    }
  }, [value, activeHand, showSuccess]);

  // Live clock logic
  useEffect(() => {
    if (!isLive || showSuccess || activeHand) return;

    const tick = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      setHours(h % 12 || 12);
      setMinutes(m);
      setIsAm(h < 12);
    };

    tick(); // Initial sync
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isLive, showSuccess, activeHand]);

  const updateHand = useCallback((clientX: number, clientY: number) => {
    if (!clockRef.current || showSuccess) return;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle from center
    let angle = Math.atan2(clientY - centerY, clientX - centerX);
    angle = angle * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    
    // State is handled via ref and updated immediately to avoid stale closures
    const state = stateRef.current;

    // 6 degrees per minute (360/60)
    let m = Math.round(angle / 6);
    if (m === 60) m = 0;
    
    // Handle hour crossover (when minute hand passes 12)
    if (lastAngleRef.current !== null) {
      const prevAngle = lastAngleRef.current;
      // Crossing 12 clockwise (300+ -> 0-60)
      if (prevAngle > 300 && angle < 60) {
        let nextH = state.hours + 1;
        let nextAm = state.isAm;
        if (nextH > 12) {
          nextH = 1;
        } else if (nextH === 12) {
          nextAm = !state.isAm;
        }
        setHours(nextH);
        setIsAm(nextAm);
        state.hours = nextH;
        state.isAm = nextAm;
      }
      // Crossing 12 counter-clockwise (0-60 -> 300+)
      else if (prevAngle < 60 && angle > 300) {
        let nextH = state.hours - 1;
        let nextAm = state.isAm;
        if (nextH < 1) {
          nextH = 12;
        } else if (nextH === 11) {
          nextAm = !state.isAm;
        }
        setHours(nextH);
        setIsAm(nextAm);
        state.hours = nextH;
        state.isAm = nextAm;
      }
    }

    if (m !== state.minutes) {
      setMinutes(m);
      state.minutes = m;
      if (window.navigator?.vibrate) window.navigator.vibrate(3);
      
      // Use fresh ref values for military time calculation
      const militaryHours = state.isAm 
        ? (state.hours === 12 ? 0 : state.hours) 
        : (state.hours === 12 ? 12 : state.hours + 12);
      
      const timeStr = `${militaryHours.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      onChange(timeStr);
    }
    lastAngleRef.current = angle;
  }, [onChange, showSuccess]);

  const handleConfirm = () => {
    const militaryHours = isAm ? (hours === 12 ? 0 : hours) : (hours === 12 ? 12 : hours + 12);
    const timeStr = `${militaryHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    onChange(timeStr);
    
    // Show success state
    setShowSuccess(true);
    
    // After 1.5s, revert to live mode
    setTimeout(() => {
      setShowSuccess(false);
      setIsLive(true);
    }, 1500);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (showSuccess) return;
    setIsLive(false);
    setActiveHand("minutes");
    lastAngleRef.current = null; // Reset for new interaction
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    updateHand(clientX, clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!activeHand) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    updateHand(clientX, clientY);
  }, [activeHand, updateHand]);

  const handleMouseUp = useCallback(() => {
    setActiveHand(null);
    lastAngleRef.current = null;
  }, []);

  useEffect(() => {
    if (activeHand) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [activeHand, handleMouseMove, handleMouseUp]);

  const toggleAmPm = () => {
    const nextAm = !isAm;
    setIsAm(nextAm);
    stateRef.current.isAm = nextAm;
    
    // Update parent immediately
    const militaryHours = nextAm ? (hours === 12 ? 0 : hours) : (hours === 12 ? 12 : hours + 12);
    const timeStr = `${militaryHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    onChange(timeStr);
  };

  // Rotation angles
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6;

  // Render glow color
  const glowStyle = {
    color: accentColor,
    textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}88`,
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        ref={clockRef}
        onMouseDown={(e) => {
          handleMouseDown(e);
        }}
        onTouchStart={(e) => {
          handleMouseDown(e);
        }}
        className="relative w-72 h-72 rounded-full border border-white/5 flex items-center justify-center transition-all bg-zinc-900 shadow-2xl overflow-hidden cursor-crosshair touch-none"
        style={{ 
          boxShadow: `inset 0 0 100px ${accentColor}11, 0 20px 80px -20px black`,
          background: `radial-gradient(circle at center, #18181b 0%, #09090b 100%)`
        }}
      >
        {/* Ambient glow */}
        <div 
          className="absolute inset-0 opacity-20 blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)` }}
        />
        {/* Pattern backdrop */}
        <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />

        {/* Numbers & Marks */}
        <div className="absolute inset-0 pointer-events-none">
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
            const isBig = [12, 3, 6, 9].includes(n);
            const angle = i * 30;
            return (
              <div 
                key={n}
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div 
                  className="flex flex-col items-center justify-between h-full py-6"
                  style={{ transform: `rotate(-${angle}deg)` }}
                >
                  {isBig ? (
                    <span 
                      className="text-2xl font-black tracking-tighter" 
                      style={glowStyle}
                    >
                      {n}
                    </span>
                  ) : (
                    <div 
                      className="w-1.5 h-4 rounded-full" 
                      style={{ 
                        backgroundColor: accentColor,
                        boxShadow: `0 0 12px ${accentColor}, 0 0 6px ${accentColor}`
                      }} 
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Point */}
        <div 
          className="absolute w-5 h-5 rounded-full z-30 border-2 shadow-lg" 
          style={{ backgroundColor: "#111", borderColor: accentColor }}
        />

        {/* Hands Container */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Hour Hand */}
          <motion.div 
            initial={false}
            animate={{ rotate: hourAngle }}
            transition={activeHand ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div 
              className="absolute w-2.5 h-16 rounded-full -translate-y-8 shadow-2xl" 
              style={{ 
                backgroundColor: accentColor,
                boxShadow: `0 0 20px ${accentColor}cc`,
                border: "1px solid rgba(255,255,255,0.3)"
              }}
            />
          </motion.div>
          
          {/* Minute Hand */}
          <motion.div 
            initial={false}
            animate={{ rotate: minuteAngle }}
            transition={activeHand ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div 
              className="absolute w-2 h-26 rounded-full -translate-y-13 shadow-2xl" 
              style={{ 
                backgroundColor: "#FFFFFF",
                boxShadow: `0 0 20px white`,
                border: "1px solid rgba(0,0,0,0.2)"
              }}
            />
            <div 
              className="absolute w-4 h-4 rounded-full -translate-y-24 border-2" 
              style={{ borderColor: "white", backgroundColor: "transparent" }}
            />
          </motion.div>
        </div>

        {/* Live Second Hand - Only show when NOT dragging */}
        {!activeHand && <LiveSecondHand accentColor={accentColor} />}
      </div>

      <div className="flex flex-col items-center gap-4 w-full h-auto mt-4 px-4">
        {/* Digital Preview Moved Content */}
        <div className="flex flex-col items-center w-full">
           <div className="flex items-center justify-center w-full mb-6">
              <motion.div 
                animate={{ 
                  scale: activeHand ? 1.05 : 1,
                  y: activeHand ? -2 : 0
                }}
                className="text-6xl font-black tracking-tighter tabular-nums flex items-baseline gap-2"
                style={{ 
                  color: (isLive || showSuccess) ? "#fff" : accentColor,
                  textShadow: (isLive || showSuccess) ? "0 0 40px rgba(255,255,255,0.25)" : `0 0 40px ${accentColor}55`
                }}
              >
                {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}
                <span className="text-xl font-bold opacity-30 uppercase tracking-[0.2em] ml-2">{isAm ? 'AM' : 'PM'}</span>
              </motion.div>
           </div>

           <div className="flex items-center justify-between w-full">
             <div className="flex items-center gap-2">
               <button 
                 onClick={toggleAmPm}
                 disabled={showSuccess}
                 className="px-5 h-11 rounded-2xl text-[11px] font-black tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                 style={{ 
                   backgroundColor: accentColor + "15", 
                   color: accentColor,
                   border: `1px solid ${accentColor}25`
                 }}
               >
                 {isAm ? <Sun size={14} strokeWidth={3} /> : <Moon size={14} strokeWidth={3} />}
                 {isAm ? "AM" : "PM"}
               </button>
               {(isLive && !showSuccess) && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: [0.4, 1, 0.4] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="flex items-center gap-1.5 px-3 h-11 rounded-xl"
                   style={{ backgroundColor: "#22c55e11" }}
                 >
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live</span>
                 </motion.div>
               )}
             </div>

             <AnimatePresence mode="wait">
               {showSuccess ? (
                 <motion.div
                   key="success"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="flex flex-col items-end"
                 >
                   <span className="text-xs font-black uppercase tracking-widest text-green-500">Time Saved</span>
                   <span className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]" style={{ color: colors.textSecondary }}>Saved!</span>
                 </motion.div>
               ) : !isLive && (
                 <motion.button
                   key="confirm"
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.8, opacity: 0 }}
                   onClick={handleConfirm}
                   className="px-8 h-11 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
                   style={{ 
                     backgroundColor: accentColor, 
                     color: "#000",
                     boxShadow: `0 8px 20px ${accentColor}66` 
                   }}
                 >
                   Confirm
                 </motion.button>
               )}
             </AnimatePresence>
           </div>
           
           <div className="mt-8 flex flex-col items-center">
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-center">
               {showSuccess ? "" : isLive ? "Drag hands to set habit time" : "Press Confirm to save time"}
             </span>
             {value && isLive && !showSuccess && (
               <motion.div 
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border flex items-center gap-2"
                 style={{ backgroundColor: accentColor + "11", borderColor: accentColor + "33", color: accentColor }}
               >
                 <Clock size={10} />
                 Time: {value}
               </motion.div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

const LiveSecondHand: React.FC<{ accentColor: string }> = ({ accentColor }) => {
  const [secAngle, setSecAngle] = useState(0);

  useEffect(() => {
    let frameId: number;
    const tick = () => {
      const now = new Date();
      const ms = now.getMilliseconds();
      const s = now.getSeconds();
      // Smooth sweep: seconds * 6 (degrees per sec) + ms * 0.006 (degrees per ms)
      setSecAngle(s * 6 + ms * 0.006);
      frameId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      style={{ transform: `rotate(${secAngle}deg)` }}
    >
      <div 
        className="absolute w-0.5 h-28 rounded-full -translate-y-10 opacity-60 shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
        style={{ backgroundColor: "#FF3B30" }} // Red second hand for a classic look
      />
    </div>
  );
};

export default AnalogClockPicker;
