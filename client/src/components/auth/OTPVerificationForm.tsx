import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { otpVerificationSchema, type OTPVerificationData } from "@shared/schema";
import { useLocation } from "wouter";

interface OTPVerificationFormProps {
  email: string;
  fromSignup?: boolean;
  onSwitchToLogin: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  onSwitchToResetPassword?: (email: string, code: string) => void;
}

export function OTPVerificationForm({ email, fromSignup = false, onSwitchToLogin, onSwitchToSignup, onSwitchToForgotPassword, onSwitchToResetPassword }: OTPVerificationFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<OTPVerificationData>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      email,
      code: "",
    },
  });

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: OTPVerificationData) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.canResetPassword && !fromSignup) {
        // This is from forgot password flow - allow user to reset password
        toast({
          title: "OTP Verified",
          description: "Please set your new password.",
        });
        onSwitchToResetPassword?.(email, form.getValues("code"));
      } else if (fromSignup) {
        // This is from signup flow - proceed to login and then dashboard
        toast({
          title: "Email Verified Successfully",
          description: "Your account has been created. Redirecting to login...",
        });
        
        // Redirect to login page after successful signup and verification
        onSwitchToLogin();
        
        // Note: We can't auto-login because the server doesn't return the password
        // in the verify-otp response, and we don't store it client-side for security reasons
      } else {
        // This is from other flows - proceed to login
        toast({
          title: "Email Verified Successfully",
          description: "You can now login to your account.",
        });
        onSwitchToLogin();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired verification code",
        variant: "destructive",
      });
      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/resend-otp", { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });
      setTimer(300);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
    onError: (error: any) => {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend verification code",
        variant: "destructive",
      });
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (newOtp.every(digit => digit !== "")) {
      const otpCode = newOtp.join("");
      form.setValue("code", otpCode);
      verifyOtpMutation.mutate({ email, code: otpCode });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (canResend && !resendOtpMutation.isPending) {
      resendOtpMutation.mutate();
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Smartphone className="text-green-600" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Verification Code</h2>
        <p className="text-gray-500 mb-2">We've sent a 6-digit code to</p>
        <p className="text-blue-600 font-semibold">{email}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => {})} className="space-y-6">
          <div>
            <FormLabel className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Verification Code
            </FormLabel>
            <div className="flex space-x-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center border border-gray-300 rounded-lg text-xl font-bold focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              ))}
            </div>
            <FormMessage />
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || resendOtpMutation.isPending}
                className={`font-semibold transition-colors ${
                  canResend && !resendOtpMutation.isPending
                    ? "text-purple-600 hover:text-purple-800 cursor-pointer"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {resendOtpMutation.isPending ? "Sending..." : "Resend Code"}
              </button>
            </p>
            {!canResend && (
              <p className="text-gray-400 text-xs">Code expires in {formatTime(timer)}</p>
            )}
          </div>

          <Button
            type="button"
            variant="success"
            className="w-full"
            disabled={verifyOtpMutation.isPending || otp.some(digit => digit === "")}
            onClick={() => {
              const otpCode = otp.join("");
              if (otpCode.length === 6) {
                verifyOtpMutation.mutate({ email, code: otpCode });
              }
            }}
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify Code"}
            <Check className="ml-2" size={16} />
          </Button>
        </form>
      </Form>

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fromSignup ? onSwitchToSignup : onSwitchToForgotPassword}
          className="text-blue-600 hover:text-purple-600 font-semibold transition-colors flex items-center justify-center w-full"
        >
          <ArrowLeft className="mr-2" size={16} />
          {fromSignup ? "Back to Sign Up" : "Back to Reset Password"}
        </button>
      </div>
    </div>
  );
}
