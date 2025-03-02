
import * as React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, X, Check, Plus } from "lucide-react";
import type { Artwork, Gallery } from "@shared/schema";

interface GalleryArtworkManagerProps {
  galleryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GalleryArtworkManager({ 
  galleryId, 
  open, 
  onOpenChange 
}: GalleryArtworkManagerProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedArtworks, setSelectedArtworks] = useState<Set<string>>(new Set());
  
  // Fetch gallery and artworks
  const galleryQuery = useQuery({
    queryKey: ["gallery", galleryId],
    queryFn: async () => {
      const response = await fetch(`/api/galleries/${galleryId}`);
      if (!response.ok) throw new Error("Failed to fetch gallery");
      return response.json() as Promise<Gallery>;
    },
    enabled: open
  });
  
  const galleryArtworksQuery = useQuery({
    queryKey: ["galleryArtworks", galleryId],
    queryFn: async () => {
      const response = await fetch(`/api/galleries/${galleryId}/artworks`);
      if (!response.ok) throw new Error("Failed to fetch gallery artworks");
      return response.json() as Promise<Artwork[]>;
    },
    enabled: open
  });
  
  const userArtworksQuery = useQuery({
    queryKey: ["userArtworks"],
    queryFn: async () => {
      // We need to get user ID from gallery query first
      if (!galleryQuery.data) return [];
      
      const response = await fetch(`/api/users/${galleryQuery.data.userId}/artworks`);
      if (!response.ok) throw new Error("Failed to fetch user artworks");
      return response.json() as Promise<Artwork[]>;
    },
    enabled: open && !!galleryQuery.data
  });
  
  // Mutation to add artwork to gallery
  const addArtworkMutation = useMutation({
    mutationFn: async (artworkId: string) => {
      const response = await fetch(`/api/galleries/${galleryId}/artworks/${artworkId}`, {
        method: "POST"
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add artwork to gallery");
      }
      
      return { galleryId, artworkId };
    },
    onSuccess: (_, artworkId) => {
      queryClient.invalidateQueries({ queryKey: ["galleryArtworks", galleryId] });
      toast({
        title: "Artwork added",
        description: "Artwork has been added to the gallery",
        variant: "default",
      });
      // Remove from selected
      setSelectedArtworks(prev => {
        const newSet = new Set(prev);
        newSet.delete(artworkId);
        return newSet;
      });
    }
  });
  
  // Mutation to remove artwork from gallery
  const removeArtworkMutation = useMutation({
    mutationFn: async (artworkId: string) => {
      const response = await fetch(`/api/galleries/${galleryId}/artworks/${artworkId}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove artwork from gallery");
      }
      
      return { galleryId, artworkId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryArtworks", galleryId] });
      toast({
        title: "Artwork removed",
        description: "Artwork has been removed from the gallery",
        variant: "default",
      });
    }
  });
  
  // Filter out artworks that are already in the gallery
  const availableArtworks = userArtworksQuery.data?.filter(artwork => 
    !galleryArtworksQuery.data?.some(ga => ga.id === artwork.id)
  ) || [];
  
  const isLoading = galleryQuery.isLoading || galleryArtworksQuery.isLoading || userArtworksQuery.isLoading;
  
  const handleSubmit = () => {
    selectedArtworks.forEach(artworkId => {
      addArtworkMutation.mutate(artworkId);
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2D2B55] border-[#BD00FF] text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Manage Gallery Artworks
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Add or remove artworks from this gallery
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-[#BD00FF]" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Current Gallery Artworks</h3>
              {galleryArtworksQuery.data?.length === 0 ? (
                <p className="text-gray-400">No artworks in this gallery yet</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto p-2">
                  {galleryArtworksQuery.data?.map(artwork => (
                    <div 
                      key={artwork.id} 
                      className="relative group rounded-md overflow-hidden border border-[#BD00FF]/50"
                    >
                      <img 
                        src={artwork.imageUrl} 
                        alt={artwork.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-xs text-center px-2 truncate max-w-full">
                          {artwork.title}
                        </p>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 bg-red-500 hover:bg-red-600"
                          onClick={() => removeArtworkMutation.mutate(artwork.id)}
                          disabled={removeArtworkMutation.isPending}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2 pt-4 border-t border-[#BD00FF]/30">
              <h3 className="text-lg font-semibold">Add Artworks</h3>
              {availableArtworks.length === 0 ? (
                <p className="text-gray-400">No additional artworks available</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto p-2">
                    {availableArtworks.map(artwork => {
                      const isSelected = selectedArtworks.has(artwork.id);
                      return (
                        <div 
                          key={artwork.id} 
                          className={`relative group rounded-md overflow-hidden border cursor-pointer
                            ${isSelected ? 'border-green-500' : 'border-[#BD00FF]/50'}`}
                          onClick={() => {
                            setSelectedArtworks(prev => {
                              const newSet = new Set(prev);
                              if (isSelected) {
                                newSet.delete(artwork.id);
                              } else {
                                newSet.add(artwork.id);
                              }
                              return newSet;
                            });
                          }}
                        >
                          <img 
                            src={artwork.imageUrl} 
                            alt={artwork.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <p className="text-xs text-center px-2 truncate max-w-full">
                              {artwork.title}
                            </p>
                            <div className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center">
                              {isSelected ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : (
                                <Plus className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-2">
                    Selected: {selectedArtworks.size} artwork(s)
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)} 
            variant="outline"
            className="bg-[#1A1A2E] text-white hover:bg-[#1A1A2E]/80 border-[#BD00FF]/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#BD00FF] hover:bg-[#BD00FF]/80 text-white"
            disabled={selectedArtworks.size === 0 || addArtworkMutation.isPending}
          >
            {addArtworkMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Selected"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
