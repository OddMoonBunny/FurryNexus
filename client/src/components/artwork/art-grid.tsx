import { ArtCard } from "./art-card";
import type { Artwork } from "@shared/schema";

interface ArtGridProps {
  artworks: Artwork[];
}

export function ArtGrid({ artworks }: ArtGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {artworks.map((artwork) => (
        <ArtCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
