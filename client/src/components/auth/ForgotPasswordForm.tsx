import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Mail, ArrowLeft, Send, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { forgotPasswordSchema, type ForgotPasswordData } from "@shared/schema";

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onSwitchToOTP: (email: string) => void;
}

export function ForgotPasswordForm({ onSwitchToLogin, onSwitchToOTP }: ForgotPasswordFormProps) {
  const { toast } = useToast();

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reset Code Sent",
        description: "Please check your email for the password reset code.",
      });
      onSwitchToOTP(data.email);
    },
    onError: (error: any) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset code",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForgotPasswordData) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
        <p className="text-gray-500">Enter your VU email to receive password reset instructions</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">VU Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="student@vu.edu.pk"
                    icon={<Mail className="text-gray-400" size={18} />}
                    error={!!form.formState.errors.email}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="accent"
            className="w-full"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Code"}
            <Send className="ml-2" size={16} />
          </Button>
        </form>
      </Form>

      {/* Back to Login */}
      <div className="mt-6 text-center">
        <button
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-purple-600 font-semibold transition-colors flex items-center justify-center w-full"
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to Login
        </button>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Info className="text-blue-600 mr-2 mt-1" size={18} />
          <div className="text-sm text-blue-600">
            <p className="font-medium mb-1">Need help?</p>
            <p>Contact VU IT support at support@vu.edu.pk or call +92-42-111-880-880</p>
          </div>
        </div>
      </div>
    </div>
  );
}
