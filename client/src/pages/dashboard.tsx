import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { SetupProfile } from "@/components/dashboard/SetupProfile";

export default function Dashboard() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");

  // Check if user needs to set up their profile (degree and subjects)
  // Admin users don't need to set up degree program and subjects
  const needsSetup = user?.role !== "admin" && (!user?.degreeProgram || !user?.subjects?.length);

  if (needsSetup) {
    return <SetupProfile user={user} />;
  }

  return (
    <DashboardContent 
      user={user}
      activePage={activePage}
    />
  );
}