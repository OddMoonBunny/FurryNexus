import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

export function useContentFilters() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Always show all content
  const [browseShowNsfw, setBrowseShowNsfw] = useState(true);
  const [browseShowAiGenerated, setBrowseShowAiGenerated] = useState(true);

  // Update local state when user preferences change
  useEffect(() => {
    if (user) {
      // Only update from user object if we don't have localStorage values
      const storedNsfwPref = localStorage.getItem(`userNsfwPref_${user.id}`);
      const storedAiPref = localStorage.getItem(`userAiPref_${user.id}`);

      if (storedNsfwPref === null) {
        setBrowseShowNsfw(user.showNsfw);
        localStorage.setItem(`userNsfwPref_${user.id}`, String(user.showNsfw));
      } else {
        setBrowseShowNsfw(storedNsfwPref === 'true');
      }

      if (storedAiPref === null) {
        setBrowseShowAiGenerated(user.showAiGenerated);
        localStorage.setItem(`userAiPref_${user.id}`, String(user.showAiGenerated));
      } else {
        setBrowseShowAiGenerated(storedAiPref === 'true');
      }
    }
  }, [user?.id, user?.showNsfw, user?.showAiGenerated]);

  // Function to update NSFW filter
  const updateNsfwFilter = useCallback((value) => {
    setBrowseShowNsfw(value);
    if (user) {
      localStorage.setItem(`userNsfwPref_${user.id}`, String(value));

      // Optionally update user preferences on the server
      apiRequest(`/api/users/${user.id}/preferences`, {
        method: 'PATCH',
        body: { showNsfw: value }
      }).then(() => {
        // Invalidate user query to refresh data
        queryClient.invalidateQueries(['/api/user']);
      });
    }
  }, [user, queryClient]);

  // Function to update AI-generated content filter
  const updateAiFilter = useCallback((value) => {
    setBrowseShowAiGenerated(value);
    if (user) {
      localStorage.setItem(`userAiPref_${user.id}`, String(value));

      // Optionally update user preferences on the server
      apiRequest(`/api/users/${user.id}/preferences`, {
        method: 'PATCH',
        body: { showAiGenerated: value }
      }).then(() => {
        // Invalidate user query to refresh data
        queryClient.invalidateQueries(['/api/user']);
      });
    }
  }, [user, queryClient]);

  return {
    browseShowNsfw,
    browseShowAiGenerated,
    updateNsfwFilter,
    updateAiFilter
  };
}