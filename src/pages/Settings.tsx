import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Moon, Sun, Crown, Download, Upload, Shield, Trash2, Sparkles, UserCircle } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../theme/ThemeContext";
import { palettes as Palettes } from "../theme/colors";
import { useHabits } from "../store/HabitContext";
import { useProfile } from "../store/ProfileContext";
import IconPicker, { PREDEFINED_ICONS } from "../components/IconPicker";
import { adService } from "../services/AdService";

const Settings: React.FC = () => {
  const { colors, mode, setMode, appIcon, customAppIcon, setAppIcon, removeCustomAppIcon, toggle } = useTheme();

  useEffect(() => {
    adService.showBanner();
    return () => {
      adService.hideBanner();
    };
  }, []);
  const navigate = useNavigate();
  const { exportData, importData, clearAll, habits, completions } = useHabits();
  const { profile } = useProfile();

  const onExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tapdone-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        const json = event.target.result;
        const ok = await importData(json);
        if (ok) alert("Data restored successfully!");
        else alert("Invalid backup data.");
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const onClear = () => {
    if (confirm("Delete all habits and history? THIS CANNOT BE UNDONE.")) {
      clearAll();
    }
  };

  const SettingRow = ({ icon: Icon, label, value, onClick, right, danger }: any) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 border-b last:border-b-0 cursor-pointer select-none transition-colors active:bg-black/5 dark:active:bg-white/5`}
      style={{ borderBottomColor: colors.border }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.surfaceElevated }}>
        <Icon size={18} style={{ color: danger ? colors.danger : colors.textPrimary }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-semibold tracking-tight ${danger ? 'text-red-500' : ''}`} style={{ color: danger ? colors.danger : colors.textPrimary }}>{label}</p>
        {value && <p className="text-[12px] font-medium opacity-60" style={{ color: colors.textSecondary }}>{value}</p>}
      </div>
      {right ? right : onClick && <ChevronRight size={18} className="opacity-40" />}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 pt-10"
    >
      <h1 className="text-3xl font-serif italic font-medium tracking-tight mb-10" style={{ color: colors.textPrimary }}>
        Settings
      </h1>

      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/premium')}
        className="flex items-center gap-5 p-6 rounded-[32px] mb-12 cursor-pointer shadow-xl transition-all glass border"
        style={{ backgroundColor: colors.textPrimary, color: colors.background, borderColor: colors.border }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20">
          <Crown size={22} />
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold tracking-tight">Experience Premium</p>
          <p className="text-[11px] font-medium opacity-60 uppercase tracking-widest mt-0.5">Themes • Mastery • No Ads</p>
        </div>
        <ChevronRight size={20} className="opacity-40" />
      </motion.div>

      <div className="space-y-8">
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 mb-3 px-2" style={{ color: colors.textSecondary }}>Personal</h2>
          <div className="rounded-[32px] border overflow-hidden glass" style={{ backgroundColor: colors.surface + "80", borderColor: colors.border }}>
            <SettingRow
              icon={UserCircle}
              label={profile.name}
              value={profile.bio || "Crafting a better self"}
              onClick={() => navigate('/profile')}
              right={
                <div className="w-12 h-12 rounded-2xl overflow-hidden border shadow-sm glass" style={{ borderColor: colors.border }}>
                  {(() => {
                    const isPredefined = profile.image && PREDEFINED_ICONS.some(i => i.name === profile.image);
                    if (profile.image && !isPredefined) {
                      return <img src={profile.image} alt="Avatar" className="w-full h-full object-cover" />;
                    }
                    const IconComp = isPredefined 
                      ? PREDEFINED_ICONS.find(i => i.name === profile.image)?.comp || UserCircle 
                      : UserCircle;
                    return (
                      <div className="w-full h-full flex items-center justify-center opacity-40">
                        <IconComp size={22} />
                      </div>
                    );
                  })()}
                </div>
              }
            />
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest opacity-60 mb-2.5 px-1" style={{ color: colors.textSecondary }}>App Profile Icon</h2>
          <div className="p-5 rounded-[22px] border mb-4 flex flex-col items-center gap-6" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
             <div 
               className="w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden border-4 shadow-xl"
               style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.accentPrimary }}
             >
               {appIcon.startsWith('data:image/') ? (
                 <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" />
               ) : (
                 React.createElement(PREDEFINED_ICONS.find(i => i.name === appIcon)?.comp || UserCircle, { 
                   size: 48, 
                   style: { color: colors.accentPrimary }
                 })
               )}
             </div>
             
             <div className="w-full">
               <IconPicker 
                 selectedIcon={appIcon}
                 customIcon={customAppIcon}
                 onSelect={setAppIcon}
                 onDeleteCustom={removeCustomAppIcon}
                 accentColor={colors.accentPrimary}
               />
             </div>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 mb-3 px-2" style={{ color: colors.textSecondary }}>Theme</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'light', name: 'Zenn', icon: Sun },
              { id: 'dark', name: 'Onyx', icon: Moon },
              { id: 'midnight', name: 'Void', icon: Moon },
              { id: 'forest', name: 'Moss', icon: Moon },
              { id: 'ocean', name: 'Azure', icon: Moon },
              { id: 'pastel', name: 'Dream', icon: Sparkles },
              { id: 'brutalist', name: 'Raw', icon: Shield },
            ].map((theme) => {
              const active = mode === theme.id;
              const palette = (Palettes as any)[theme.id];
              return (
                <motion.button
                  key={theme.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode(theme.id as any)}
                  className={`relative h-24 rounded-[28px] border-2 flex flex-col items-center justify-center gap-2 transition-all`}
                  style={{
                    backgroundColor: palette.background,
                    borderColor: active ? colors.textPrimary : colors.border,
                    color: palette.textPrimary,
                    boxShadow: active ? `0 12px 24px ${palette.accentPrimary}15` : "none"
                  }}
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: palette.surfaceElevated }}>
                    <theme.icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{theme.name}</span>
                  {active && (
                    <motion.div 
                      layoutId="activeThemeDot"
                      className="absolute top-3 right-3 w-2 h-2 rounded-full" 
                      style={{ backgroundColor: palette.accentPrimary }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest opacity-60 mb-2.5 px-1" style={{ color: colors.textSecondary }}>Data & Privacy</h2>
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <div className="p-4 border-b" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <Shield size={16} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>Private & Local</h3>
              </div>
              <p className="text-[11px] leading-relaxed opacity-60 font-medium" style={{ color: colors.textSecondary }}>
                All your habits, streaks, and progress are stored safely on your device. We never sync your data to any server. Complete privacy by design.
              </p>
            </div>
            
            <SettingRow icon={Download} label="Export Backup" value="Save local data as JSON" onClick={onExport} />
            <SettingRow icon={Upload} label="Restore from History" value="Import your history" onClick={onImport} />
            <SettingRow icon={Trash2} label="Clear All Data" danger onClick={onClear} />
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest opacity-60 mb-2.5 px-1" style={{ color: colors.textSecondary }}>About</h2>
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <SettingRow
              icon={Shield}
              label="Privacy policy"
              value="Your data lives only here"
              onClick={() => alert("TapDone stores everything locally. No servers. Your data is yours.")}
            />
          </div>
        </section>
      </div>

      <p className="text-center mt-12 mb-2 text-[11px] font-bold uppercase tracking-widest opacity-40" style={{ color: colors.textTertiary }}>
        TapDone • v1.0
      </p>

      <div className="h-32" />
    </motion.div>
  );
};

export default Settings;
