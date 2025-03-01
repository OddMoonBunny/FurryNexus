
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Artwork } from "@shared/schema";
import { ArtGrid } from "../components/artwork/art-grid";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";

export default function BrowsePage() {
  const [filters, setFilters] = useState({
    showNsfw: false,
    showAiGenerated: true,
    searchTerm: ""
  });

  // Use the filters in the query to the API
  const { data: artworks = [], isLoading } = useQuery<Artwork[]>({
    queryKey: [
      "/api/artworks",
      { isNsfw: filters.showNsfw, isAiGenerated: filters.showAiGenerated }
    ],
  });

  // Filter by search term client-side (if provided)
  const filteredArtworks = filters.searchTerm 
    ? artworks.filter(art => 
        art.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (art.tags && art.tags.some(tag => 
          tag.toLowerCase().includes(filters.searchTerm.toLowerCase())
        ))
      )
    : artworks;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Browse Artwork</h1>
        <p className="text-gray-300 mb-6">Explore the latest creations from our community</p>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-[#32325D] mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by title or tag"
                className="bg-[#22223A] border-[#32325D]"
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={filters.showNsfw}
                  onCheckedChange={(checked) => 
                    setFilters({...filters, showNsfw: checked})
                  }
                  id="nsfw-toggle"
                />
                <Label htmlFor="nsfw-toggle" className="text-sm text-gray-300">
                  Show NSFW
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  checked={filters.showAiGenerated}
                  onCheckedChange={(checked) => 
                    setFilters({...filters, showAiGenerated: checked})
                  }
                  id="ai-toggle"
                />
                <Label htmlFor="ai-toggle" className="text-sm text-gray-300">
                  Show AI-Generated
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-t-2 border-[#FF1B8D] rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading artworks...</p>
        </div>
      ) : filteredArtworks.length > 0 ? (
        <ArtGrid artworks={filteredArtworks} />
      ) : (
        <div className="text-center py-12 text-gray-400 text-lg">
          No artworks found matching your criteria
        </div>
      )}
    </div>
  );
}
