import { ArtCard } from "./art-card";
import type { Artwork } from "@shared/schema";

interface ArtGridProps {
  artworks: Artwork[];
  mode?: "gallery" | "den";
}

export function ArtGrid({ artworks, mode = "gallery" }: ArtGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {artworks.map((artwork) => (
        <div key={artwork.id} className="aspect-[16/10]">
          <ArtCard 
            artwork={artwork} 
            mode={mode}
          />
        </div>
      ))}
    </div>
  );
}