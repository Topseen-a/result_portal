import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Registrations from "./pages/Registrations";
import Results from "./pages/Results";
import Gpa from "./pages/Gpa";
import Account from "./pages/Account";

function LoginRoute() {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/create-account" element={<CreateAccount />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route
              path="/registrations"
              element={
                <RoleRoute allow={["student"]}>
                  <Registrations />
                </RoleRoute>
              }
            />
            <Route path="/results" element={<Results />} />
            <Route
              path="/gpa"
              element={
                <RoleRoute allow={["student"]}>
                  <Gpa />
                </RoleRoute>
              }
            />
            <Route path="/account" element={<Account />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
