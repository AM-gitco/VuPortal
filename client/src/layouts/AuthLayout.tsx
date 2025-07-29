import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';
import { GraduationCap, CheckCircle } from 'lucide-react';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  if (!isLoading && isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side content */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-800 to-purple-900 p-12 flex-col justify-center items-center text-white">
        <div className="max-w-md text-center">
          <GraduationCap size={64} className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Welcome to VU Portal</h1>
          <p className="text-lg mb-6">Your gateway to Virtual University resources, discussions, and academic support.</p>
          <ul className="text-left space-y-2">
            <li className="flex items-center"><CheckCircle size={20} className="mr-2" /> Access course materials</li>
            <li className="flex items-center"><CheckCircle size={20} className="mr-2" /> Join discussions</li>
            <li className="flex items-center"><CheckCircle size={20} className="mr-2" /> Get AI-powered assistance</li>
          </ul>
        </div>
      </div>
      {/* Right side form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white lg:bg-transparent">
        {children}
      </div>
    </div>
  );
}