import { useState, useCallback } from "react";
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

  const updateNsfwFilter = useCallback(async (checked: boolean) => {
    setBrowseShowNsfw(checked);

    if (user) {
      try {
        await apiRequest("PATCH", `/api/users/${user.id}/preferences`, {
          showNsfw: checked
        });
        // Update the user data in the cache
        queryClient.setQueryData(["/api/user"], (oldData: any) => ({
          ...oldData,
          showNsfw: checked
        }));
      } catch (error) {
        console.error("Failed to update NSFW preference:", error);
      }
    }

    // Invalidate all queries that might be affected by filter changes
    queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
  }, [user]);

  const updateAiFilter = useCallback(async (checked: boolean) => {
    setBrowseShowAiGenerated(checked);

    if (user) {
      try {
        await apiRequest("PATCH", `/api/users/${user.id}/preferences`, {
          showAiGenerated: checked
        });
        // Update the user data in the cache
        queryClient.setQueryData(["/api/user"], (oldData: any) => ({
          ...oldData,
          showAiGenerated: checked
        }));
      } catch (error) {
        console.error("Failed to update AI-generated preference:", error);
      }
    }

    // Invalidate all queries that might be affected by filter changes
    queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
  }, [user]);

  return {
    browseShowNsfw,
    browseShowAiGenerated,
    updateNsfwFilter,
    updateAiFilter
  };
};