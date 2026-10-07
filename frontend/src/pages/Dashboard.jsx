import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import StaffDashboard from "./StaffDashboard";
import { Spinner } from "../components/ui";

export default function Dashboard() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  // Admins get the same overview as staff for now - department/session/course
  // management for admins still happens through the Django admin panel.
  if (profile.role === "student") return <StudentDashboard />;
  return <StaffDashboard />;
}
