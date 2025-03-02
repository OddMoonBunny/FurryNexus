
import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
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
  const navigate = useNavigate();
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
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ 
        queryKey: ["userArtworks", artwork.userId.toString()] 
      });
      navigate("/");
      toast({
        title: "Artwork deleted",
        description: "Your artwork has been deleted successfully",
        variant: "default",
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
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-[#2D2B55] border-[#BD00FF] text-white">
          <ContextMenuItem 
            className="cursor-pointer hover:bg-[#1A1A2E] flex items-center gap-2"
            onClick={() => navigate(`/artwork/${artwork.id}`)}
          >
            <ExternalLink className="w-4 h-4" />
            View Details
          </ContextMenuItem>
          
          {isOwner && (
            <>
              <ContextMenuSeparator className="bg-[#BD00FF]/30" />
              <ContextMenuItem 
                className="cursor-pointer hover:bg-[#1A1A2E] flex items-center gap-2"
                onClick={() => navigate(`/edit-artwork/${artwork.id}`)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </ContextMenuItem>
              <ContextMenuItem 
                className="cursor-pointer hover:bg-[#1A1A2E] text-[#FF1B8D] flex items-center gap-2"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="w-4 h-4" />
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
            <Plus className="w-4 h-4" />
            Add to Gallery
          </ContextMenuItem>
          
          <ContextMenuItem 
            className="cursor-pointer hover:bg-[#1A1A2E] flex items-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + `/artwork/${artwork.id}`);
              toast({
                title: "Link copied",
                description: "Artwork link copied to clipboard",
                variant: "default",
              });
            }}
          >
            <Share className="w-4 h-4" />
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

// Alternative trigger button if you don't want context menu
export function ArtworkActionsButton({ 
  artwork, 
  isOwner,
  onAddToGallery 
}: Omit<ArtworkActionsProps, "children">) {
  const [open, setOpen] = useState(false);
  
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
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </ArtworkActions>
  );
}
