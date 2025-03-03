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
}

export function ArtCard({ artwork, onAddToGallery }: ArtCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="bg-[#2D2B55] border-[#BD00FF] hover:border-[#FF1B8D] transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col relative">
        {/* Increased height for larger cards */}
        <div className="aspect-[4/5] bg-[#1A1A2E] overflow-hidden relative">
          <img 
            src={artwork.imageUrl} 
            alt={artwork.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Content badges - increased size */}
          <div className="absolute top-4 left-4 flex gap-3 z-10">
            {artwork.isNsfw && (
              <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-sm text-base py-1.5 px-3">
                <AlertTriangle className="h-4 w-4 mr-2" />
                NSFW
              </Badge>
            )}
            {artwork.isAiGenerated && (
              <Badge className="bg-purple-500/90 backdrop-blur-sm text-base py-1.5 px-3">
                <Sparkles className="h-4 w-4 mr-2" />
                AI
              </Badge>
            )}
          </div>

          {/* Hover Overlay - increased padding and text sizes */}
          <div className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300 flex flex-col justify-between p-6 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white truncate mb-2">{artwork.title}</h3>
                {artwork.description && (
                  <p className="text-base text-gray-200 line-clamp-3">{artwork.description}</p>
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
                  className="bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10 p-0"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </ArtworkActions>
            </div>

            {/* Bottom actions - increased size */}
            <div className="flex gap-4 mt-auto">
              <Button 
                variant="ghost" 
                size="lg" 
                className="text-white hover:bg-white/20 hover:text-white flex gap-3 text-lg"
              >
                <Heart className="h-6 w-6" />
                {artwork.likeCount}
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                className="text-white hover:bg-white/20 hover:text-white flex gap-3 text-lg"
              >
                <MessageSquare className="h-6 w-6" />
                0
              </Button>
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