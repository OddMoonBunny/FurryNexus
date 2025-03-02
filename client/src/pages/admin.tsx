import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin
  if (!currentUser?.isAdmin) {
    return <Redirect to="/" />;
  }

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
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

  if (isLoadingUsers) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading users...</div>
        </div>
      </div>
    );
  }

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
                <div className="space-y-4">
                  {users?.map((user) => (
                    <Card key={user.id} className="bg-[#1A1A2E] border-[#BD00FF]">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {user.displayName || user.username}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            {user.isAdmin && (
                              <Badge variant="outline" className="border-[#FF1B8D] text-[#FF1B8D]">
                                Admin
                              </Badge>
                            )}
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`admin-${user.id}`}
                                checked={user.isAdmin}
                                onCheckedChange={(checked) => 
                                  toggleAdminMutation.mutate({ userId: user.id, isAdmin: checked })
                                }
                                disabled={user.id === currentUser.id}
                              />
                              <Label htmlFor={`admin-${user.id}`}>Admin Status</Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
