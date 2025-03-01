import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Settings } from "lucide-react";
import type { User } from "@shared/schema";

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="relative w-full">
      <div
        className="w-full h-48 bg-cover bg-center"
        style={{ backgroundImage: user.bannerImage ? `url(${user.bannerImage})` : undefined }}
      />
      <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-[#1A1A2E] to-transparent" />

      <div className="container mx-auto px-4">
        <Card className="relative -mt-16 bg-[#2D2B55] border-[#BD00FF]">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <img
                src={user.profileImage || "https://images.unsplash.com/photo-1636690424408-4330adc3e583"}
                alt={user.displayName}
                className="w-24 h-24 rounded-full border-4 border-[#FF1B8D]"
              />

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
                    <p className="text-sm text-gray-300">@{user.username}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </Button>
                  </div>
                </div>

                <p className="mt-4 text-gray-200">{user.bio || "No bio yet"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}