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
          <div className="absolute top-4 left-4 flex gap-3 z-10">
            {artwork.isNsfw && (
              <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-sm text-lg py-2 px-4">
                <AlertTriangle className="h-5 w-5 mr-2" />
                NSFW
              </Badge>
            )}
            {artwork.isAiGenerated && (
              <Badge className="bg-purple-500/90 backdrop-blur-sm text-lg py-2 px-4">
                <Sparkles className="h-5 w-5 mr-2" />
                AI
              </Badge>
            )}
          </div>

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 flex flex-col ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">{artwork.title}</h3>
                  {artwork.description && (
                    <p className="text-lg text-gray-200 line-clamp-3">{artwork.description}</p>
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
                    className="bg-black/40 hover:bg-black/60 text-white rounded-full h-12 w-12 p-0"
                  >
                    <MoreVertical className="h-6 w-6" />
                  </Button>
                </ArtworkActions>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="border-t border-white/20 bg-black/40 p-4">
              <div className="flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="text-white hover:bg-white/20 hover:text-white flex items-center gap-3"
                >
                  <Heart className="h-6 w-6" />
                  <span className="text-lg">{artwork.likeCount}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="text-white hover:bg-white/20 hover:text-white flex items-center gap-3"
                >
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-lg">0</span>
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