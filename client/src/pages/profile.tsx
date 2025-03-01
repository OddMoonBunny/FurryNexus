import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { User, Artwork, Gallery } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();

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

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center text-2xl text-white">Artist not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      {/* Artist Banner */}
      <div
        className="w-full h-48 bg-cover bg-center relative"
        style={{ backgroundImage: user.bannerImage ? `url(${user.bannerImage})` : undefined }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1A1A2E]" />
      </div>

      <div className="container mx-auto px-4">
        {/* Artist Profile Card */}
        <Card className="bg-[#2D2B55] border-[#BD00FF] overflow-hidden -mt-24 mb-8 relative z-10">
          <CardHeader className="flex flex-row items-center gap-6 pt-8">
            <img
              src={user.profileImage || "https://images.unsplash.com/photo-1636690424408-4330adc3e583"}
              alt={user.displayName || user.username}
              className="w-32 h-32 rounded-full border-4 border-[#FF1B8D] object-cover"
            />
            <div>
              <CardTitle className="text-4xl font-bold text-white mb-2">
                {user.displayName || user.username}
              </CardTitle>
              <p className="text-lg text-[#FF1B8D]">@{user.username}</p>
              {user.bio && (
                <p className="text-gray-200 mt-4 text-lg">{user.bio}</p>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Gallery and Artwork Tabs */}
        <Tabs defaultValue="artworks" className="w-full">
          <TabsList className="bg-[#22223A] border-b border-[#32325D] w-full justify-start mb-8 rounded-none">
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
            {artworks?.length ? (
              <ArtGrid artworks={artworks} />
            ) : (
              <div className="text-center py-12 text-gray-400 text-lg">
                No artworks published yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="galleries">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries?.length ? (
                galleries.map((gallery) => (
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
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-400 text-lg">
                  No galleries created yet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
