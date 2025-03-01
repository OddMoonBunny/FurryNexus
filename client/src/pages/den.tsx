import { useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/den/profile-header";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { User, Artwork, Gallery } from "@shared/schema";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function Den() {
  const { id } = useParams<{ id: string }>();
  const [showNsfw, setShowNsfw] = useState(false);
  const [showAiGenerated, setShowAiGenerated] = useState(true);

  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
  });

  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: [`/api/users/${id}/artworks`],
  });

  const { data: galleries } = useQuery<Gallery[]>({
    queryKey: [`/api/users/${id}/galleries`],
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      <ProfileHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="artwork" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="artwork">Artwork</TabsTrigger>
            <TabsTrigger value="galleries">Galleries</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="artwork">
            <ArtGrid artworks={artworks || []} />
          </TabsContent>

          <TabsContent value="galleries">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries?.map((gallery) => (
                <div key={gallery.id} className="p-4 rounded-lg bg-[#2D2B55] border border-[#BD00FF]">
                  <h3 className="text-xl font-bold mb-2">{gallery.name}</h3>
                  <p className="text-gray-300">{gallery.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-[#2D2B55] border-[#BD00FF]">
              <CardHeader>
                <CardTitle className="text-xl text-white">Content Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Switch
                    id="nsfw"
                    checked={showNsfw}
                    onCheckedChange={setShowNsfw}
                  />
                  <Label htmlFor="nsfw" className="text-white">Show NSFW Content</Label>
                </div>

                <div className="flex items-center space-x-4">
                  <Switch
                    id="ai"
                    checked={showAiGenerated}
                    onCheckedChange={setShowAiGenerated}
                  />
                  <Label htmlFor="ai" className="text-white">Show AI Generated Content</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="favorites">
            <div className="text-center py-12 text-gray-400">
              No favorites yet
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}