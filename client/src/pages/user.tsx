import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { User, Artwork, Gallery } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArtGrid } from "@/components/artwork/art-grid";

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
      <div className="container mx-auto px-4">
        <Card className="bg-[#2D2B55] border-[#BD00FF] mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-white">
              {user.displayName || user.username}
            </CardTitle>
          </CardHeader>
          {user.bio && (
            <CardContent>
              <p className="text-gray-200">{user.bio}</p>
            </CardContent>
          )}
        </Card>

        <Tabs defaultValue="artworks">
          <TabsList>
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="galleries">Galleries</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
}
