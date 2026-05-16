import React, { useState, useCallback } from "react";
import { Upload, Crop, Droplet, Dumbbell, BookOpen, Moon, Footprints, GraduationCap, Brain, Apple, Heart, Coffee, PenLine, Music, Sun, Leaf, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Cropper from "react-easy-crop";
import { useTheme } from "../theme/ThemeContext";
import { getCroppedImg } from "../lib/cropUtils";

export const PREDEFINED_ICONS = [
  { name: "Droplet", comp: Droplet }, { name: "Dumbbell", comp: Dumbbell },
  { name: "BookOpen", comp: BookOpen }, { name: "Moon", comp: Moon },
  { name: "Footprints", comp: Footprints }, { name: "GraduationCap", comp: GraduationCap },
  { name: "Brain", comp: Brain }, { name: "Apple", comp: Apple },
  { name: "Heart", comp: Heart }, { name: "Coffee", comp: Coffee },
  { name: "PenLine", comp: PenLine }, { name: "Music", comp: Music },
  { name: "Sun", comp: Sun }, { name: "Leaf", comp: Leaf },
];

interface IconPickerProps {
  selectedIcon: string;
  customIcon?: string | null;
  onSelect: (iconName: string) => void;
  onDeleteCustom?: () => void;
  accentColor: string;
}

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, customIcon, onSelect, onDeleteCustom, accentColor }) => {
  const { colors } = useTheme();
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (imageToCrop && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        onSelect(croppedImage);
        setImageToCrop(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const isCustomIconSelected = selectedIcon.startsWith('data:image/');
  const hasCustomIcon = customIcon || isCustomIconSelected;
  const displayCustomIcon = customIcon || (isCustomIconSelected ? selectedIcon : null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2.5">
        <label 
          className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
          style={{ borderColor: colors.border, color: colors.textSecondary }}
        >
          <Upload size={18} />
          <span className="text-[8px] font-bold uppercase">Custom</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>

        {hasCustomIcon && displayCustomIcon && (
          <div className="relative group shrink-0">
            <motion.button
              layout
              onClick={() => onSelect(displayCustomIcon)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ y: -2 }}
              animate={{ 
                scale: isCustomIconSelected ? 1.1 : 1,
                y: isCustomIconSelected ? -4 : 0,
                boxShadow: isCustomIconSelected ? `0 10px 20px -5px ${accentColor}66` : "none"
              }}
              className="aspect-square rounded-xl border-2 flex items-center justify-center overflow-hidden p-0 relative"
              style={{
                borderColor: isCustomIconSelected ? accentColor : colors.border,
              }}
            >
              <div
                className="w-full h-full"
              >
                <img src={displayCustomIcon} alt="Selected" className="w-full h-full object-cover" />
              </div>
              {isCustomIconSelected && (
                <motion.div 
                  layoutId="selectedBadgeCustom"
                  className="absolute inset-0 bg-black/10 flex items-center justify-center"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2.5 h-2.5 rounded-full bg-white shadow-xl" 
                  />
                </motion.div>
              )}
            </motion.button>
            
            {onDeleteCustom && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, backgroundColor: "#ef4444" }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCustom();
                }}
                className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl z-20 border-2 border-white dark:border-zinc-900"
              >
                <Trash2 size={12} strokeWidth={3} />
              </motion.button>
            )}
          </div>
        )}

        {PREDEFINED_ICONS.map((ic) => {
          const Icon = ic.comp;
          const active = selectedIcon === ic.name;
          return (
            <motion.button
              layout
              key={ic.name}
              onClick={() => onSelect(ic.name)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ y: -2 }}
              animate={{ 
                scale: active ? 1.1 : 1,
                y: active ? -4 : 0,
                boxShadow: active ? `0 10px 20px -5px ${accentColor}44` : "none"
              }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="aspect-square rounded-xl border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: active ? accentColor : colors.surface,
                borderColor: active ? accentColor : colors.border,
                color: active ? colors.background : colors.textPrimary
              }}
            >
              <motion.div
                animate={active ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.5, ease: "backOut" }}
              >
                <Icon size={20} strokeWidth={2} />
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {imageToCrop && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-black">
            <div className="relative flex-1">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-8 pb-12 bg-black/80 backdrop-blur-md flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setImageToCrop(null)}
                  className="flex-1 h-14 rounded-2xl font-bold bg-white/10 text-white transition-transform active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  className="flex-1 h-14 rounded-2xl font-bold bg-white text-black flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Crop size={18} />
                  Save Crop
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IconPicker;
