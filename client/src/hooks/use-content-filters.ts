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

  const updateNsfwFilter = useCallback(async (checked: boolean) => {
    if (!user) return;

    try {
      await apiRequest("PATCH", `/api/users/${user.id}/preferences`, {
        showNsfw: checked
      });

      // Update the user data in the cache
      queryClient.setQueryData(["/api/user"], (oldData: any) => ({
        ...oldData,
        showNsfw: checked
      }));

      setBrowseShowNsfw(checked);

      // Invalidate queries that depend on this filter
      queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    } catch (error) {
      console.error("Failed to update NSFW preference:", error);
    }
  }, [user]);

  const updateAiFilter = useCallback(async (checked: boolean) => {
    if (!user) return;

    try {
      await apiRequest("PATCH", `/api/users/${user.id}/preferences`, {
        showAiGenerated: checked
      });

      // Update the user data in the cache
      queryClient.setQueryData(["/api/user"], (oldData: any) => ({
        ...oldData,
        showAiGenerated: checked
      }));

      setBrowseShowAiGenerated(checked);

      // Invalidate queries that depend on this filter
      queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    } catch (error) {
      console.error("Failed to update AI-generated preference:", error);
    }
  }, [user]);

  return {
    browseShowNsfw,
    browseShowAiGenerated,
    updateNsfwFilter,
    updateAiFilter
  };
};