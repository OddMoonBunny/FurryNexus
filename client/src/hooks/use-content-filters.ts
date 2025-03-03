import { useAuth } from "./use-auth";

export function useContentFilters() {
  const { user } = useAuth();

  // Always return true to show all content
  return {
    browseShowNsfw: true,
    browseShowAiGenerated: true,
    // Keep the update functions but make them no-ops
    updateNsfwFilter: () => {},
    updateAiFilter: () => {}
  };
}