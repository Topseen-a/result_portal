import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap a page to restrict it to specific roles, e.g. <RoleRoute allow={["staff", "admin"]}>
export default function RoleRoute({ allow, children }) {
  const { profile } = useAuth();
  if (profile && !allow.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
