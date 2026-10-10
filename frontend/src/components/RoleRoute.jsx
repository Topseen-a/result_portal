import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingBlock } from "./ui";

// Wrap a page to restrict it to specific roles, e.g. <RoleRoute allow={["staff", "admin"]}>
export default function RoleRoute({ allow, children }) {
  const { profile } = useAuth();
  if (!profile) return <LoadingBlock className="py-20" />;
  if (!allow.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
