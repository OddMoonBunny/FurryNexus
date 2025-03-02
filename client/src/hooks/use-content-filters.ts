import { useState, useCallback } from "react";
import { queryClient } from "@/lib/queryClient";

export const useContentFilters = () => {
  const [browseShowNsfw, setBrowseShowNsfw] = useState(() => {
    const stored = localStorage.getItem('browseShowNsfw');
    return stored ? stored === "true" : false;
  });

  const [browseShowAiGenerated, setBrowseShowAiGenerated] = useState(() => {
    const stored = localStorage.getItem('browseShowAiGenerated');
    return stored ? stored === "true" : true;
  });

  const updateNsfwFilter = useCallback((checked: boolean) => {
    setBrowseShowNsfw(checked);
    localStorage.setItem('browseShowNsfw', checked.toString());
    // Invalidate all queries that might be affected by filter changes
    queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
  }, []);

  const updateAiFilter = useCallback((checked: boolean) => {
    setBrowseShowAiGenerated(checked);
    localStorage.setItem('browseShowAiGenerated', checked.toString());
    // Invalidate all queries that might be affected by filter changes
    queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
  }, []);

  return {
    browseShowNsfw,
    browseShowAiGenerated,
    updateNsfwFilter,
    updateAiFilter
  };
};