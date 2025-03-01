import { useQuery } from "@tanstack/react-query";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { Artwork } from "@shared/schema";

export default function Gallery() {
  const [showNsfw, setShowNsfw] = useState(false);
  const [showAiGenerated, setShowAiGenerated] = useState(true);

  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks", { isNsfw: showNsfw, isAiGenerated: showAiGenerated }],
  });

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-16">
      <div className="container mx-auto px-4">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white mb-6">Gallery</h1>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center space-x-2">
              <Switch
                id="nsfw"
                checked={showNsfw}
                onCheckedChange={setShowNsfw}
              />
              <Label htmlFor="nsfw">Show NSFW</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="ai"
                checked={showAiGenerated}
                onCheckedChange={setShowAiGenerated}
              />
              <Label htmlFor="ai">Show AI Generated</Label>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">Loading artworks...</div>
            </div>
          ) : (
            <ArtGrid artworks={artworks || []} />
          )}
        </div>
      </div>
    </div>
  );
}
