import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import StaffDashboard from "./StaffDashboard";
import AdminDashboard from "./AdminDashboard";
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

  if (profile.role === "student") return <StudentDashboard />;
  if (profile.role === "admin") return <AdminDashboard />;
  return <StaffDashboard />;
}
