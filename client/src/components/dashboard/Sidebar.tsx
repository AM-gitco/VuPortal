import { 
  LayoutDashboard, 
  BookOpen, 
  Upload, 
  MessageSquare, 
  Megaphone, 
  Lightbulb, 
  Bot, 
  TestTube, 
  Award, 
  Library, 
  Users, 
  Info,
  LogOut,
  User,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';
import { useState } from "react";

interface SidebarProps {
  user: any;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

export function Sidebar({ user }: SidebarProps) {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "subjects", label: "My Subjects", icon: BookOpen },
    { id: "upload", label: "Upload Area", icon: Upload },
    { id: "discussions", label: "Public Discussions", icon: MessageSquare },
    { id: "announcements", label: "Important Announcements", icon: Megaphone },
    { id: "solutions", label: "Assignment & GDB Solutions", icon: Lightbulb },
    { id: "ai-chat", label: "Ask AI", icon: Bot },
    { id: "exam-chat", label: "Exam-Time Chat", icon: TestTube, badge: "EXAM" },
    { id: "badges", label: "Badges", icon: Award },
    { id: "resources", label: "Subject Resources", icon: Library },
    { id: "about", label: "About Us / Our Process", icon: Info },
    { id: "team", label: "Our Team & Join Community", icon: Users },
  ];

  const handleLogout = async () => {
    try {
      window.location.href = "/api/logout";
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPathForId = (id: string) => {
    switch (id) {
      case 'dashboard': return '/dashboard/';
      case 'subjects': return '/dashboard/subjects';
      case 'upload': return '/dashboard/upload';
      case 'discussions': return '/dashboard/discussions';
      case 'announcements': return '/dashboard/announcements';
      case 'solutions': return '/dashboard/solutions';
      case 'ai-chat': return '/dashboard/ai-chat';
      case 'badges': return '/dashboard/badges';
      case 'about': return '/dashboard/about';
      default: return '/dashboard/' + id;
    }
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.substring(0, 8) + '****';
    return `${maskedLocal}@${domain}`;
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} z-50`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VU</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <h1 className="font-bold text-gray-900 dark:text-white">VU Portal</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Student Support</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {user?.fullName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {maskEmail(user?.email || '')}
                </p>
                {user?.role === 'admin' && (
                  <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              // Hide exam chat if not enabled
              if (item.id === 'exam-chat') {
                // This would check system settings for exam chat enabled
                return null;
              }

              const currentPath = location.replace('/dashboard', '') || '/';
              const isActive = currentPath === getPathForId(item.id).replace('/dashboard', '');

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(getPathForId(item.id))}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/dashboard/settings')}
              >
                <Settings size={16} className="mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}