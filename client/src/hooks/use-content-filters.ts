import { useState, useCallback, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export const useContentFilters = () => {
  const { user } = useAuth();

  const [browseShowNsfw, setBrowseShowNsfw] = useState(() => {
    return user?.showNsfw ?? false;
  });

  const [browseShowAiGenerated, setBrowseShowAiGenerated] = useState(() => {
    return user?.showAiGenerated ?? true;
  });

  // Update local state when user preferences change
  useEffect(() => {
    if (user) {
      setBrowseShowNsfw(user.showNsfw);
      setBrowseShowAiGenerated(user.showAiGenerated);
    }
  }, [user?.showNsfw, user?.showAiGenerated]);

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

      // Update local state
      if (preferences.showNsfw !== undefined) {
        setBrowseShowNsfw(preferences.showNsfw);
      }
      if (preferences.showAiGenerated !== undefined) {
        setBrowseShowAiGenerated(preferences.showAiGenerated);
      }

      // Invalidate queries that depend on these filters
      queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  }, [user, browseShowNsfw, browseShowAiGenerated]);

  const updateNsfwFilter = useCallback((checked: boolean) => {
    updatePreferences({ showNsfw: checked });
  }, [updatePreferences]);

  const updateAiFilter = useCallback((checked: boolean) => {
    updatePreferences({ showAiGenerated: checked });
  }, [updatePreferences]);

  return {
    browseShowNsfw,
    browseShowAiGenerated,
    updateNsfwFilter,
    updateAiFilter
  };
};