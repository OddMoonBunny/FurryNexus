import { useQuery } from "@tanstack/react-query";
import { ArtGrid } from "@/components/artwork/art-grid";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Artwork } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function Browser() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks"],
  });

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-16">
      <div className="container mx-auto px-4">
        <div className="py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Art Gallery</h1>

            <div className="relative w-full md:w-96">
              <Input
                placeholder="Search artworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#2D2B55] border-[#BD00FF] text-white"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-[#00F9FF]">Loading artworks...</div>
            </div>
          ) : !artworks?.length ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-white mb-2">No artworks found</h2>
              <p className="text-gray-400">Try adjusting your search terms</p>
            </div>
          ) : (
            <ArtGrid artworks={artworks} />
          )}
        </div>
      </div>
    </div>
  );
}