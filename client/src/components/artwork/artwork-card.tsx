
import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArtworkActions } from "./artwork-actions";
import { GalleryArtworkManager } from "../gallery/gallery-artwork-manager";
import type { Artwork } from "@shared/schema";

interface ArtworkCardProps {
  artwork: Artwork;
  currentUserId?: number;
}

export function ArtworkCard({ artwork, currentUserId }: ArtworkCardProps) {
  const [isManageGalleryOpen, setIsManageGalleryOpen] = useState(false);
  const isOwner = currentUserId !== undefined && artwork.userId === currentUserId;

  return (
    <>
      <ArtworkActions 
        artwork={artwork}
        isOwner={isOwner}
        onAddToGallery={() => setIsManageGalleryOpen(true)}
      >
        <div className="rounded-lg overflow-hidden border border-[#BD00FF]/50 bg-[#2D2B55] transition-all hover:shadow-lg hover:shadow-[#BD00FF]/20 group">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 flex gap-1.5">
              {artwork.isNsfw && (
                <Badge className="bg-red-500 hover:bg-red-600">NSFW</Badge>
              )}
              {artwork.isAiGenerated && (
                <Badge className="bg-purple-500 hover:bg-purple-600">AI</Badge>
              )}
            </div>
          </div>
          <div className="p-3">
            <Link 
              to={`/artwork/${artwork.id}`} 
              className="text-white hover:text-[#BD00FF] transition-colors"
            >
              <h3 className="font-medium text-lg truncate">{artwork.title}</h3>
            </Link>
            <Link 
              to={`/user/${artwork.userId}`} 
              className="text-gray-400 hover:text-[#BD00FF] text-sm transition-colors"
            >
              @{artwork.userId}
            </Link>
          </div>
        </div>
      </ArtworkActions>
      
      {isManageGalleryOpen && (
        <GalleryArtworkManager 
          galleryId=""  // This would need to be set by a gallery selector dialog
          open={isManageGalleryOpen}
          onOpenChange={setIsManageGalleryOpen}
        />
      )}
    </>
  );
}
