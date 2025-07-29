import { useState } from "react";
import { AuthFormWrapper } from "@/components/auth/AuthFormWrapper";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { OTPVerificationForm } from "@/components/auth/OTPVerificationForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

type AuthView = "login" | "signup" | "forgotPassword" | "otpVerification" | "resetPassword";

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [fromSignup, setFromSignup] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const switchToOTP = (email: string, isFromSignup = false) => {
    setVerificationEmail(email);
    setFromSignup(isFromSignup);
    setCurrentView("otpVerification");
  };

  const switchToResetPassword = (email: string, code: string) => {
    setVerificationEmail(email);
    setOtpCode(code);
    setCurrentView("resetPassword");
  };

  const renderCurrentForm = () => {
    switch (currentView) {
      case "signup":
        return (
          <SignupForm
            onSwitchToLogin={() => setCurrentView("login")}
            onSwitchToOTP={(email) => switchToOTP(email, true)}
          />
        );
      case "forgotPassword":
        return (
          <ForgotPasswordForm
            onSwitchToLogin={() => setCurrentView("login")}
            onSwitchToOTP={switchToOTP}
          />
        );
      case "otpVerification":
        return (
          <OTPVerificationForm
            email={verificationEmail}
            fromSignup={fromSignup}
            onSwitchToLogin={() => setCurrentView("login")}
            onSwitchToSignup={() => setCurrentView("signup")}
            onSwitchToForgotPassword={() => setCurrentView("forgotPassword")}
            onSwitchToResetPassword={switchToResetPassword}
          />
        );
      case "resetPassword":
        return (
          <ResetPasswordForm
            email={verificationEmail}
            otpCode={otpCode}
            onSuccess={() => setCurrentView("login")}
            onBackToLogin={() => setCurrentView("login")}
          />
        );
      default:
        return (
          <LoginForm
            onSwitchToSignup={() => setCurrentView("signup")}
            onSwitchToForgotPassword={() => setCurrentView("forgotPassword")}
            onSwitchToOTP={switchToOTP}
          />
        );
    }
  };

  return (
    <AuthFormWrapper>
      {renderCurrentForm()}
    </AuthFormWrapper>
  );
}
