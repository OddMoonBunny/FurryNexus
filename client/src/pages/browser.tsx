import { useQuery } from "@tanstack/react-query";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Star, Clock, Heart } from "lucide-react";
import type { Artwork, Gallery } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Loading } from "@/components/ui/loading";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Browser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNsfw, setShowNsfw] = useState(false);
  const [showAiGenerated, setShowAiGenerated] = useState(true);
  const { user } = useAuth();

  // Load preferences from localStorage
  useEffect(() => {
    const storedNsfw = localStorage.getItem("showNsfw");
    const storedAiGenerated = localStorage.getItem("showAiGenerated");

    if (storedNsfw !== null) {
      setShowNsfw(storedNsfw === "true");
    }
    if (storedAiGenerated !== null) {
      setShowAiGenerated(storedAiGenerated === "true");
    }
  }, []);

  // Fetch all artworks with filters
  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks", { isNsfw: showNsfw, isAiGenerated: showAiGenerated }],
  });

  // Fetch featured artworks
  const { data: featuredArtworks, isLoading: isLoadingFeatured } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks/featured"],
  });

  // Fetch all public galleries
  const { data: galleries, isLoading: isLoadingGalleries } = useQuery<Gallery[]>({
    queryKey: ["/api/galleries"],
  });

  // Filter artworks based on search term
  const filteredArtworks = artworks?.filter(artwork => 
    artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="py-12 text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Discover Amazing Art</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore a vast collection of original artwork from talented artists around the world
          </p>
          <div className="relative w-full max-w-xl mx-auto mt-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10 bg-[#22223A] border-[#32325D] text-white"
              placeholder="Search artworks by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="bg-[#22223A] border-b border-[#32325D] w-full justify-start mb-6 rounded-none">
            <TabsTrigger
              value="featured"
              className="data-[state=active]:bg-[#1A1A2E] data-[state=active]:border-b-2 data-[state=active]:border-[#FF1B8D] data-[state=active]:rounded-none data-[state=active]:shadow-none"
            >
              <Star className="w-4 h-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="data-[state=active]:bg-[#1A1A2E] data-[state=active]:border-b-2 data-[state=active]:border-[#FF1B8D] data-[state=active]:rounded-none data-[state=active]:shadow-none"
            >
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger
              value="galleries"
              className="data-[state=active]:bg-[#1A1A2E] data-[state=active]:border-b-2 data-[state=active]:border-[#FF1B8D] data-[state=active]:rounded-none data-[state=active]:shadow-none"
            >
              <Heart className="w-4 h-4 mr-2" />
              Galleries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="featured">
            {isLoadingFeatured ? (
              <div className="flex justify-center py-12">
                <Loading size="lg" />
              </div>
            ) : !featuredArtworks?.length ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-white mb-2">No featured artworks</h2>
                <p className="text-gray-400">Check back soon for featured content</p>
              </div>
            ) : (
              <ArtGrid artworks={featuredArtworks} />
            )}
          </TabsContent>

          <TabsContent value="recent">
            {isLoadingArtworks ? (
              <div className="flex justify-center py-12">
                <Loading size="lg" />
              </div>
            ) : !filteredArtworks?.length ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-white mb-2">No artworks found</h2>
                <p className="text-gray-400">Try adjusting your search terms or content filters</p>
              </div>
            ) : (
              <ArtGrid artworks={filteredArtworks} />
            )}
          </TabsContent>

          <TabsContent value="galleries">
            {isLoadingGalleries ? (
              <div className="flex justify-center py-12">
                <Loading size="lg" />
              </div>
            ) : !galleries?.length ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-white mb-2">No galleries found</h2>
                <p className="text-gray-400">Check back soon for new galleries</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((gallery) => (
                  <Link key={gallery.id} href={`/gallery/${gallery.id}`}>
                    <Card className="cursor-pointer bg-[#2D2B55] border-[#BD00FF] hover:shadow-[0_0_15px_rgba(189,0,255,0.3)] transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center justify-between">
                          {gallery.name}
                          {gallery.isFeatured && (
                            <Badge variant="outline" className="border-[#FF1B8D] text-[#FF1B8D]">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
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