import React from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User, Artwork, Gallery } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Loading } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function UserPage() {
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
  });

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: [`/api/users/${id}/artworks`],
    enabled: !!user,
  });

  const { data: galleries, isLoading: isLoadingGalleries } = useQuery<Gallery[]>({
    queryKey: [`/api/users/${id}/galleries`],
    enabled: !!user,
  });

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-24">
      <div className="container mx-auto px-4">
        <Card className="bg-[#2D2B55] border-[#BD00FF] mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-white flex items-center gap-3">
              {user.displayName || user.username}
              {user.isAdmin && (
                <Badge variant="outline" className="border-[#00F9FF] text-[#00F9FF] text-sm">
                  Admin
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          {user.bio && (
            <CardContent>
              <p className="text-gray-200">{user.bio}</p>
            </CardContent>
          )}
        </Card>

        <Tabs defaultValue="artworks" className="space-y-6">
          <TabsList className="bg-[#1A1A2E] border-[#BD00FF]">
            <TabsTrigger value="artworks" className="data-[state=active]:bg-[#BD00FF]">
              Artworks
            </TabsTrigger>
            <TabsTrigger value="galleries" className="data-[state=active]:bg-[#BD00FF]">
              Galleries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artworks">
            {isLoadingArtworks ? (
              <div className="flex justify-center py-12">
                <Loading size="lg" />
              </div>
            ) : !artworks?.length ? (
              <div className="text-center py-12 text-gray-400">
                No artworks yet
              </div>
            ) : (
              <ArtGrid artworks={artworks} />
            )}
          </TabsContent>

          <TabsContent value="galleries">
            {isLoadingGalleries ? (
              <div className="flex justify-center py-12">
                <Loading size="lg" />
              </div>
            ) : !galleries?.length ? (
              <div className="text-center py-12 text-gray-400">
                No galleries yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((gallery) => (
                  <Link key={gallery.id} href={`/gallery/${gallery.id}`}>
                    <Card className="bg-[#2D2B55] border-[#BD00FF] hover:border-[#FF1B8D] transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-xl text-white">{gallery.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {gallery.description && (
                          <p className="text-gray-300 line-clamp-2">{gallery.description}</p>
                        )}
                        <div className="text-sm text-gray-400">
                          Created {format(new Date(gallery.createdAt), 'MMM d, yyyy')}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}