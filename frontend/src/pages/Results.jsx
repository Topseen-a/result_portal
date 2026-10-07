import { useAuth } from "../context/AuthContext";
import StudentResults from "../components/StudentResults";
import StaffResults from "../components/StaffResults";

export default function Results() {
  const { profile } = useAuth();
  if (profile?.role === "student") return <StudentResults />;
  return <StaffResults />;
}
