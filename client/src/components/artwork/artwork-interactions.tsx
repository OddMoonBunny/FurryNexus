import { Heart, MessageSquare, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Artwork } from "@shared/schema";

interface ArtworkInteractionsProps {
  artwork: Artwork;
  size?: "sm" | "default";
}

export function ArtworkInteractions({ artwork, size = "default" }: ArtworkInteractionsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/artworks/${artwork.id}/likes`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/artworks/${artwork.id}`] });
      toast({
        title: "Success",
        description: "Artwork liked!",
      });
    },
  });

  if (!user) {
    return (
      <div className="text-sm text-gray-400 flex gap-4">
        <span className="flex items-center gap-1">
          <Heart className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} />
          {artwork.likeCount}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} />
          0
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size={size}
        className="text-gray-400 hover:text-[#FF1B8D]"
        onClick={() => likeMutation.mutate()}
      >
        <Heart className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} mr-1`} />
        {artwork.likeCount}
      </Button>
      <Button
        variant="ghost"
        size={size}
        className="text-gray-400 hover:text-[#00F9FF]"
      >
        <MessageSquare className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} mr-1`} />
        0
      </Button>
      <Button
        variant="ghost"
        size={size}
        className="text-gray-400 hover:text-[#BD00FF]"
      >
        <Bookmark className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} mr-1`} />
      </Button>
    </div>
  );
}
