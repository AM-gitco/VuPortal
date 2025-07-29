import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { MessageSquare, Send, ThumbsUp, Users, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const discussionSchema = z.object({
  subject: z.string().optional(),
  content: z.string().min(1, "Discussion content is required"),
});

type DiscussionData = z.infer<typeof discussionSchema>;

export function Discussions({ user }: { user: any }) {
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DiscussionData>({
    resolver: zodResolver(discussionSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });

  const discussionMutation = useMutation({
    mutationFn: async (data: DiscussionData) => {
      const response = await apiRequest("POST", "/api/discussions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Discussion Posted",
        description: "Your discussion has been posted successfully.",
      });
      form.reset();
      setShowNewDiscussion(false);
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Post Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DiscussionData) => {
    discussionMutation.mutate(data);
  };

  const subjects = user?.subjects || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Public Discussions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Ask questions and share knowledge with fellow VU students
          </p>
        </div>
        <Button onClick={() => setShowNewDiscussion(!showNewDiscussion)}>
          <Plus className="mr-2" size={16} />
          New Discussion
        </Button>
      </div>

      {/* New Discussion Form */}
      {showNewDiscussion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2" size={24} />
              Start New Discussion
            </CardTitle>
            <CardDescription>
              Share your questions or start a discussion on any VU topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject (Optional)</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject or leave general" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">General Discussion</SelectItem>
                            {subjects.map((subject: string) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <FormLabel>Discussion Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your question, experience, or start a discussion..."
                          className="min-h-[150px]"
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
                    onClick={() => setShowNewDiscussion(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={discussionMutation.isPending}
                    className="flex items-center"
                  >
                    {discussionMutation.isPending ? (
                      "Posting..."
                    ) : (
                      <>
                        <Send className="mr-2" size={16} />
                        Post Discussion
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Discussion Feed */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Discussions</h2>
        
        {/* Sample Discussion Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user?.fullName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold">{user?.fullName || 'VU Student'}</span>
                  <Badge variant="outline" className="text-xs">
                    {user?.email?.replace(/\d+/g, '***') || 'student@vu.edu.pk'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">CS201</Badge>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="text-gray-700 dark:text-gray-300 mb-3">
                  <p>Need help understanding pointers in C++. Can someone explain the difference between pass by value and pass by reference with examples?</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <ThumbsUp className="mr-1" size={14} />
                    5 likes
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <MessageSquare className="mr-1" size={14} />
                    3 replies
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-blue-600">
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Discussions Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Be the first to start a discussion and help build our community!
            </p>
            <Button onClick={() => setShowNewDiscussion(true)}>
              Start First Discussion
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Discussion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Total Discussions</p>
                <p className="text-lg font-semibold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ThumbsUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Total Likes</p>
                <p className="text-lg font-semibold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Active Members</p>
                <p className="text-lg font-semibold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}