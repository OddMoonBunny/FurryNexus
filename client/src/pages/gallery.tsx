import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Artwork, Gallery } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function GalleryPage() {
  const { id } = useParams<{ id: string }>();
  const [showNsfw, setShowNsfw] = useState(false);
  const [showAiGenerated, setShowAiGenerated] = useState(true);

  const { data: gallery, isLoading: isLoadingGallery } = useQuery<Gallery>({
    queryKey: [`/api/galleries/${id}`],
  });

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: [`/api/galleries/${id}/artworks`, { isNsfw: showNsfw, isAiGenerated: showAiGenerated }],
    enabled: !!gallery,
  });

  if (isLoadingGallery || isLoadingArtworks) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading gallery...</div>
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
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ArtGrid } from "@/components/artwork/art-grid";

export default function GalleryPage() {
  const { id } = useParams();
  const galleryId = Number(id);

  // Fetch gallery details
  const { data: gallery, isLoading: galleryLoading } = useQuery({
    queryKey: ["gallery", galleryId],
    queryFn: async () => {
      const response = await fetch(`/api/galleries/${galleryId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gallery");
      }
      return response.json();
    },
    enabled: !!galleryId,
  });

  // Fetch gallery artworks
  const { data: artworks, isLoading: artworksLoading } = useQuery({
    queryKey: ["gallery-artworks", galleryId],
    queryFn: async () => {
      const response = await fetch(`/api/galleries/${galleryId}/artworks`);
      if (!response.ok) {
        throw new Error("Failed to fetch gallery artworks");
      }
      return response.json();
    },
    enabled: !!galleryId,
  });

  const isLoading = galleryLoading || artworksLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!gallery) {
    return <div className="text-center text-white">Gallery not found</div>;
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{gallery.name}</h1>
        {gallery.description && (
          <p className="mt-2 text-gray-300">{gallery.description}</p>
        )}
      </div>

      {artworks && artworks.length > 0 ? (
        <ArtGrid artworks={artworks} />
      ) : (
        <div className="text-center text-gray-400 py-10">
          This gallery is empty
        </div>
      )}
    </div>
  );
}
