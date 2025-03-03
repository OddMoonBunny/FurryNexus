import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface UserPreferences {
  showNsfw: boolean;
  showAiGenerated: boolean;
}

export function useContentFilters() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Default to showing all content
  const [browseShowNsfw, setBrowseShowNsfw] = useState(true);
  const [browseShowAiGenerated, setBrowseShowAiGenerated] = useState(true);

  // Safely get localStorage value
  const getStoredPref = (key: string): boolean | null => {
    try {
      const value = localStorage.getItem(key);
      return value === null ? null : value === 'true';
    } catch {
      return null;
    }
  };

  // Safely set localStorage value
  const setStoredPref = (key: string, value: boolean): void => {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      console.warn('Failed to save preference to localStorage');
    }
  };

  // Update local state when user preferences change
  useEffect(() => {
    if (!user) return;

    const storedNsfwPref = getStoredPref(`userNsfwPref_${user.id}`);
    const storedAiPref = getStoredPref(`userAiPref_${user.id}`);

    if (storedNsfwPref === null) {
      setBrowseShowNsfw(user.showNsfw ?? true);
      setStoredPref(`userNsfwPref_${user.id}`, user.showNsfw ?? true);
    } else {
      setBrowseShowNsfw(storedNsfwPref);
    }

    if (storedAiPref === null) {
      setBrowseShowAiGenerated(user.showAiGenerated ?? true);
      setStoredPref(`userAiPref_${user.id}`, user.showAiGenerated ?? true);
    } else {
      setBrowseShowAiGenerated(storedAiPref);
    }
  }, [user?.id, user?.showNsfw, user?.showAiGenerated]);

  // Function to update NSFW filter
  const updateNsfwFilter = useCallback(async (value: boolean) => {
    if (!user) return;

    setBrowseShowNsfw(value);
    setStoredPref(`userNsfwPref_${user.id}`, value);

    try {
      await apiRequest<UserPreferences>({
        url: `/api/users/${user.id}/preferences`,
        method: 'PATCH',
        data: { showNsfw: value }
      });

      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    } catch (error) {
      console.error('Failed to update NSFW preference:', error);
      // Revert on error
      setBrowseShowNsfw(!value);
      setStoredPref(`userNsfwPref_${user.id}`, !value);
    }
  }, [user, queryClient]);

  // Function to update AI-generated content filter
  const updateAiFilter = useCallback(async (value: boolean) => {
    if (!user) return;

    setBrowseShowAiGenerated(value);
    setStoredPref(`userAiPref_${user.id}`, value);

    try {
      await apiRequest<UserPreferences>({
        url: `/api/users/${user.id}/preferences`,
        method: 'PATCH',
        data: { showAiGenerated: value }
      });

      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    } catch (error) {
      console.error('Failed to update AI content preference:', error);
      // Revert on error
      setBrowseShowAiGenerated(!value);
      setStoredPref(`userAiPref_${user.id}`, !value);
    }
  }, [user, queryClient]);

  return {
    browseShowNsfw,
    browseShowAiGenerated,
    updateNsfwFilter,
    updateAiFilter
  };
}