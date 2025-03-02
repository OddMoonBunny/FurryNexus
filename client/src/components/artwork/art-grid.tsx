import { ArtworkDetail } from "./artwork-detail";
import type { Artwork } from "@shared/schema";

interface ArtGridProps {
  artworks: Artwork[];
  mode?: "gallery" | "den";
}

export function ArtGrid({ artworks, mode = "gallery" }: ArtGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artworks.map((artwork) => (
        <ArtworkDetail 
          key={artwork.id} 
          artwork={artwork} 
          mode={mode}
        />
      ))}
    </div>
  );
}