import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Shield, Search, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function AdminPanel() {
  const { user: currentUser, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect if not logged in or not admin
  if (!currentUser || !currentUser.isAdmin) {
    return <Redirect to="/" />;
  }

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}`, { isAdmin });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User admin status updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-24">
      <div className="container mx-auto px-4">
        <Card className="bg-[#2D2B55] border-[#BD00FF]">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <div className="space-y-6">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      className="pl-10 bg-[#1A1A2E] border-[#32325D] text-white"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {isLoadingUsers ? (
                    <div className="text-center py-8">
                      <div className="animate-spin text-[#00F9FF]">Loading users...</div>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-400">No users found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredUsers.map((user) => (
                        <Card key={user.id} className="bg-[#1A1A2E] border-[#BD00FF]">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <img
                                  src={user.profileImage || "https://images.unsplash.com/photo-1636690424408-4330adc3e583"}
                                  alt={user.displayName || user.username}
                                  className="w-10 h-10 rounded-full border-2 border-[#FF1B8D]"
                                />
                                <div>
                                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    {user.displayName || user.username}
                                    {user.isAdmin && (
                                      <Badge variant="outline" className="border-[#FF1B8D] text-[#FF1B8D]">
                                        Admin
                                      </Badge>
                                    )}
                                  </h3>
                                  <p className="text-sm text-gray-400">
                                    @{user.username} • Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id={`admin-${user.id}`}
                                    checked={user.isAdmin}
                                    onCheckedChange={(checked) => 
                                      toggleAdminMutation.mutate({ userId: user.id, isAdmin: checked })
                                    }
                                    disabled={user.id === currentUser.id}
                                  />
                                  <Label htmlFor={`admin-${user.id}`} className="text-gray-300">
                                    Admin Status
                                  </Label>
                                </div>
                                {user.id === currentUser.id && (
                                  <Badge variant="outline" className="border-[#00F9FF] text-[#00F9FF]">
                                    Current User
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reports">
                <div className="text-center py-12 text-gray-400">
                  Report management coming soon
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="text-center py-12 text-gray-400">
                  Admin settings coming soon
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}