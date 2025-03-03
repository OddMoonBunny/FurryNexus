import { ArtCard } from "./art-card";
import type { Artwork } from "@shared/schema";

interface ArtGridProps {
  artworks: Artwork[];
  mode?: "gallery" | "den";
}

export function ArtGrid({ artworks, mode = "gallery" }: ArtGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {artworks.map((artwork) => (
        <div key={artwork.id} className="aspect-[4/3]">
          <ArtCard 
            artwork={artwork} 
            mode={mode}
          />
        </div>
      ))}
    </div>
  );
}