import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import type { Artwork } from "@shared/schema";

interface ArtCardProps {
  artwork: Artwork;
}

export function ArtCard({ artwork }: ArtCardProps) {
  return (
    <Card className="overflow-hidden bg-[#2D2B55] border-[#BD00FF] hover:shadow-[0_0_15px_rgba(189,0,255,0.3)] transition-shadow">
      <CardHeader className="p-0">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white">{artwork.title}</h3>
          <div className="flex gap-1">
            {artwork.isNsfw && (
              <Badge variant="destructive">NSFW</Badge>
            )}
            {artwork.isAiGenerated && (
              <Badge variant="secondary">AI</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-2">{artwork.description}</p>
        <div className="flex flex-wrap gap-1">
          {artwork.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[#00F9FF]">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 bg-[#1A1A2E]">
        <Button variant="ghost" size="sm" className="text-[#FF1B8D]">
          <Heart className="h-4 w-4 mr-1" />
          Like
        </Button>
        <Button variant="ghost" size="sm" className="text-[#00F9FF]">
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
}
