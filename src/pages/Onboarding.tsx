import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, User, Palette, CheckCircle2, ChevronRight, ArrowLeft, Bell } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import { useProfile } from "../store/ProfileContext";
import IconPicker from "../components/IconPicker";
import { palettes, ThemeMode, BASIC_THEMES, THEME_META } from "../theme/colors";

const Onboarding: React.FC = () => {
  const { colors, mode, setMode } = useTheme();
  const { updateProfile } = useProfile();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const steps = [
    {
      id: "welcome",
      icon: Sparkles,
      title: "Tiny habits.\nBig change.",
      subtitle: "The most private, lightweight, and ultra-fast habit tracker built just for you.",
    },
    {
      id: "profile",
      icon: User,
      title: "What's your\nname?",
      subtitle: "Your data stays on this device. We don't even have a server.",
    },
    {
      id: "theme",
      icon: Palette,
      title: "Pick your\nstyle.",
      subtitle: "Choose an accent that matches your personality.",
    }
  ];

  const handleFinish = () => {
    localStorage.setItem("tapdone:onboarded", "1");
      window.dispatchEvent(new Event("tapdone:onboarded"));
    updateProfile({ name: name || "User", image });
    navigate("/home");
  };

  const next = async () => {
    if (step < steps.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto overflow-hidden px-8 py-10" style={{ backgroundColor: colors.background, color: colors.textPrimary }}>
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button onClick={back} className="p-2 -ml-2 rounded-full active:bg-zinc-500/10 transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <span className="text-lg font-bold tracking-tighter">TapDone</span>
        </div>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className="h-1 rounded-full transition-all duration-300" 
              style={{ 
                width: i === step ? '16px' : '4px',
                backgroundColor: i === step ? colors.accentPrimary : colors.border 
              }} 
            />
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col pt-4 pb-10"
          >
            <div className="w-16 h-16 rounded-2xl border flex items-center justify-center mb-8" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <Icon size={28} strokeWidth={2} style={{ color: colors.accentPrimary }} />
            </div>
            
            <h2 className="text-3xl font-bold tracking-tighter leading-tight mb-4 whitespace-pre-wrap">
              {currentStep.title}
            </h2>
            <p className="text-sm font-medium opacity-60 leading-relaxed mb-10">
              {currentStep.subtitle}
            </p>

            {currentStep.id === "profile" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <div 
                    className="w-24 h-24 rounded-[32px] border-2 border-dashed flex items-center justify-center overflow-hidden mx-auto"
                    style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                  >
                    {image ? (
                      <img src={image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="opacity-20" />
                    )}
                  </div>
                  <IconPicker 
                    selectedIcon={image || ""}
                    onSelect={(icon) => setImage(icon)}
                    onDeleteCustom={() => setImage(null)}
                    accentColor={colors.accentPrimary}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">Your Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Suraj"
                    className="w-full h-14 px-5 rounded-2xl border-2 outline-none transition-all focus:border-current"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
                  />
                </div>
              </div>
            )}

            {currentStep.id === "theme" && (
              <div className="grid grid-cols-2 gap-3">
                {(BASIC_THEMES as ThemeMode[]).map((m) => {
                  const p = palettes[m];
                  const active = mode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className="p-4 rounded-2xl border-2 flex flex-col gap-3 active:scale-95 transition-transform"
                      style={{
                        backgroundColor: p.background,
                        borderColor: active ? p.accentPrimary : p.border,
                        boxShadow: active ? `0 0 0 2px ${p.accentPrimary}` : "none"
                      }}
                    >
                      <div className="flex gap-1.5">
                        <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: p.accentPrimary }} />
                        <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: p.success }} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: p.textPrimary }}>
                        {THEME_META[m]?.name || m}
                      </span>
                      {active && (
                        <span className="text-[9px] font-bold opacity-60" style={{ color: p.textSecondary }}>
                          Selected ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="pt-6">
        <button
          onClick={next}
          disabled={step === 1 && !name.trim()}
          className="w-full h-14 rounded-2xl text-base font-bold tracking-tight shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale"
          style={{ backgroundColor: colors.accentPrimary, color: colors.background }}
        >
          <span>{step === steps.length - 1 ? "Get started" : "Continue"}</span>
          <ChevronRight size={18} />
        </button>
      </footer>
    </div>
  );
};

export default Onboarding;
