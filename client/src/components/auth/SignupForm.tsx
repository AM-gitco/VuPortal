import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Mail, Lock, User, AtSign, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, type InsertUser } from "@shared/schema";

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSwitchToOTP: (email: string) => void;
}

export function SignupForm({ onSwitchToLogin, onSwitchToOTP }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Account Created Successfully",
        description: "Please check your email for verification code.",
      });
      onSwitchToOTP(data.email);
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    signupMutation.mutate(data);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.watch("password"));
  const strengthColors = ["bg-gray-200", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Student Account</h2>
        <p className="text-gray-500">Register with your VU email to get started</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter your full name"
                    icon={<User className="text-gray-400" size={18} />}
                    error={!!form.formState.errors.fullName}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Choose a username"
                    icon={<AtSign className="text-gray-400" size={18} />}
                    error={!!form.formState.errors.username}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      icon={<Lock className="text-gray-400" size={18} />}
                      error={!!form.formState.errors.password}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                {field.value && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 w-1/4 rounded ${
                            level <= passwordStrength ? strengthColors[passwordStrength] : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Password strength: {strengthLabels[passwordStrength]}
                      </p>
                    )}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-start">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              required
            />
            <span className="ml-2 text-sm text-gray-600">
              I agree to the{" "}
              <a href="#" className="text-blue-600 hover:text-purple-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-purple-600">
                Privacy Policy
              </a>
            </span>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? "Creating Account..." : "Create Account"}
            <UserPlus className="ml-2" size={16} />
          </Button>
        </form>
      </Form>

      {/* Back to Login */}
      <div className="mt-6 text-center">
        <span className="text-gray-600">Already have an account? </span>
        <button
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-purple-600 font-semibold transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
