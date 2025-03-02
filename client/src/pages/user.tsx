import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { User, Artwork, Gallery } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Grid2X2, List, Search, Heart, MessageSquare, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type ViewMode = "grid" | "list";
type SortOption = "recent" | "popular" | "likes";

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
  });

  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: [`/api/users/${id}/artworks`],
    enabled: !!user,
  });

  const { data: galleries } = useQuery<Gallery[]>({
    queryKey: [`/api/users/${id}/galleries`],
    enabled: !!user,
  });

  // Filter artworks based on search term
  const filteredArtworks = artworks?.filter(artwork => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      artwork.title.toLowerCase().includes(searchLower) ||
      artwork.description?.toLowerCase().includes(searchLower) ||
      artwork.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Sort artworks based on selected option
  const sortedArtworks = [...(filteredArtworks || [])].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "popular":
        // TODO: Implement popularity sorting
        return 0;
      case "likes":
        // TODO: Implement likes sorting
        return 0;
      default:
        return 0;
    }
  });

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading user profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center">User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-24">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <Card className="bg-[#2D2B55] border-[#BD00FF] mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl text-white">
                {user.displayName || user.username}
              </CardTitle>
              {user.bio && (
                <p className="text-gray-200 mt-2">{user.bio}</p>
              )}
            </div>
            {currentUser && currentUser.id !== user.id && (
              <Button 
                variant="outline" 
                className="bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
                // TODO: Implement follow functionality
                onClick={() => {}}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Follow
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm text-gray-400">
              <div>
                <span className="text-white font-medium">0</span> Followers
              </div>
              <div>
                <span className="text-white font-medium">0</span> Following
              </div>
              <div>
                <span className="text-white font-medium">{artworks?.length || 0}</span> Artworks
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="artworks">
          <TabsList className="bg-[#22223A] border-b border-[#32325D] w-full justify-start mb-6 rounded-none">
            <TabsTrigger
              value="artworks"
              className="data-[state=active]:bg-[#1A1A2E] data-[state=active]:border-b-2 data-[state=active]:border-[#FF1B8D] data-[state=active]:rounded-none"
            >
              Artworks
            </TabsTrigger>
            <TabsTrigger
              value="galleries"
              className="data-[state=active]:bg-[#1A1A2E] data-[state=active]:border-b-2 data-[state=active]:border-[#FF1B8D] data-[state=active]:rounded-none"
            >
              Galleries
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="data-[state=active]:bg-[#1A1A2E] data-[state=active]:border-b-2 data-[state=active]:border-[#FF1B8D] data-[state=active]:rounded-none"
            >
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artworks">
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    className="pl-10 bg-[#22223A] border-[#32325D] text-white"
                    placeholder="Search artworks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`${viewMode === 'grid' ? 'bg-[#BD00FF]/20' : 'bg-[#1A1A2E]'} border-[#BD00FF]`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`${viewMode === 'list' ? 'bg-[#BD00FF]/20' : 'bg-[#1A1A2E]'} border-[#BD00FF]`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Gallery */}
              {viewMode === 'grid' ? (
                <ArtGrid artworks={sortedArtworks} />
              ) : (
                <div className="space-y-4">
                  {sortedArtworks.map((artwork) => (
                    <Card key={artwork.id} className="bg-[#2D2B55] border-[#BD00FF]">
                      <div className="flex">
                        <div className="w-48 h-48 overflow-hidden">
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <h3 className="text-xl font-medium text-white mb-2">{artwork.title}</h3>
                          <p className="text-gray-300 mb-4">{artwork.description}</p>
                          <div className="flex gap-2 mb-4">
                            {artwork.tags.map((tag) => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-400">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#FF1B8D]">
                              <Heart className="h-4 w-4 mr-1" />
                              0 Likes
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#00F9FF]">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              0 Comments
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="galleries">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries?.map((gallery) => (
                <Card key={gallery.id} className="bg-[#2D2B55] border-[#BD00FF]">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">{gallery.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{gallery.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="text-center py-12 text-gray-400">
              Favorites coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}