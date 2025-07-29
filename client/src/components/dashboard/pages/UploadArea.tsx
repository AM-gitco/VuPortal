import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Upload, FileText, Link, Send, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const uploadSchema = z.object({
  subject: z.string().min(1, "Please select a subject"),
  uploadType: z.string().min(1, "Please select upload type"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.string().optional(),
  externalLink: z.string().url().optional().or(z.literal("")),
});

type UploadData = z.infer<typeof uploadSchema>;

const uploadTypes = [
  { value: "handout", label: "📚 Handout" },
  { value: "notes", label: "📝 Notes" },
  { value: "guide", label: "📖 Study Guide" },
  { value: "past_paper", label: "📋 Past Paper" },
  { value: "guess_paper", label: "🎯 Guess Paper" },
];

export function UploadArea({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("file");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UploadData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      subject: "",
      uploadType: "",
      title: "",
      description: "",
      content: "",
      externalLink: "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadData) => {
      const response = await apiRequest("POST", "/api/uploads", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Submitted",
        description: "Your upload has been submitted for admin approval.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UploadData) => {
    // Add content based on active tab
    const submitData = {
      ...data,
      contentType: activeTab,
    };
    uploadMutation.mutate(submitData);
  };

  const subjects = user?.subjects || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Area</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Share your study materials with fellow VU students
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          📋 Admin Approval Required
        </Badge>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          All uploads require admin approval before becoming publicly available. 
          Make sure to select the correct subject and provide accurate descriptions.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2" size={24} />
            Upload Study Material
          </CardTitle>
          <CardDescription>
            Choose how you want to share your content: upload a file, write text, or share a link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Subject Selection */}
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
                  name="uploadType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {uploadTypes.map((type) => (
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

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a descriptive title for your upload"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content Tabs */}
              <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="file" className="flex items-center">
                      <Upload className="mr-2" size={16} />
                      File Upload
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex items-center">
                      <FileText className="mr-2" size={16} />
                      Text Content
                    </TabsTrigger>
                    <TabsTrigger value="link" className="flex items-center">
                      <Link className="mr-2" size={16} />
                      External Link
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="file" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supported formats: PDF, DOC, DOCX, PNG, JPG (Max 10MB)
                      </p>
                      <Button type="button" variant="outline" className="mt-4">
                        Choose File
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="text">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write your content here..."
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="link">
                    <FormField
                      control={form.control}
                      name="externalLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>External Link</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/resource"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional details about your upload..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="flex items-center"
                >
                  {uploadMutation.isPending ? (
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

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Uploads</CardTitle>
          <CardDescription>
            Track the status of your submitted materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Upload className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No uploads yet. Submit your first material above!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}