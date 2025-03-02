import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Artwork, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";
import { Loading } from "@/components/ui/loading";

interface Comment {
  id: number;
  userId: number;
  artworkId: number;
  content: string;
  createdAt: string;
  user?: User;
}

export default function ArtworkPage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");

  const { data: artwork, isLoading: isLoadingArtwork } = useQuery<Artwork>({
    queryKey: [`/api/artworks/${id}`],
  });

  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${artwork?.userId}`],
    enabled: !!artwork,
  });

  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: [`/api/artworks/${id}/comments`],
    enabled: !!id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/artworks/${id}/comments`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/artworks/${id}/comments`] });
      setComment("");
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment",
      });
    },
  });

  const goBack = () => {
    window.history.back();
  };

  if (isLoadingArtwork) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center">Artwork not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-24 pb-12">
      <div className="container mx-auto px-4 relative">
        <div className="sticky top-24 z-50 flex justify-end mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goBack}
            className="rounded-full border-[#FF1B8D] bg-[#2D2B55] hover:bg-[#FF1B8D]/20"
          >
            <X className="h-6 w-6 text-[#FF1B8D]" />
          </Button>
        </div>

        {/* Artwork Card */}
        <Card className="bg-[#2D2B55] border-[#BD00FF] overflow-hidden mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-white">{artwork.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Link href={`/den/${artwork.userId}`}>
                <span className="text-[#FF1B8D] hover:underline cursor-pointer">
                  {user?.displayName || user?.username}
                </span>
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">
                {format(new Date(artwork.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video bg-[#1A1A2E] rounded-md overflow-hidden">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex gap-2">
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
              {artwork.tags && artwork.tags.length > 0 && artwork.tags[0] !== "" && (
                <>
                  {artwork.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-[#BD00FF] text-[#BD00FF]">
                      {tag}
                    </Badge>
                  ))}
                </>
              )}
            </div>

            {artwork.description && (
              <p className="text-gray-200 whitespace-pre-wrap">{artwork.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="bg-[#2D2B55] border-[#BD00FF]">
          <CardHeader>
            <CardTitle className="text-xl text-white">Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Comment */}
            {currentUser && (
              <div className="flex gap-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-[#1A1A2E] border-[#BD00FF] min-h-[80px]"
                />
                <Button
                  onClick={() => addCommentMutation.mutate(comment)}
                  disabled={!comment.trim() || addCommentMutation.isPending}
                  className="bg-[#FF1B8D] hover:bg-[#FF1B8D]/80 self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {isLoadingComments ? (
                <div className="text-center py-4 text-gray-400">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4 text-gray-400">No comments yet</div>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id} className="bg-[#1A1A2E] border-[#BD00FF]">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/den/${comment.userId}`}>
                          <span className="text-[#FF1B8D] hover:underline cursor-pointer">
                            {comment.user?.displayName || comment.user?.username}
                          </span>
                        </Link>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400 text-sm">
                          {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-gray-200 whitespace-pre-wrap">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}