import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { FileCheck, Send, AlertCircle, ThumbsUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const solutionSchema = z.object({
  subject: z.string().min(1, "Please select a subject"),
  solutionType: z.string().min(1, "Please select solution type"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Solution content is required"),
});

type SolutionData = z.infer<typeof solutionSchema>;

const solutionTypes = [
  { value: "assignment", label: "📝 Assignment Solution" },
  { value: "gdb", label: "💬 GDB Solution" },
  { value: "quiz", label: "❓ Quiz Solution" },
];

export function Solutions({ user }: { user: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SolutionData>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      subject: "",
      solutionType: "",
      title: "",
      description: "",
      content: "",
    },
  });

  const solutionMutation = useMutation({
    mutationFn: async (data: SolutionData) => {
      const response = await apiRequest("POST", "/api/solutions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solution Submitted",
        description: "Your solution has been submitted for admin approval.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/solutions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SolutionData) => {
    solutionMutation.mutate(data);
  };

  const subjects = user?.subjects || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignment & GDB Solutions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Share your solutions to help fellow VU students
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          🤝 Community Driven
        </Badge>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Submit your assignment and GDB solutions to help other students. All submissions require admin approval.
          Solutions with helpful votes will earn you community badges!
        </AlertDescription>
      </Alert>

      {/* Submit Solution Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCheck className="mr-2" size={24} />
            Submit Your Solution
          </CardTitle>
          <CardDescription>
            Share your assignment or GDB solution with detailed explanation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
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
                  name="solutionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solution Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {solutionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solution Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Assignment 1 Solution - Data Structures"
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
                    <FormLabel>Solution Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide your complete solution with step-by-step explanation..."
                        className="min-h-[300px]"
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
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes or tips for other students..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={solutionMutation.isPending}
                  className="flex items-center"
                >
                  {solutionMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="mr-2" size={16} />
                      Submit Solution
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Recent Solutions */}
      <Card>
        <CardHeader>
          <CardTitle>Community Solutions</CardTitle>
          <CardDescription>
            Browse solutions shared by fellow VU students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No solutions available yet. Be the first to share your solution!</p>
          </div>
        </CardContent>
      </Card>

      {/* Solution Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Total Solutions</p>
                <p className="text-lg font-semibold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ThumbsUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Helpful Votes</p>
                <p className="text-lg font-semibold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Contributors</p>
                <p className="text-lg font-semibold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}