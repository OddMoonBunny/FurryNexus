import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertArtworkSchema, insertGallerySchema, type InsertArtwork, type InsertGallery } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const artworkSchema = insertArtworkSchema.extend({
  tags: z.string().transform((str: string) => str.split(",").map((s: string) => s.trim())),
});

export default function Editor() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const artworkForm = useForm<InsertArtwork & { tags: string }>({
    resolver: zodResolver(artworkSchema),
    defaultValues: {
      userId: 1, // Mock user ID
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
      userId: 1, // Mock user ID
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
      queryClient.invalidateQueries({ queryKey: ["/api/artworks"] });
      toast({
        title: "Success",
        description: "Artwork created successfully!",
      });
      navigate("/gallery");
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
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      toast({
        title: "Success",
        description: "Gallery created successfully!",
      });
      navigate("/gallery");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  function onArtworkSubmit(data: InsertArtwork & { tags: string }) {
    artworkMutation.mutate(data);
  }

  function onGallerySubmit(data: InsertGallery) {
    galleryMutation.mutate(data);
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-[#2D2B55] border-[#BD00FF]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Art Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="artwork" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="artwork">New Artwork</TabsTrigger>
                  <TabsTrigger value="gallery">New Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="artwork">
                  <Form {...artworkForm}>
                    <form onSubmit={artworkForm.handleSubmit(onArtworkSubmit)} className="space-y-6">
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
                </TabsContent>

                <TabsContent value="gallery">
                  <Form {...galleryForm}>
                    <form onSubmit={galleryForm.handleSubmit(onGallerySubmit)} className="space-y-6">
                      <FormField
                        control={galleryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gallery Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter gallery name"
                                className="bg-[#1A1A2E] border-[#BD00FF]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={galleryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your gallery"
                                className="bg-[#1A1A2E] border-[#BD00FF]"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={galleryMutation.isPending}
                          className="bg-[#00F9FF] hover:bg-[#00F9FF]/80 text-black"
                        >
                          {galleryMutation.isPending ? "Creating..." : "Create Gallery"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
