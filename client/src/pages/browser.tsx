import { useQuery } from "@tanstack/react-query";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import type { Artwork, Gallery } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgeGate } from "@/components/age-gate";
import { useLocation } from "wouter";

export default function Browser() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Check both localStorage and sessionStorage for age verification
  const [isAgeVerified, setIsAgeVerified] = useState(() => {
    return localStorage.getItem('age-verified') === 'true' || 
           sessionStorage.getItem('age-verified') === 'true';
  });

  useEffect(() => {
    // Check age verification on mount
    if (!isAgeVerified) {
      setLocation('/age-gate');
    }
  }, [isAgeVerified, setLocation]);

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks"],
  });

  const { data: galleries, isLoading: isLoadingGalleries } = useQuery<Gallery[]>({
    queryKey: ["/api/galleries"],
  });

  // Filter artworks based on search term only
  const filteredArtworks = artworks?.filter(artwork => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        artwork.title.toLowerCase().includes(searchLower) ||
        artwork.description?.toLowerCase().includes(searchLower) ||
        artwork.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  if (!isAgeVerified) {
    return <AgeGate />;
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-16">
      <div className="container mx-auto px-4">
        <div className="py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Browse</h1>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                className="pl-10 bg-[#22223A] border-[#32325D] text-white"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="artworks" className="w-full">
            <TabsList className="bg-[#22223A] border-b border-[#32325D] w-full justify-start mb-6 rounded-none">
              <TabsTrigger 
                value="artworks"
                className="data-[state=active]:bg-[#1A1A2E] data-[state=active]:border-b-2 data-[state=active]:border-[#FF1B8D] data-[state=active]:rounded-none data-[state=active]:shadow-none"
              >
                Artworks
              </TabsTrigger>
              <TabsTrigger 
                value="galleries"
                className="data-[state=active]:bg-[#1A1A2E] data-[state=active]:border-b-2 data-[state=active]:border-[#FF1B8D] data-[state=active]:rounded-none data-[state=active]:shadow-none"
              >
                Galleries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="artworks">
              {isLoadingArtworks ? (
                <div className="text-center py-12">
                  <div className="animate-pulse text-[#00F9FF]">Loading artworks...</div>
                </div>
              ) : !filteredArtworks?.length ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-white mb-2">No artworks found</h2>
                  <p className="text-gray-400">Try adjusting your search terms</p>
                </div>
              ) : (
                <ArtGrid artworks={filteredArtworks} />
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
                  <p className="text-gray-400">Create your first gallery to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}