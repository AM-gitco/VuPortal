import { DashboardHome } from "./pages/DashboardHome";
import { MySubjects } from "./pages/MySubjects";
import { UploadArea } from "./pages/UploadArea";
import { Solutions } from "./pages/Solutions";
import { Discussions } from "./pages/Discussions";
import { Announcements } from "./pages/Announcements";
import { AiChat } from "./pages/AiChat";
import { Badges } from "./pages/Badges";
import { About } from "./pages/About";

interface DashboardContentProps {
  user: any;
  activePage: string;
}

export function DashboardContent({ user, activePage }: DashboardContentProps) {
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardHome user={user} />;
      case "subjects":
        return <MySubjects user={user} />;
      case "upload":
        return <UploadArea user={user} />;
      case "discussions":
        return <Discussions user={user} />;
      case "announcements":
        return <Announcements user={user} />;
      case "solutions":
        return <Solutions user={user} />;
      case "ai-chat":
        return <AiChat user={user} />;
      case "badges":
        return <Badges user={user} />;
      case "about":
        return <About user={user} />;
      case "team":
        return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Our Team - Coming Soon</h2></div>;
      case "exam-chat":
        return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Exam Chat - Coming Soon</h2></div>;
      case "resources":
        return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Subject Resources - Coming Soon</h2></div>;
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        {renderPage()}
      </div>
    </div>
  );
}