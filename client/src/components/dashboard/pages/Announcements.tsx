import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Megaphone, Send, Pin, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type AnnouncementData = z.infer<typeof announcementSchema>;

export function Announcements({ user }: { user: any }) {
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AnnouncementData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const announcementMutation = useMutation({
    mutationFn: async (data: AnnouncementData) => {
      const response = await apiRequest("POST", "/api/announcements", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Announcement Submitted",
        description: "Your announcement has been submitted for admin approval.",
      });
      form.reset();
      setShowNewAnnouncement(false);
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AnnouncementData) => {
    announcementMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Stay updated with important VU portal announcements
          </p>
        </div>
        <Button onClick={() => setShowNewAnnouncement(!showNewAnnouncement)}>
          <Megaphone className="mr-2" size={16} />
          New Announcement
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Students can submit announcements for community events or important information. 
          All announcements require admin approval before being published.
        </AlertDescription>
      </Alert>

      {/* New Announcement Form */}
      {showNewAnnouncement && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Megaphone className="mr-2" size={24} />
              Submit New Announcement
            </CardTitle>
            <CardDescription>
              Share important information with the VU community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Announcement Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Study Group Formation for CS201"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Announcement Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed information about your announcement..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowNewAnnouncement(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={announcementMutation.isPending}
                    className="flex items-center"
                  >
                    {announcementMutation.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2" size={16} />
                        Submit for Approval
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Pinned Announcements */}
      <div className="space-y-4">
        <div className="flex items-center">
          <Pin className="mr-2" size={20} />
          <h2 className="text-xl font-semibold">Pinned Announcements</h2>
        </div>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Welcome to VU Student Portal</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  <Pin className="mr-1" size={12} />
                  Pinned
                </Badge>
                <Badge variant="outline">Admin</Badge>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="mr-1" size={14} />
              Posted 1 day ago
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              Welcome to the VU Student Portal! This platform is designed to help VU students collaborate, 
              share resources, and support each other in their academic journey. Please follow community 
              guidelines and help maintain a positive learning environment.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Announcements</h2>
        
        <Card>
          <CardContent className="text-center py-12">
            <Megaphone className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Recent Announcements
            </h3>
            <p className="text-gray-500 mb-4">
              Check back later for community announcements and updates
            </p>
            <Button onClick={() => setShowNewAnnouncement(true)}>
              Create First Announcement
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Announcement Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Announcement Categories</CardTitle>
          <CardDescription>
            Different types of announcements you might see
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                📚
              </div>
              <h3 className="font-semibold">Academic</h3>
              <p className="text-sm text-gray-500">Course updates and academic information</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                🎯
              </div>
              <h3 className="font-semibold">Events</h3>
              <p className="text-sm text-gray-500">Study groups and community events</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                ⚠️
              </div>
              <h3 className="font-semibold">Important</h3>
              <p className="text-sm text-gray-500">Critical updates and deadlines</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                💡
              </div>
              <h3 className="font-semibold">Tips</h3>
              <p className="text-sm text-gray-500">Study tips and helpful resources</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}