import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Artwork, Gallery } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Loader2 } from "lucide-react";

export default function GalleryPage() {
  const { id } = useParams<{ id: string }>();

  const { data: gallery, isLoading: isLoadingGallery } = useQuery<Gallery>({
    queryKey: [`/api/galleries/${id}`],
    queryFn: async () => {
      console.log(`Fetching gallery with ID: ${id}`);
      const response = await fetch(`/api/galleries/${id}`);
      if (!response.ok) {
        console.error(`Failed to fetch gallery: ${response.status}`);
        throw new Error("Failed to fetch gallery");
      }
      const data = await response.json();
      console.log("Gallery data:", data);
      return data;
    },
    enabled: !!id,
  });

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: [`/api/galleries/${id}/artworks`],
    queryFn: async () => {
      console.log(`Fetching gallery artworks with ID: ${id}`);
      const response = await fetch(`/api/galleries/${id}/artworks`);
      if (!response.ok) {
        console.error(`Failed to fetch gallery artworks: ${response.status}`);
        throw new Error("Failed to fetch gallery artworks");
      }
      const data = await response.json();
      console.log("Gallery artworks data:", data);
      return data;
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