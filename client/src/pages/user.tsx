import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { User, Artwork, Gallery } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Link } from "wouter";

export default function UserPage() {
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
      {/* User Profile Header */}
      <div className="container mx-auto px-4">
        <Card className="bg-[#2D2B55] border-[#BD00FF] mb-8">
          <CardHeader className="flex items-start gap-6">
            <img
              src={user.profileImage || "https://images.unsplash.com/photo-1636690424408-4330adc3e583"}
              alt={user.displayName || user.username}
              className="w-24 h-24 rounded-full border-4 border-[#FF1B8D]"
            />
            <div>
              <CardTitle className="text-3xl text-white">
                {user.displayName || user.username}
              </CardTitle>
              <p className="text-sm text-gray-300 mt-1">@{user.username}</p>
              {user.bio && (
                <p className="text-gray-200 mt-4">{user.bio}</p>
              )}
            </div>
          </CardHeader>
        </Card>

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
            {artworks?.length ? (
              <ArtGrid artworks={artworks} />
            ) : (
              <div className="text-center py-12 text-gray-400">
                No artworks yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="galleries">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries?.map((gallery) => (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}