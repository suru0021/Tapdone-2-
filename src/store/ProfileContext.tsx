import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Preferences } from '@capacitor/preferences';

interface UserProfile {
  name: string;
  bio: string;
  image: string | null;
  joinedDate: string;
}

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  ready: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Habit Tracker",
  bio: "Consistency is the key to success.",
  image: null,
  joinedDate: new Date().toISOString(),
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const KEY = "tapdone:userProfile";

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { value } = await Preferences.get({ key: KEY });
      const legacy = localStorage.getItem(KEY);
      const saved = value || legacy;

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProfile(parsed);
          if (legacy && !value) {
            await Preferences.set({ key: KEY, value: saved });
          }
        } catch (e) {
          console.error("Failed to parse profile", e);
        }
      }
      setReady(true);
    };
    load();
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      const serialized = JSON.stringify(next);
      localStorage.setItem(KEY, serialized);
      Preferences.set({ key: KEY, value: serialized });
      return next;
    });
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, ready }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};
