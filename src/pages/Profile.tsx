import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, User, ClipboardList, Calendar, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../theme/ThemeContext";
import { useProfile } from "../store/ProfileContext";
import IconPicker, { PREDEFINED_ICONS } from "../components/IconPicker";

const Profile: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();

  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [image, setImage] = useState(profile.image);

  const handleSave = () => {
    updateProfile({ name, bio, image });
    navigate(-1);
  };

  const isPredefined = image && PREDEFINED_ICONS.some(i => i.name === image);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: colors.background }}
    >
      <header className="px-6 pt-10 pb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all glass border"
          style={{ backgroundColor: colors.surface + "80", color: colors.textPrimary, borderColor: colors.border }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-serif italic font-medium tracking-tight" style={{ color: colors.textPrimary }}>Identity</h1>
        <button
          onClick={handleSave}
          className="px-6 h-11 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 bg-white text-black"
        >
          Save
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-8">
        {/* Avatar Section */}
        <section className="flex flex-col items-center pt-4">
          <div className="relative group">
            <div 
              className="w-36 h-36 rounded-[48px] border-[6px] overflow-hidden relative shadow-2xl glass"
              style={{ borderColor: colors.surface, backgroundColor: colors.surface }}
            >
              {image ? (
                isPredefined ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {React.createElement(PREDEFINED_ICONS.find(i => i.name === image)?.comp || User, { 
                      size: 64, 
                      style: { color: colors.accentPrimary } 
                    })}
                  </div>
                ) : (
                  <img src={image} alt="Profile" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                  <User size={64} style={{ color: colors.textPrimary }} />
                </div>
              )}
            </div>
            
            <div className="mt-4 w-full">
              <IconPicker 
                selectedIcon={image || "User"}
                customIcon={!isPredefined ? image : null}
                onSelect={(icon) => setImage(icon)}
                onDeleteCustom={() => setImage(null)}
                accentColor={colors.accentPrimary}
              />
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="space-y-8 pt-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 ml-1 px-1 block" style={{ color: colors.textSecondary }}>Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-6 h-16 rounded-[28px] text-lg font-medium outline-none border transition-all focus:ring-4 glass"
              style={{ 
                backgroundColor: colors.surface + "80", 
                color: colors.textPrimary,
                borderColor: colors.border,
                // @ts-ignore
                "--tw-ring-color": colors.accentPrimary + "10"
              }}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 ml-1 px-1 block" style={{ color: colors.textSecondary }}>Short Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words about your journey..."
              rows={3}
              className="w-full px-6 py-5 rounded-[28px] text-base font-medium outline-none border transition-all glass resize-none"
              style={{ 
                backgroundColor: colors.surface + "80", 
                color: colors.textPrimary,
                borderColor: colors.border,
              }}
            />
          </div>
        </section>

        {/* Stats Preview */}
        <section className="pt-4 border-t" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-4 text-sm opacity-60 font-medium" style={{ color: colors.textSecondary }}>
            <Calendar size={16} />
            <span>Joined {new Date(profile.joinedDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Profile;
