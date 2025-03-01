
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Artwork, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function ArtworkPage() {
  const { id } = useParams<{ id: string }>();

  const { data: artwork, isLoading: isLoadingArtwork } = useQuery<Artwork>({
    queryKey: [`/api/artworks/${id}`],
  });

  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${artwork?.userId}`],
    enabled: !!artwork,
  });

  if (isLoadingArtwork) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading artwork...</div>
        </div>
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
    <div className="min-h-screen bg-[#1A1A2E] pt-24">
      <div className="container mx-auto px-4">
        <Card className="bg-[#2D2B55] border-[#BD00FF]">
          <CardHeader>
            <CardTitle className="text-3xl text-white">{artwork.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Link href={`/user/${artwork.userId}`}>
                <span className="text-[#FF1B8D] hover:underline cursor-pointer">
                  {user?.displayName || user?.username}
                </span>
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">
                {new Date(artwork.createdAt).toLocaleDateString()}
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
      </div>
    </div>
  );
}
