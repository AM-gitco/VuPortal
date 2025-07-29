import { BookOpen, Users, Upload, MessageSquare, Award, Zap, Heart, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function About() {
  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Upload & Share",
      description: "Share handouts, notes, guides, past papers, and solutions with the community",
      color: "bg-blue-500"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Discussions",
      description: "Ask questions, start discussions, and help fellow students learn",
      color: "bg-green-500"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Earn Badges",
      description: "Get recognized for your contributions with community badges and achievements",
      color: "bg-yellow-500"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI Assistant",
      description: "Get instant help with VU topics and academic guidance from our AI bot",
      color: "bg-purple-500"
    }
  ];

  const workflow = [
    {
      step: 1,
      title: "Sign Up",
      description: "Create your account with VU email verification"
    },
    {
      step: 2,
      title: "Setup Profile",
      description: "Select your degree program and subjects"
    },
    {
      step: 3,
      title: "Explore Dashboard",
      description: "Access all features from the main dashboard"
    },
    {
      step: 4,
      title: "Contribute",
      description: "Upload materials, join discussions, earn badges"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">About VU Student Portal</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          A comprehensive platform designed to help Virtual University students collaborate, 
          share resources, and support each other in their academic journey.
        </p>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-lg px-4 py-2">
          <Heart className="mr-2" size={16} />
          Built by VU Students, for VU Students
        </Badge>
      </div>

      {/* Mission Statement */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-800 dark:text-blue-200">Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-blue-700 dark:text-blue-300 leading-relaxed">
            To create a supportive, collaborative environment where VU students can easily access study materials, 
            share knowledge, get help with assignments, and build meaningful connections with their peers.
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto text-white mb-4`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">How It Works</CardTitle>
          <CardDescription>
            Simple steps to get started and make the most of VU Student Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What You Can Do */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2" size={24} />
              Academic Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Upload and download handouts, notes, and guides</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Access past papers and guess papers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Share assignment and GDB solutions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Organize content by subject and type</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" size={24} />
              Community Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>Start and participate in discussions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>Get help from AI assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>Earn badges for contributions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>Connect with study groups</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guidelines */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center">
            <Target className="mr-2" size={24} />
            Community Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-amber-800 dark:text-amber-200">
          <p><strong>Be Respectful:</strong> Treat all community members with respect and kindness</p>
          <p><strong>Share Quality Content:</strong> Upload accurate, helpful, and relevant study materials</p>
          <p><strong>Help Others:</strong> Answer questions and provide constructive feedback</p>
          <p><strong>Follow VU Policies:</strong> Respect academic integrity and university guidelines</p>
          <p><strong>Stay On Topic:</strong> Keep discussions focused on VU academics and studies</p>
        </CardContent>
      </Card>

      {/* Admin Approval Process */}
      <Card>
        <CardHeader>
          <CardTitle>Content Approval Process</CardTitle>
          <CardDescription>
            Understanding how content moderation works to maintain quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-semibold">Submit Content</h4>
                <p className="text-gray-600 dark:text-gray-300">Upload materials, solutions, or announcements</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm font-bold text-yellow-600">2</span>
              </div>
              <div>
                <h4 className="font-semibold">Admin Review</h4>
                <p className="text-gray-600 dark:text-gray-300">Admins review content for quality and relevance</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm font-bold text-green-600">3</span>
              </div>
              <div>
                <h4 className="font-semibold">Publication</h4>
                <p className="text-gray-600 dark:text-gray-300">Approved content becomes available to all students</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Support */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Need Help or Have Suggestions?</CardTitle>
          <CardDescription>
            We're here to help make your VU experience better
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            This platform is continuously evolving based on student feedback. 
            If you encounter any issues or have ideas for improvement, please let us know!
          </p>
          <div className="flex justify-center gap-4">
            <Button>Join Our Community</Button>
            <Button variant="outline">Report an Issue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}