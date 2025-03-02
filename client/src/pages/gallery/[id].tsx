
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Artwork, Gallery, User } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import ArtworkGrid from "@/components/artwork/artwork-grid";

export default function GalleryPage() {
  const { id } = useParams<{ id: string }>();
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  // Fetch gallery data
  const { data: gallery, isLoading: galleryLoading } = useQuery<Gallery>({
    queryKey: [`/api/galleries/${id}`],
    queryFn: async () => {
      return apiRequest("GET", `/api/galleries/${id}`);
    },
    enabled: !!id,
  });

  // Fetch gallery owner data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: [`/api/users/${gallery?.userId}`],
    queryFn: async () => {
      return apiRequest("GET", `/api/users/${gallery?.userId}`);
    },
    enabled: !!gallery?.userId,
  });

  // Fetch artworks in the gallery
  const { data: galleryArtworks, isLoading: artworksLoading } = useQuery<Artwork[]>({
    queryKey: [`/api/galleries/${id}/artworks`],
    queryFn: async () => {
      return apiRequest("GET", `/api/galleries/${id}/artworks`);
    },
    enabled: !!id,
  });

  // Fetch all of the user's artworks
  const { data: userArtworks, isLoading: userArtworksLoading } = useQuery<Artwork[]>({
    queryKey: [`/api/users/${gallery?.userId}/artworks`],
    queryFn: async () => {
      return apiRequest("GET", `/api/users/${gallery?.userId}/artworks`);
    },
    enabled: !!gallery?.userId,
  });

  useEffect(() => {
    if (galleryArtworks) {
      setArtworks(galleryArtworks);
    }
  }, [galleryArtworks]);

  if (galleryLoading || userLoading || artworksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl text-white font-bold">Gallery not found</h1>
        <p className="text-gray-400">The gallery you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FF1B8D] mb-2">{gallery.name}</h1>
        <div className="flex items-center text-gray-400 mb-4">
          <span>Curated by {user?.username || "Unknown User"}</span>
        </div>
        {gallery.description && (
          <p className="text-white mb-6">{gallery.description}</p>
        )}
      </div>

      <Tabs defaultValue="gallery" className="space-y-6">
        <TabsList className="bg-[#1E1E3F] border-[#BD00FF]">
          <TabsTrigger value="gallery" className="data-[state=active]:bg-[#BD00FF]">
            Gallery Artworks
          </TabsTrigger>
          <TabsTrigger value="user" className="data-[state=active]:bg-[#BD00FF]">
            All User Artworks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          {artworksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="md" />
            </div>
          ) : galleryArtworks?.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-white mb-2">No artworks in this gallery</h2>
              <p className="text-gray-400">The curator hasn't added any artwork yet.</p>
            </div>
          ) : (
            <ArtworkGrid artworks={galleryArtworks || []} />
          )}
        </TabsContent>

        <TabsContent value="user">
          {userArtworksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="md" />
            </div>
          ) : userArtworks?.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-white mb-2">No artworks found</h2>
              <p className="text-gray-400">This user hasn't uploaded any artwork yet.</p>
            </div>
          ) : (
            <ArtworkGrid artworks={userArtworks || []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
