
import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MoreVertical, 
  Trash, 
  Edit, 
  Share,
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import type { Gallery } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface GalleryActionsProps {
  gallery: Gallery;
  isOwner: boolean;
}

export function GalleryActions({ gallery, isOwner }: GalleryActionsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteGalleryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/galleries/${gallery.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete gallery");
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      queryClient.invalidateQueries({ 
        queryKey: ["userGalleries", gallery.userId.toString()] 
      });
      navigate("/");
      toast({
        title: "Gallery deleted",
        description: "Your gallery has been deleted successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete gallery",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteGalleryMutation.mutate();
  };

  if (!isOwner) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="ml-2 bg-transparent hover:bg-[#1A1A2E] text-white rounded-full h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#2D2B55] border-[#BD00FF] text-white">
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-[#1A1A2E] flex items-center gap-2"
            onClick={() => navigate(`/gallery/${gallery.id}`)}
          >
            <ExternalLink className="w-4 h-4" />
            View Gallery
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#BD00FF]/30" />
          
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-[#1A1A2E] flex items-center gap-2"
            onClick={() => navigate(`/edit-gallery/${gallery.id}`)}
          >
            <Edit className="w-4 h-4" />
            Edit
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-[#1A1A2E] text-[#FF1B8D] flex items-center gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-[#BD00FF]/30" />
          
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-[#1A1A2E] flex items-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + `/gallery/${gallery.id}`);
              toast({
                title: "Link copied",
                description: "Gallery link copied to clipboard",
                variant: "default",
              });
            }}
          >
            <Share className="w-4 h-4" />
            Share
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ConfirmationDialog
        title="Delete Gallery"
        description="Are you sure you want to delete this gallery? This action cannot be undone."
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        confirmText="Delete"
        isLoading={deleteGalleryMutation.isPending}
      />
    </>
  );
}
