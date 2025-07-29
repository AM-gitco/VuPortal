import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";

interface AuthFormWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthFormWrapper({ children, className }: AuthFormWrapperProps) {
  return (
    <Card className={cn(
      "w-full max-w-md p-8 bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl",
      className
    )}>
      {/* Mobile VU Branding */}
      <div className="lg:hidden text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-700 to-purple-600 rounded-full mb-4">
          <GraduationCap className="text-white text-2xl" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">VU Portal</h1>
        <p className="text-gray-500 text-sm">Virtual University of Pakistan</p>
      </div>
      {children}
    </Card>
  );
}
