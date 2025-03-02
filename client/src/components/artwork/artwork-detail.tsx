import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageSquare, Calendar, Eye, Share2, Sparkles, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Artwork } from "@shared/schema";

interface ArtworkDetailProps {
  artwork: Artwork;
  mode?: "gallery" | "den";
}

export function ArtworkDetail({ artwork, mode = "gallery" }: ArtworkDetailProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <Card className="bg-[#2D2B55] border-[#BD00FF] hover:border-[#FF1B8D] transition-colors">
            <div className="aspect-square overflow-hidden relative">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
              {/* Content type badges */}
              <div className="absolute top-2 right-2 flex gap-2">
                {artwork.isNsfw && (
                  <Badge variant="destructive" className="bg-red-500">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    NSFW
                  </Badge>
                )}
                {artwork.isAiGenerated && (
                  <Badge className="bg-purple-500">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-white mb-2">{artwork.title}</h3>
              <div className="flex gap-2 flex-wrap mb-2">
                {artwork.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {artwork.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  0
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl bg-[#2D2B55] border-[#BD00FF]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            {artwork.title}
            {artwork.isNsfw && (
              <Badge variant="destructive" className="bg-red-500">
                <AlertTriangle className="h-3 w-3 mr-1" />
                NSFW
              </Badge>
            )}
            {artwork.isAiGenerated && (
              <Badge className="bg-purple-500">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square bg-[#1A1A2E] rounded-lg overflow-hidden">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="text-white font-medium mb-2">Description</h4>
              <p className="text-gray-300">{artwork.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {artwork.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Uploaded</div>
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="h-4 w-4" />
                  {new Date(artwork.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Views</div>
                <div className="flex items-center gap-2 text-white">
                  <Eye className="h-4 w-4" />
                  {artwork.viewCount}
                </div>
              </div>
            </div>

            {mode === "gallery" && user && (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
                  onClick={() => likeMutation.mutate()}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
                <Button
                  variant="outline"
                  className="bg-[#1A1A2E] border-[#BD00FF] hover:bg-[#BD00FF]/10"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {mode === "gallery" && !user && (
              <div className="text-center text-gray-400 p-4 border border-[#32325D] rounded-lg">
                Sign in to like and comment on artworks
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}