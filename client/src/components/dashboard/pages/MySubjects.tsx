import { BookOpen, Clock, Users, FileText, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function MySubjects({ user }: { user: any }) {
  const subjects = user?.subjects || [];
  const degreeProgram = user?.degreeProgram || "Not Set";

  const getSubjectCode = (subject: string) => {
    const match = subject.match(/^([A-Z]{2,4}\d{3})/);
    return match ? match[1] : subject.substring(0, 6);
  };

  const getSubjectName = (subject: string) => {
    const parts = subject.split(" - ");
    return parts.length > 1 ? parts[1] : subject;
  };

  const mockSubjectData = {
    "CS201": { 
      progress: 75, 
      assignments: 3, 
      resources: 12, 
      discussions: 8,
      color: "bg-blue-500"
    },
    "CS301": { 
      progress: 60, 
      assignments: 2, 
      resources: 8, 
      discussions: 5,
      color: "bg-green-500"
    },
    "MTH601": { 
      progress: 45, 
      assignments: 1, 
      resources: 15, 
      discussions: 12,
      color: "bg-purple-500"
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Subjects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {degreeProgram} • {subjects.length} subjects enrolled
          </p>
        </div>
        <Button variant="outline">
          <BookOpen className="mr-2" size={16} />
          Manage Subjects
        </Button>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Subjects Selected
            </h3>
            <p className="text-gray-500 mb-4">
              You haven't selected any subjects yet. Complete your profile setup to get started.
            </p>
            <Button>Complete Setup</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject: string, index: number) => {
            const code = getSubjectCode(subject);
            const name = getSubjectName(subject);
            const data = mockSubjectData[code as keyof typeof mockSubjectData] || {
              progress: Math.floor(Math.random() * 100),
              assignments: Math.floor(Math.random() * 5),
              resources: Math.floor(Math.random() * 20),
              discussions: Math.floor(Math.random() * 15),
              color: "bg-gray-500"
            };

            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-3 h-3 rounded-full ${data.color}`}></div>
                    <Badge variant="secondary">{code}</Badge>
                  </div>
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <CardDescription>Progress: {data.progress}%</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={data.progress} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{data.assignments} Assignments</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{data.resources} Resources</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{data.discussions} Discussions</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="mr-2 h-4 w-4 text-gray-500" />
                      <span>0 Badges</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Resources
                    </Button>
                    <Button size="sm" className="flex-1">
                      Join Discussion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Total Subjects</p>
                  <p className="text-lg font-semibold">{subjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Active Assignments</p>
                  <p className="text-lg font-semibold">6</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Total Resources</p>
                  <p className="text-lg font-semibold">35</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Badges Earned</p>
                  <p className="text-lg font-semibold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}