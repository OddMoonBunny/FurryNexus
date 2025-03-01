
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter by search term if provided
  const filteredUsers = searchTerm
    ? users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : users;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Artists</h1>
        <p className="text-gray-300 mb-6">Discover talented creators in our community</p>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-[#32325D] mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by username or display name"
                className="bg-[#22223A] border-[#32325D]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-t-2 border-[#FF1B8D] rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading artists...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-[#2D2B55] border-[#BD00FF] hover:border-[#FF1B8D] transition-colors overflow-hidden">
              <CardContent className="p-6">
                <Link href={`/profile/${user.id}`}>
                  <div className="flex items-center gap-4 cursor-pointer">
                    <div className="h-16 w-16 rounded-full bg-[#1A1A2E] overflow-hidden flex-shrink-0">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#FF1B8D] text-xl font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white hover:text-[#FF1B8D] transition-colors">
                        {user.displayName || user.username}
                      </h3>
                      {user.displayName && (
                        <p className="text-sm text-gray-300">@{user.username}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-lg">
          No artists found matching your search
        </div>
      )}
    </div>
  );
}
