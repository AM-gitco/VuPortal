import { Award, Star, Users, Upload, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earned: boolean;
  progress?: number;
  requirement: string;
}

export function Badges({ user }: { user: any }) {
  const badges: BadgeInfo[] = [
    {
      id: 'first-upload',
      name: 'First Contributor',
      description: 'Upload your first study material',
      icon: <Upload className="h-6 w-6" />,
      color: 'bg-blue-500',
      earned: false,
      progress: 0,
      requirement: 'Upload 1 study material'
    },
    {
      id: 'helpful-solver',
      name: 'Helpful Solver',
      description: 'Get 10 helpful votes on your solutions',
      icon: <Star className="h-6 w-6" />,
      color: 'bg-yellow-500',
      earned: false,
      progress: 0,
      requirement: 'Receive 10 helpful votes'
    },
    {
      id: 'discussion-starter',
      name: 'Discussion Starter',
      description: 'Start 5 discussions in the community',
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'bg-green-500',
      earned: false,
      progress: 0,
      requirement: 'Start 5 discussions'
    },
    {
      id: 'community-star',
      name: 'Community Star',
      description: 'Get 50 likes across all your contributions',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-purple-500',
      earned: false,
      progress: 0,
      requirement: 'Receive 50 total likes'
    },
    {
      id: 'team-player',
      name: 'Team Player',
      description: 'Help 20 fellow students with solutions',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-indigo-500',
      earned: false,
      progress: 0,
      requirement: 'Help 20 students'
    },
    {
      id: 'knowledge-sharer',
      name: 'Knowledge Sharer',
      description: 'Upload 10 different study materials',
      icon: <Award className="h-6 w-6" />,
      color: 'bg-orange-500',
      earned: false,
      progress: 0,
      requirement: 'Upload 10 materials'
    }
  ];

  const earnedBadges = badges.filter(badge => badge.earned);
  const availableBadges = badges.filter(badge => !badge.earned);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Badges & Achievements</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Earn badges by contributing to the VU community
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{earnedBadges.length}</p>
          <p className="text-sm text-gray-500">Badges Earned</p>
        </div>
      </div>

      {/* Badge Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Badge Progress</CardTitle>
          <CardDescription>
            Complete community activities to earn badges and recognition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-500">
                {earnedBadges.length} of {badges.length} badges earned
              </span>
            </div>
            <Progress value={(earnedBadges.length / badges.length) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Award className="mr-2" size={24} />
            Earned Badges ({earnedBadges.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((badge) => (
              <Card key={badge.id} className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${badge.color} text-white`}>
                      {badge.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{badge.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        ✅ Earned
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{badge.description}</p>
                  <p className="text-sm text-gray-500 mt-2">{badge.requirement}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Badges */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Star className="mr-2" size={24} />
          Available Badges ({availableBadges.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableBadges.map((badge) => (
            <Card key={badge.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${badge.color} text-white opacity-60`}>
                    {badge.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{badge.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      Not Earned
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600 dark:text-gray-300">{badge.description}</p>
                <p className="text-sm text-gray-500">{badge.requirement}</p>
                {typeof badge.progress === 'number' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{badge.progress}%</span>
                    </div>
                    <Progress value={badge.progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Badge Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Categories</CardTitle>
          <CardDescription>
            Different ways to earn recognition in the VU community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Contributor</h3>
              <p className="text-sm text-gray-500">Upload and share study materials</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Communicator</h3>
              <p className="text-sm text-gray-500">Start discussions and help others</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold">Helper</h3>
              <p className="text-sm text-gray-500">Provide helpful solutions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Community</h3>
              <p className="text-sm text-gray-500">Build strong community connections</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      {earnedBadges.length === 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">Start Your Badge Journey!</CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-300">
              Here's how you can earn your first badge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <p className="text-blue-800 dark:text-blue-200">Upload your first study material to earn "First Contributor"</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">2</span>
                </div>
                <p className="text-blue-800 dark:text-blue-200">Start a discussion to work towards "Discussion Starter"</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">3</span>
                </div>
                <p className="text-blue-800 dark:text-blue-200">Help other students with solutions to become a "Helpful Solver"</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="bg-blue-600 hover:bg-blue-700">Upload Material</Button>
              <Button variant="outline" className="border-blue-300 text-blue-600">Start Discussion</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}