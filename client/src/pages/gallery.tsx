import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Artwork, Gallery } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function GalleryPage() {
  const { id } = useParams<{ id: string }>();
  const [showNsfw, setShowNsfw] = useState(false);
  const [showAiGenerated, setShowAiGenerated] = useState(true);
  const galleryId = Number(id);

  const { data: gallery, isLoading: isLoadingGallery } = useQuery<Gallery>({
    queryKey: [`/api/galleries/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/galleries/${galleryId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gallery");
      }
      return response.json();
    },
    enabled: !!galleryId,
  });

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: [`/api/galleries/${id}/artworks`, { isNsfw: showNsfw, isAiGenerated: showAiGenerated }],
    queryFn: async () => {
      const response = await fetch(`/api/galleries/${id}/artworks`);
      if (!response.ok) {
        throw new Error("Failed to fetch gallery artworks");
      }
      return response.json();
    },
    enabled: !!gallery,
  });

  if (isLoadingGallery || isLoadingArtworks) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
            <div className="mt-4">Loading gallery...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center">Gallery not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-24">
      <div className="container mx-auto px-4">
        <Card className="bg-[#2D2B55] border-[#BD00FF] mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-white">{gallery.name}</CardTitle>
          </CardHeader>
          {gallery.description && (
            <CardContent>
              <p className="text-gray-200">{gallery.description}</p>
            </CardContent>
          )}
        </Card>
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
        {artworks?.length ? (
          <ArtGrid artworks={artworks} />
        ) : (
          <div className="text-center py-12 text-gray-400">
            No artworks in this gallery yet
          </div>
        )}
      </div>
    </div>
  );
}