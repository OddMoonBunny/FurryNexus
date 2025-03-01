import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Link } from "wouter";
import type { Artwork, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface ArtCardProps {
  artwork: Artwork;
}

export function ArtCard({ artwork }: ArtCardProps) {
  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${artwork.userId}`],
    enabled: !!artwork.userId,
  });

  return (
    <Card className="bg-[#2D2B55] border-[#BD00FF] hover:border-[#FF1B8D] transition-colors overflow-hidden h-full flex flex-col">
      <Link href={`/artwork/${artwork.id}`}>
        <div className="aspect-video bg-[#1A1A2E] overflow-hidden">
          <img 
            src={artwork.imageUrl} 
            alt={artwork.title} 
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Link href={`/artwork/${artwork.id}`}>
          <h3 className="text-lg font-semibold text-white truncate cursor-pointer hover:text-[#FF1B8D] transition-colors">
            {artwork.title}
          </h3>
        </Link>
        <Link href={`/user/${artwork.userId}`}>
          <p className="text-sm text-[#FF1B8D] mt-1 hover:underline cursor-pointer">
            {user?.displayName || user?.username}
          </p>
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex flex-wrap gap-2">
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
      </CardFooter>
    </Card>
  );
}