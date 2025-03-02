
import React from 'react';
import { Link } from 'react-router-dom';

type Artwork = {
  id: number;
  title: string;
  imageUrl: string;
  isNsfw: boolean;
  userId: number;
};

interface ArtworkGridProps {
  artworks: Artwork[];
  showNsfw?: boolean;
}

export function ArtworkGrid({ artworks, showNsfw = false }: ArtworkGridProps) {
  const filteredArtworks = showNsfw 
    ? artworks 
    : artworks.filter(artwork => !artwork.isNsfw);

  if (filteredArtworks.length === 0) {
    return <div className="text-center py-10">No artworks found</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredArtworks.map((artwork) => (
        <Link 
          key={artwork.id} 
          to={`/artwork/${artwork.id}`}
          className="overflow-hidden rounded-lg border bg-card shadow"
        >
          <div className="aspect-square relative overflow-hidden">
            <img 
              src={artwork.imageUrl} 
              alt={artwork.title}
              className="h-full w-full object-cover transition-all hover:scale-105"
            />
          </div>
          <div className="p-2">
            <h3 className="font-medium truncate">{artwork.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ArtworkGrid;
