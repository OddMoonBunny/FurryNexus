import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, Share2 } from "lucide-react";
import { Link } from "wouter";
import type { Artwork } from "@shared/schema";

interface ArtCardProps {
  artwork: Artwork;
}

export function ArtCard({ artwork }: ArtCardProps) {
  return (
    <Link to={`/artwork/${artwork.id}`}>
      <Card className="bg-[#2D2B55] border-[#BD00FF] hover:border-[#FF1B8D] transition-colors cursor-pointer overflow-hidden h-full flex flex-col">
        <div className="aspect-video bg-[#1A1A2E] overflow-hidden">
          <img 
            src={artwork.imageUrl} 
            alt={artwork.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4 flex-grow">
          <h3 className="text-lg font-semibold text-white truncate">{artwork.title}</h3>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex flex-wrap gap-2">
            {artwork.isNsfw && (
              <Badge variant="outline" className="border-[#FF1B8D] text-[#FF1B8D]">
                NSFW
              </Badge>
            )}
            {artwork.isAiGenerated && (
              <Badge variant="outline" className="border-[#00F9FF] text-[#00F9FF]">
                AI Generated
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}