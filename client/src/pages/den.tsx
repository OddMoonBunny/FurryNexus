import { useQuery, useMutation } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/den/profile-header";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { User, Artwork, Gallery, InsertArtwork, InsertGallery } from "@shared/schema";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertArtworkSchema, insertGallerySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

const artworkSchema = insertArtworkSchema.extend({
  tags: z.string().transform((str: string) => str.split(",").map((s: string) => s.trim())),
});

export default function Den() {
  const { id } = useParams<{ id: string }>();
  const [showNsfw, setShowNsfw] = useState(false);
  const [showAiGenerated, setShowAiGenerated] = useState(true);
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
  });

  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: [`/api/users/${id}/artworks`],
  });

  const { data: galleries } = useQuery<Gallery[]>({
    queryKey: [`/api/users/${id}/galleries`],
  });

  const artworkForm = useForm<InsertArtwork & { tags: string }>({
    resolver: zodResolver(artworkSchema),
    defaultValues: {
      userId: Number(id),
      title: "",
      description: "",
      imageUrl: "https://images.unsplash.com/photo-1636690424408-4330adc3e583", // Default image for testing
      isNsfw: false,
      isAiGenerated: false,
      tags: "",
    },
  });

  const galleryForm = useForm<InsertGallery>({
    resolver: zodResolver(insertGallerySchema),
    defaultValues: {
      userId: Number(id),
      name: "",
      description: "",
      artworkIds: [],
    },
  });

  const artworkMutation = useMutation({
    mutationFn: async (data: InsertArtwork) => {
      const res = await apiRequest("POST", "/api/artworks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${id}/artworks`] });
      toast({
        title: "Success",
        description: "Artwork created successfully!",
      });
      artworkForm.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const galleryMutation = useMutation({
    mutationFn: async (data: InsertGallery) => {
      const res = await apiRequest("POST", "/api/galleries", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${id}/galleries`] });
      toast({
        title: "Success",
        description: "Gallery created successfully!",
      });
      galleryForm.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
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
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="galleries">Galleries</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="artwork">
            <ArtGrid artworks={artworks || []} />
          </TabsContent>

          <TabsContent value="editor">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-[#2D2B55] border-[#BD00FF]">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Create New Artwork</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...artworkForm}>
                    <form onSubmit={artworkForm.handleSubmit((data) => artworkMutation.mutate(data))} className="space-y-6">
                      <FormField
                        control={artworkForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter artwork title"
                                className="bg-[#1A1A2E] border-[#BD00FF]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={artworkForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your artwork"
                                className="bg-[#1A1A2E] border-[#BD00FF]"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-4">
                        <FormLabel>Upload Artwork</FormLabel>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const formData = new FormData();
                              formData.append("file", file);

                              try {
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  body: formData,
                                });

                                if (!res.ok) throw new Error("Upload failed");

                                const data = await res.json();
                                artworkForm.setValue("imageUrl", data.url);

                                toast({
                                  title: "Success",
                                  description: "Image uploaded successfully!",
                                });
                              } catch (error) {
                                toast({
                                  variant: "destructive",
                                  title: "Error",
                                  description: "Failed to upload image",
                                });
                              }
                            }}
                            className="hidden"
                            id="artwork-upload"
                            accept="image/jpeg,image/png,image/gif"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("artwork-upload")?.click()}
                            className="bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                          {artworkForm.watch("imageUrl") && (
                            <span className="text-sm text-gray-400">Image selected</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-6">
                        <FormField
                          control={artworkForm.control}
                          name="isNsfw"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <Label>NSFW Content</Label>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={artworkForm.control}
                          name="isAiGenerated"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <Label>AI Generated</Label>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={artworkForm.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags (comma-separated)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="digital, synthwave, furry"
                                className="bg-[#1A1A2E] border-[#BD00FF]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={artworkMutation.isPending}
                          className="bg-[#FF1B8D] hover:bg-[#ff1b8d]/80"
                        >
                          {artworkMutation.isPending ? "Creating..." : "Create Artwork"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
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
        </Tabs>
      </div>
    </div>
  );
}