import { useAuth } from "../context/AuthContext";
import StudentResults from "../components/StudentResults";
import StaffResults from "../components/StaffResults";
import AdminResults from "./admin/AdminResults";

export default function Results() {
  const { profile } = useAuth();
  if (profile?.role === "student") return <StudentResults />;
  if (profile?.role === "admin") return <AdminResults />;
  return <StaffResults />;
}
