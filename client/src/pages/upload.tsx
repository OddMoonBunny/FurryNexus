import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertArtworkSchema, type InsertArtwork } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
//import { MOCK_IMAGES } from "@/lib/constants"; // Removed since not used
import { motion } from "framer-motion";
import { z } from "zod";

const uploadSchema = insertArtworkSchema.extend({
  tags: z.string().transform((str: string) => str.split(",").map((s: string) => s.trim())),
});

export default function Upload() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertArtwork & { tags: string }>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      userId: 1, // Mock user ID
      title: "",
      description: "",
      imageUrl: "", // Removed mock image default
      isNsfw: false,
      isAiGenerated: false,
      tags: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertArtwork) => {
      const res = await apiRequest("POST", "/api/artworks", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Artwork uploaded successfully!",
      });
      navigate("/gallery");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  function onSubmit(data: InsertArtwork & { tags: string }) {
    mutate(data);
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] pt-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-[#2D2B55] border-[#BD00FF]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Upload Artwork</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter artwork title"
                            className="bg-[#1A1A2E] border-[#BD00FF]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your artwork"
                            className="bg-[#1A1A2E] border-[#BD00FF]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="digital, synthwave, furry"
                            className="bg-[#1A1A2E] border-[#BD00FF]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-6">
                    <FormField
                      control={form.control}
                      name="isNsfw"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <Label>NSFW Content</Label>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isAiGenerated"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <Label>AI Generated</Label>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="bg-[#FF1B8D] hover:bg-[#ff1b8d]/80"
                    >
                      {isPending ? "Uploading..." : "Upload Artwork"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}