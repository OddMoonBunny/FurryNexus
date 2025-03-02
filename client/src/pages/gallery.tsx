import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Artwork, Gallery, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Grid2X2, List, Search, Heart, MessageSquare, ExternalLink, AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

type ViewMode = "grid" | "list";
type SortOption = "recent" | "popular" | "likes";

export default function GalleryPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
  });

  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: [`/api/users/${id}/artworks`],
    enabled: !!user,
  });

  const { data: galleries } = useQuery<Gallery[]>({
    queryKey: [`/api/users/${id}/galleries`],
    enabled: !!user,
  });

  const filteredAndSortedArtworks = artworks
    ?.filter(artwork => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        artwork.title.toLowerCase().includes(searchLower) ||
        artwork.description?.toLowerCase().includes(searchLower) ||
        artwork.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popular":
          return b.viewCount - a.viewCount;
        case "likes":
          return b.likeCount - a.likeCount;
        default:
          return 0;
      }
    });

  if (isLoadingUser || isLoadingArtworks) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading gallery...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center">Gallery not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      {/* Banner Section */}
      <div
        className="h-48 bg-gradient-to-r from-[#1A1A2E] via-[#BD00FF]/30 to-[#1A1A2E] relative"
      >
        {user.bannerImage && (
          <img
            src={user.bannerImage}
            alt="Profile Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        {/* Profile Section */}
        <Card className="bg-[#2D2B55] border-[#BD00FF] mb-8">
          <CardHeader className="flex flex-row items-start gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#1A1A2E] bg-[#1A1A2E]">
              <img
                src={user.profileImage || `https://ui-avatars.com/api/?name=${user.username}`}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl text-white">
                    {user.displayName || user.username}
                  </CardTitle>
                  {user.bio && (
                    <p className="text-gray-200 mt-2">{user.bio}</p>
                  )}
                </div>
                {currentUser?.id === user.id && (
                  <Button
                    variant="outline"
                    className="bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
                    onClick={() => window.location.href = `/den/${user.id}`}
                  >
                    Manage Den
                  </Button>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                {user.socialLinks?.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#BD00FF] transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                ))}
              </div>

              <div className="flex gap-4 mt-4 text-sm text-gray-400">
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
            </div>
          </CardHeader>
        </Card>

        {/* Gallery Content */}
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  className="pl-10 bg-[#22223A] border-[#32325D] text-white"
                  placeholder="Search artworks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="w-[180px] bg-[#22223A] border-[#32325D] text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="likes">Most Liked</SelectItem>
                </SelectContent>
              </Select>
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

          {/* Artwork Display */}
          {viewMode === 'grid' ? (
            <ArtGrid artworks={filteredAndSortedArtworks || []} mode="gallery" />
          ) : (
            <div className="space-y-4">
              {(filteredAndSortedArtworks || []).map((artwork) => (
                <Card key={artwork.id} className="bg-[#2D2B55] border-[#BD00FF]">
                  <div className="flex">
                    <div className="w-48 h-48 overflow-hidden relative">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Content type badges */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        {artwork.isNsfw && (
                          <Badge variant="destructive" className="bg-red-500">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            NSFW
                          </Badge>
                        )}
                        {artwork.isAiGenerated && (
                          <Badge className="bg-purple-500">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
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
                          {artwork.likeCount} Likes
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
      </div>
    </div>
  );
}