import { useState, useCallback, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export const useContentFilters = () => {
  const { user } = useAuth();

  const [browseShowNsfw, setBrowseShowNsfw] = useState(() => {
    // Try to get from localStorage first, then fall back to user preferences
    const storedPref = localStorage.getItem(`userNsfwPref_${user?.id}`);
    return storedPref !== null ? storedPref === "true" : (user?.showNsfw ?? false);
  });

  const [browseShowAiGenerated, setBrowseShowAiGenerated] = useState(() => {
    // Try to get from localStorage first, then fall back to user preferences
    const storedPref = localStorage.getItem(`userAiPref_${user?.id}`);
    return storedPref !== null ? storedPref === "true" : (user?.showAiGenerated ?? true);
  });

  // Update local state when user preferences change
  useEffect(() => {
    if (user) {
      // Only update from user object if we don't have localStorage values
      const storedNsfwPref = localStorage.getItem(`userNsfwPref_${user.id}`);
      const storedAiPref = localStorage.getItem(`userAiPref_${user.id}`);
      
      if (storedNsfwPref === null) {
        setBrowseShowNsfw(user.showNsfw);
        localStorage.setItem(`userNsfwPref_${user.id}`, String(user.showNsfw));
      }
      
      if (storedAiPref === null) {
        setBrowseShowAiGenerated(user.showAiGenerated);
        localStorage.setItem(`userAiPref_${user.id}`, String(user.showAiGenerated));
      }
    }
  }, [user?.id, user?.showNsfw, user?.showAiGenerated]);

  const updatePreferences = useCallback(async (preferences: { showNsfw?: boolean; showAiGenerated?: boolean }) => {
    if (!user) return;

    try {
      // Always send both current values when updating preferences
      const updatedPreferences = {
        showNsfw: preferences.showNsfw ?? browseShowNsfw,
        showAiGenerated: preferences.showAiGenerated ?? browseShowAiGenerated
      };

      await apiRequest("PATCH", `/api/users/${user.id}/preferences`, updatedPreferences);

      // Update the user data in the cache with both values
      queryClient.setQueryData(["/api/user"], (oldData: any) => ({
        ...oldData,
        ...updatedPreferences
      }));

      // Update local state and localStorage
      if (preferences.showNsfw !== undefined) {
        setBrowseShowNsfw(preferences.showNsfw);
        localStorage.setItem(`userNsfwPref_${user.id}`, String(preferences.showNsfw));
      }
      if (preferences.showAiGenerated !== undefined) {
        setBrowseShowAiGenerated(preferences.showAiGenerated);
        localStorage.setItem(`userAiPref_${user.id}`, String(preferences.showAiGenerated));
      }

      // Invalidate queries that depend on these filters
      queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      console.log("Updated preferences:", updatedPreferences);
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  }, [user, browseShowNsfw, browseShowAiGenerated]);

  const updateNsfwFilter = useCallback((checked: boolean) => {
    if (user) {
      console.log("Updating NSFW filter to:", checked);
      updatePreferences({ showNsfw: checked });
    }
  }, [updatePreferences, user]);

  const updateAiFilter = useCallback((checked: boolean) => {
    if (user) {
      console.log("Updating AI filter to:", checked);
      updatePreferences({ showAiGenerated: checked });
    }
  }, [updatePreferences, user]);

  return {
    browseShowNsfw,
    browseShowAiGenerated,
    updateNsfwFilter,
    updateAiFilter
  };
};