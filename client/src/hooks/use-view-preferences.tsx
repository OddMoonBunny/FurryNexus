import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";

export interface ViewPreferences {
  showNsfw: boolean;
  showAiGenerated: boolean;
  viewMode: "grid" | "list";
}

export function useViewPreferences() {
  const { user } = useAuth();
  const userId = user?.id;

  const [preferences, setPreferences] = useState<ViewPreferences>(() => ({
    showNsfw: false,
    showAiGenerated: true,
    viewMode: "grid",
  }));

  // Load preferences
  useEffect(() => {
    if (!userId) return;

    const storedPrefs = localStorage.getItem(`user_prefs_${userId}`);
    if (storedPrefs) {
      setPreferences(JSON.parse(storedPrefs));
    }
  }, [userId]);

  // Update a single preference
  const updatePreference = <K extends keyof ViewPreferences>(
    key: K,
    value: ViewPreferences[K]
  ) => {
    if (!userId) return;

    const newPrefs = {
      ...preferences,
      [key]: value,
    };
    setPreferences(newPrefs);
    localStorage.setItem(`user_prefs_${userId}`, JSON.stringify(newPrefs));
  };

  return {
    preferences,
    updatePreference,
  };
}
