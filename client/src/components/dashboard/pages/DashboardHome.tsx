import { useQuery } from "@tanstack/react-query";
import { Calendar, BookOpen, Upload, Users, TrendingUp, Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardHomeProps {
  user: any;
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.substring(0, 8) + '****';
    return `${maskedLocal}@${domain}`;
  };

  const stats = [
    {
      title: "My Subjects",
      value: user?.subjects?.length || 0,
      icon: BookOpen,
      description: "Enrolled subjects",
      color: "text-blue-600",
    },
    {
      title: "Uploads",
      value: "0", // This would come from API
      icon: Upload,
      description: "Files uploaded",
      color: "text-green-600",
    },
    {
      title: "Discussions", 
      value: "0", // This would come from API
      icon: Users,
      description: "Posts created",
      color: "text-purple-600",
    },
    {
      title: "Badges",
      value: "0", // This would come from API
      icon: TrendingUp,
      description: "Earned badges",
      color: "text-orange-600",
    },
  ];

  const recentActivity = [
    {
      type: "announcement",
      title: "New Assignment Posted",
      description: "CS301 - Data Structures Assignment 2",
      time: "2 hours ago",
      icon: Bell,
    },
    {
      type: "upload",
      title: "Study Material Uploaded",
      description: "CS201 - Programming Fundamentals Notes",
      time: "1 day ago", 
      icon: Upload,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.fullName}!
        </h1>
        <div className="flex items-center space-x-4 text-blue-100">
          <p>{maskEmail(user?.email || '')}</p>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {user?.degreeProgram || 'Setup Required'}
          </Badge>
          {user?.role === 'admin' && (
            <Badge variant="destructive">Admin</Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <Upload className="h-6 w-6 text-blue-600 mb-2" />
                <p className="font-medium">Upload File</p>
                <p className="text-sm text-gray-500">Share resources</p>
              </button>
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="h-6 w-6 text-green-600 mb-2" />
                <p className="font-medium">Join Discussion</p>
                <p className="text-sm text-gray-500">Ask questions</p>
              </button>
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <BookOpen className="h-6 w-6 text-purple-600 mb-2" />
                <p className="font-medium">Study Materials</p>
                <p className="text-sm text-gray-500">Browse resources</p>
              </button>
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <Bell className="h-6 w-6 text-orange-600 mb-2" />
                <p className="font-medium">Announcements</p>
                <p className="text-sm text-gray-500">Stay updated</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}