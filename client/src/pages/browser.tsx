import { useQuery } from "@tanstack/react-query";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Artwork, Gallery } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function Browser() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks"],
  });

  const { data: galleries, isLoading: isLoadingGalleries } = useQuery<Gallery[]>({
    queryKey: ["/api/galleries"],
  });

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-16">
      <div className="container mx-auto px-4">
        <div className="py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Browse</h1>

            <div className="relative w-full md:w-96">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#2D2B55] border-[#BD00FF] text-white"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <Tabs defaultValue="artworks" className="w-full">
            <TabsList>
              <TabsTrigger value="artworks">Artworks</TabsTrigger>
              <TabsTrigger value="galleries">Galleries</TabsTrigger>
            </TabsList>

            <TabsContent value="artworks">
              {isLoadingArtworks ? (
                <div className="text-center py-12">
                  <div className="animate-pulse text-[#00F9FF]">Loading artworks...</div>
                </div>
              ) : !artworks?.length ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-white mb-2">No artworks found</h2>
                  <p className="text-gray-400">Try adjusting your search terms</p>
                </div>
              ) : (
                <ArtGrid artworks={artworks} />
              )}
            </TabsContent>
            
            <TabsContent value="galleries">
              {isLoadingGalleries ? (
                <div className="text-center py-12">
                  <div className="animate-pulse text-[#00F9FF]">Loading galleries...</div>
                </div>
              ) : !galleries?.length ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-white mb-2">No galleries found</h2>
                  <p className="text-gray-400">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {galleries.map((gallery) => (
                    <Link key={gallery.id} href={`/gallery/${gallery.id}`}>
                      <Card className="cursor-pointer bg-[#2D2B55] border-[#BD00FF] hover:shadow-[0_0_15px_rgba(189,0,255,0.3)] transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-xl text-white">{gallery.name}</CardTitle>
                        </CardHeader>
                        {gallery.description && (
                          <CardContent>
                            <p className="text-gray-300 line-clamp-2">{gallery.description}</p>
                          </CardContent>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="galleries">
              {isLoadingGalleries ? (
                <div className="text-center py-12">
                  <div className="animate-pulse text-[#00F9FF]">Loading galleries...</div>
                </div>
              ) : !galleries?.length ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-white mb-2">No galleries found</h2>
                  <p className="text-gray-400">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleries.map((gallery) => (
                    <Link key={gallery.id} href={`/gallery/${gallery.id}`}>
                      <Card className="bg-[#2D2B55] border-[#BD00FF] cursor-pointer hover:border-[#FF1B8D] transition-colors">
                        <CardHeader>
                          <CardTitle className="text-xl text-white">{gallery.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300">{gallery.description}</p>
                          <div className="mt-4">
                            <div className="text-sm text-gray-400">
                              View gallery artworks →
                            </div>
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
    </div>
  );
}