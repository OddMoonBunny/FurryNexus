import * as React from "react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { 
  MoreVertical, 
  Trash, 
  Edit, 
  Share, 
  Plus,
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Artwork } from "@shared/schema";

interface ArtworkActionsProps {
  artwork: Artwork;
  isOwner: boolean;
  children: React.ReactNode;
  onAddToGallery?: () => void;
}

export function ArtworkActions({ 
  artwork, 
  isOwner, 
  children,
  onAddToGallery 
}: ArtworkActionsProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteArtworkMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/artworks/${artwork.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete artwork");
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artworks"] });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${artwork.userId}/artworks`]
      });
      setLocation("/");
      toast({
        title: "Artwork deleted",
        description: "Your artwork has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete artwork",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteArtworkMutation.mutate();
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild data-sidebar>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-[#2D2B55] border-[#BD00FF] text-white">
          <ContextMenuItem 
            className="cursor-pointer hover:bg-[#1A1A2E] flex items-center gap-2"
            onClick={() => setLocation(`/artwork/${artwork.id}`)}
          >
            <ExternalLink className="h-4 w-4" />
            View Details
          </ContextMenuItem>

          {isOwner && (
            <>
              <ContextMenuSeparator className="bg-[#BD00FF]/30" />
              <ContextMenuItem 
                className="cursor-pointer hover:bg-[#1A1A2E] flex items-center gap-2"
                onClick={() => setLocation(`/edit-artwork/${artwork.id}`)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </ContextMenuItem>
              <ContextMenuItem 
                className="cursor-pointer hover:bg-[#1A1A2E] text-[#FF1B8D] flex items-center gap-2"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4" />
                Delete
              </ContextMenuItem>
            </>
          )}

          <ContextMenuSeparator className="bg-[#BD00FF]/30" />

          <ContextMenuItem 
            className="cursor-pointer hover:bg-[#1A1A2E] flex items-center gap-2"
            onClick={() => {
              if (onAddToGallery) onAddToGallery();
            }}
          >
            <Plus className="h-4 w-4" />
            Add to Gallery
          </ContextMenuItem>

          <ContextMenuItem 
            className="cursor-pointer hover:bg-[#1A1A2E] flex items-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + `/artwork/${artwork.id}`);
              toast({
                title: "Link copied",
                description: "Artwork link copied to clipboard",
              });
            }}
          >
            <Share className="h-4 w-4" />
            Share
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ConfirmationDialog
        title="Delete Artwork"
        description="Are you sure you want to delete this artwork? This action cannot be undone."
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        confirmText="Delete"
        isLoading={deleteArtworkMutation.isPending}
      />
    </>
  );
}

export function ArtworkActionsButton({ 
  artwork, 
  isOwner,
  onAddToGallery 
}: Omit<ArtworkActionsProps, "children">) {
  return (
    <ArtworkActions 
      artwork={artwork} 
      isOwner={isOwner}
      onAddToGallery={onAddToGallery}
    >
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8 p-0"
        data-sidebar
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </ArtworkActions>
  );
}