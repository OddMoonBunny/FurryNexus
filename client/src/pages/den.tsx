import { useQuery, useMutation } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/den/profile-header";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertArtworkSchema, insertGallerySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { motion } from "framer-motion";
import { Upload, Trash, Plus, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


const useContentFilters = () => {
  const [browseShowNsfw, setBrowseShowNsfw] = useState(() => {
    const stored = localStorage.getItem('browseShowNsfw');
    return stored ? stored === "true" : false;
  });

  const [browseShowAiGenerated, setBrowseShowAiGenerated] = useState(() => {
    const stored = localStorage.getItem('browseShowAiGenerated');
    return stored ? stored === "true" : true;
  });

  const updateNsfwFilter = useCallback((checked: boolean) => {
    setBrowseShowNsfw(checked);
    localStorage.setItem('browseShowNsfw', checked.toString());
    // Invalidate queries that depend on this filter
    queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
  }, []);

  const updateAiFilter = useCallback((checked: boolean) => {
    setBrowseShowAiGenerated(checked);
    localStorage.setItem('browseShowAiGenerated', checked.toString());
    // Invalidate queries that depend on this filter
    queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
  }, []);

  return {
    browseShowNsfw,
    browseShowAiGenerated,
    updateNsfwFilter,
    updateAiFilter
  };
};

const artworkSchema = insertArtworkSchema.extend({
  tags: z.string().transform((str) => {
    if (Array.isArray(str)) return str;
    return str.split(",").map((s) => s.trim());
  }),
});

export default function Den() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [selectedArtworkId, setSelectedArtworkId] = useState<number | null>(null);

  const { browseShowNsfw, browseShowAiGenerated, updateNsfwFilter, updateAiFilter } = useContentFilters();


  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
  });

  // Fetch all artworks without filtering in den
  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: [`/api/users/${id}/artworks`],
    enabled: !!user,
  });

  const artworkForm = useForm<InsertArtwork & { tags: string; id?: number }>({
    resolver: zodResolver(artworkSchema),
    defaultValues: {
      userId: Number(id),
      title: "",
      description: "",
      imageUrl: "",
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
    },
  });

  const artworkMutation = useMutation({
    mutationFn: async (data: InsertArtwork & { id?: number }) => {
      const { id, ...artwork } = data;

      // Ensure tags is properly formatted
      const formattedData = {
        ...artwork,
        tags: Array.isArray(artwork.tags) ? artwork.tags : artwork.tags.split(",").map((t) => t.trim()),
      };

      const res = await apiRequest(
        id ? "PATCH" : "POST",
        id ? `/api/artworks/${id}` : "/api/artworks",
        formattedData
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${id}/artworks`] });
      toast({
        title: "Success",
        description: selectedArtworkId ? "Artwork updated successfully!" : "Artwork created successfully!",
      });
      artworkForm.reset({
        userId: Number(id),
        title: "",
        description: "",
        imageUrl: "",
        isNsfw: false,
        isAiGenerated: false,
        tags: "",
      });
      setSelectedArtworkId(null);
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

  const { data: galleries } = useQuery<Gallery[]>({
    queryKey: [`/api/users/${id}/galleries`],
  });

  const onSubmitArtwork = (data: InsertArtwork & { tags: string; id?: number }) => {
    artworkMutation.mutate({ ...data, id: selectedArtworkId });
  };

  const deleteArtworkMutation = useMutation({
    mutationFn: async (artworkId: number) => {
      await apiRequest("DELETE", `/api/artworks/${artworkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${id}/artworks`] });
      toast({
        title: "Success",
        description: "Artwork deleted successfully!",
      });
      if (selectedArtworkId) {
        setSelectedArtworkId(null);
        artworkForm.reset({
          userId: Number(id),
          title: "",
          description: "",
          imageUrl: "",
          isNsfw: false,
          isAiGenerated: false,
          tags: "",
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete artwork",
      });
    },
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: async (galleryId: number) => {
      await apiRequest("DELETE", `/api/galleries/${galleryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${id}/galleries`] });
      toast({
        title: "Success",
        description: "Gallery deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete gallery",
      });
    },
  });

  const addToGalleryMutation = useMutation({
    mutationFn: async ({ galleryId, artworkId }: { galleryId: string; artworkId: string }) => {
      await apiRequest("POST", `/api/galleries/${galleryId}/artworks/${artworkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      toast({
        title: "Success",
        description: "Artwork added to gallery successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add artwork to gallery",
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
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Artist's Den</h1>
          <Button
            variant="outline"
            className="ml-auto bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
            onClick={() => window.location.href = `/gallery/${user.id}`}
          >
            View Public Gallery
          </Button>
          {user?.isAdmin && (
            <Badge variant="outline" className="border-[#00F9FF] text-[#00F9FF] flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          )}
        </div>

        <Tabs defaultValue="editor">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="editor">Artwork Editor</TabsTrigger>
            <TabsTrigger value="galleries">Gallery Manager</TabsTrigger>
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            {user?.isAdmin && (
              <Link href="/admin">
                <TabsTrigger value="admin" className="text-[#00F9FF] hover:bg-[#00F9FF]/10 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </div>
                </TabsTrigger>
              </Link>
            )}
          </TabsList>

          <TabsContent value="editor">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Artwork Grid */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Your Artworks</h2>
                {artworks?.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    No artworks to edit
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {artworks?.map((artwork) => (
                      <Card
                        key={artwork.id}
                        className={`bg-[#2D2B55] border-[#BD00FF] cursor-pointer hover:border-[#FF1B8D] transition-colors ${
                          selectedArtworkId === artwork.id ? "border-[#FF1B8D]" : ""
                        }`}
                        onClick={() => {
                          setSelectedArtworkId(artwork.id);
                          artworkForm.reset({
                            ...artwork,
                            tags: artwork.tags.join(", "),
                          });
                        }}
                      >
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-lg text-white">{artwork.title}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-[#FF1B8D]"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Are you sure you want to delete this artwork?")) {
                                deleteArtworkMutation.mutate(artwork.id);
                              }
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-video bg-[#1A1A2E] rounded-md overflow-hidden">
                            <img
                              src={artwork.imageUrl}
                              alt={artwork.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="mt-4 flex gap-2">
                            {artwork.isNsfw && (
                              <Badge variant="outline" className="border-[#FF1B8D] text-[#FF1B8D]">
                                NSFW
                              </Badge>
                            )}
                            {artwork.isAiGenerated && (
                              <Badge variant="outline" className="border-[#00F9FF] text-[#00F9FF]">
                                AI Generated
                              </Badge>
                            )}
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add to Gallery
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#2D2B55] border-[#BD00FF]">
                              <DialogHeader>
                                <DialogTitle className="text-white">Add to Gallery</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                {galleries?.map((gallery) => (
                                  <Button
                                    key={gallery.id}
                                    variant="outline"
                                    className="bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
                                    onClick={() => {
                                      addToGalleryMutation.mutate({
                                        galleryId: gallery.id.toString(),
                                        artworkId: artwork.id.toString(),
                                      });
                                    }}
                                  >
                                    {gallery.name}
                                  </Button>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit Form */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-[#2D2B55] border-[#BD00FF]">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-2xl text-white">
                        {selectedArtworkId ? "Edit Artwork" : "Create New Artwork"}
                      </CardTitle>
                      {selectedArtworkId && (
                        <Button
                          variant="outline"
                          className="bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
                          onClick={() => {
                            artworkForm.reset({
                              userId: Number(id),
                              title: "",
                              description: "",
                              imageUrl: "",
                              isNsfw: false,
                              isAiGenerated: false,
                              tags: "",
                            });
                            setSelectedArtworkId(null);
                          }}
                        >
                          New Artwork
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      {/* Preview Window */}
                      {artworkForm.watch("imageUrl") && (
                        <div className="mb-6">
                          <div className="text-sm text-gray-400 mb-2">Preview</div>
                          <div className="aspect-video bg-[#1A1A2E] rounded-md overflow-hidden border border-[#BD00FF] shadow-lg">
                            <img
                              src={artworkForm.watch("imageUrl")}
                              alt="Artwork preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex gap-2 mt-2">
                            {artworkForm.watch("isNsfw") && (
                              <Badge variant="outline" className="border-[#FF1B8D] text-[#FF1B8D]">
                                NSFW
                              </Badge>
                            )}
                            {artworkForm.watch("isAiGenerated") && (
                              <Badge variant="outline" className="border-[#00F9FF] text-[#00F9FF]">
                                AI Generated
                              </Badge>
                            )}
                            {artworkForm.watch("tags") &&
                              artworkForm.watch("tags").split(",").map((tag: string) => (
                                <Badge key={tag.trim()} variant="outline">
                                  {tag.trim()}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}

                      <Form {...artworkForm}>
                        <form
                          onSubmit={artworkForm.handleSubmit(onSubmitArtwork)}
                          className="space-y-6"
                        >
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
                              {artworkMutation.isPending
                                ? "Saving..."
                                : selectedArtworkId
                                  ? "Update Artwork"
                                  : "Create Artwork"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="galleries">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Your Galleries</h2>
                <Button
                  onClick={() => {
                    const name = prompt("Enter gallery name:");
                    if (name) {
                      galleryMutation.mutate({
                        userId: Number(id),
                        name,
                        description: "",
                        artworkIds: [],
                      });
                    }
                  }}
                  className="bg-[#00F9FF] hover:bg-[#00F9FF]/80 text-black"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Gallery
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries?.map((gallery) => (
                  <Card key={gallery.id} className="bg-[#2D2B55] border-[#BD00FF]">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl text-white">{gallery.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-[#FF1B8D]"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this gallery?")) {
                            deleteGalleryMutation.mutate(gallery.id);
                          }
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">{gallery.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="bg-[#2D2B55] border-[#BD00FF]">
              <CardHeader>
                <CardTitle className="text-xl text-white">Content Filter Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Filters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Public Browsing Preferences</h3>
                  <p className="text-sm text-gray-400">
                    These settings only affect what you see when browsing other users' galleries and the art discovery page.
                    Your own content in your Den will always be visible to you.
                  </p>
                  <div className="space-y-4 border border-[#32325D] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="browse-show-nsfw" className="text-white">Show NSFW Content</Label>
                        <p className="text-sm text-gray-400">Controls visibility of NSFW content while browsing</p>
                      </div>
                      <Switch
                        id="browse-show-nsfw"
                        checked={browseShowNsfw}
                        onCheckedChange={updateNsfwFilter}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="browse-show-ai" className="text-white">Show AI Generated Art</Label>
                        <p className="text-sm text-gray-400">Controls visibility of AI-generated artwork while browsing</p>
                      </div>
                      <Switch
                        id="browse-show-ai"
                        checked={browseShowAiGenerated}
                        onCheckedChange={updateAiFilter}
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Profile Images</h3>
                  <div className="space-y-2">
                    <Label className="text-white">Profile Banner</Label>
                    <div className="aspect-[3/1] bg-[#1A1A2E] rounded-lg border-2 border-dashed border-[#BD00FF] overflow-hidden">
                      {user.bannerImage ? (
                        <img
                          src={user.bannerImage}
                          alt="Profile Banner"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Button
                            variant="outline"
                            className="bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
                            onClick={() => document.getElementById("banner-upload")?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Banner
                          </Button>
                          <Input
                            id="banner-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              // TODO: Implement banner upload
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Profile Picture</Label>
                    <div className="w-32 h-32 bg-[#1A1A2E] rounded-full border-2 border-dashed border-[#BD00FF] overflow-hidden">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile Picture"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
                            onClick={() => document.getElementById("avatar-upload")?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                          <Input
                            id="avatar-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              // TODO: Implement avatar upload
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Display Name</Label>
                    <Input
                      placeholder="Display Name"
                      className="bg-[#1A1A2E] border-[#BD00FF]"
                      value={user.displayName || ""}
                      onChange={(e) => {
                        // TODO: Add display name update mutation
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Bio</Label>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      className="bg-[#1A1A2E] border-[#BD00FF]"
                      value={user.bio || ""}
                      onChange={(e) => {
                        // TODO: Add bio update mutation
                      }}
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <Label className="text-white">Social Links</Label>
                  {(user.socialLinks || []).map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Platform (e.g., Twitter, Instagram)"
                        className="bg-[#1A1A2E] border-[#BD00FF]"
                        value={link.platform}
                        onChange={(e) => {
                          // TODO: Add social links update mutation
                        }}
                      />
                      <Input
                        placeholder="URL"
                        className="bg-[#1A1A2E] border-[#BD00FF]"
                        value={link.url}
                        onChange={(e) => {
                          // TODO: Add social links update mutation
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-[#FF1B8D]"
                        onClick={() => {
                          // TODO: Remove social link
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
                    onClick={() => {
                      // TODO: Add new social link
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Social Link
                  </Button>
                </div>

                <Button
                  className="w-full mt-4 bg-[#BD00FF] hover:bg-[#A400E0] text-white"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Profile updates will be available soon!",
                    });
                  }}
                >
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}