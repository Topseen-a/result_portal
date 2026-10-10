import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Registrations from "./pages/Registrations";
import Results from "./pages/Results";
import Gpa from "./pages/Gpa";
import Account from "./pages/Account";
import Departments from "./pages/admin/Departments";
import Sessions from "./pages/admin/Sessions";
import Students from "./pages/admin/Students";
import Staff from "./pages/admin/Staff";
import AdminRegistrations from "./pages/admin/AdminRegistrations";
import StudentLookup from "./pages/StudentLookup";

function LoginRoute() {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

function RegistrationsRoute() {
  const { profile } = useAuth();
  return profile?.role === "admin" ? <AdminRegistrations /> : <Registrations />;
}

const only = (roles, page) => <RoleRoute allow={roles}>{page}</RoleRoute>;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/registrations" element={only(["student", "admin"], <RegistrationsRoute />)} />
              <Route path="/results" element={<Results />} />
              <Route path="/gpa" element={only(["student"], <Gpa />)} />
              <Route path="/account" element={<Account />} />
              <Route path="/student-lookup" element={only(["staff"], <StudentLookup />)} />

              <Route path="/departments" element={only(["admin"], <Departments />)} />
              <Route path="/sessions" element={only(["admin"], <Sessions />)} />
              <Route path="/students" element={only(["admin"], <Students />)} />
              <Route path="/staff" element={only(["admin"], <Staff />)} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
