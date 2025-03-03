import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Heart, MessageSquare, MoreVertical, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { Artwork } from "@shared/schema";
import { useState } from "react";
import { ArtworkActions } from "./artwork-actions";
import { useAuth } from "@/hooks/use-auth";

interface ArtCardProps {
  artwork: Artwork;
  onAddToGallery?: () => void;
  mode?: "gallery" | "den";
}

export function ArtCard({ artwork, onAddToGallery, mode = "gallery" }: ArtCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  return (
    <div 
      className="group relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="bg-[#2D2B55] border-[#BD00FF] hover:border-[#FF1B8D] transition-all duration-300 cursor-pointer overflow-hidden h-full">
        <div className="relative h-full">
          <img 
            src={artwork.imageUrl} 
            alt={artwork.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Content badges */}
          <div className="absolute top-2 left-2 flex gap-2 z-10">
            {artwork.isNsfw && (
              <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-sm">
                <AlertTriangle className="h-3 w-3 mr-1" />
                NSFW
              </Badge>
            )}
            {artwork.isAiGenerated && (
              <Badge className="bg-purple-500/90 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            )}
          </div>

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 flex flex-col ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex-1 p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{artwork.title}</h3>
                  {artwork.description && (
                    <p className="text-sm text-gray-200 line-clamp-2">{artwork.description}</p>
                  )}
                </div>
                <ArtworkActions 
                  artwork={artwork} 
                  isOwner={user?.id === artwork.userId}
                  onAddToGallery={onAddToGallery}
                >
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </ArtworkActions>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="border-t border-white/20 bg-black/40 p-2">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 hover:text-white flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{artwork.likeCount}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20 hover:text-white flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">0</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Link wrapper for navigation */}
      <Link 
        to={`/artwork/${artwork.id}`} 
        className="absolute inset-0 z-[1]"
        onClick={(e) => {
          // Prevent navigation if clicking on action buttons
          if ((e.target as HTMLElement).closest('[data-sidebar]')) {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
}