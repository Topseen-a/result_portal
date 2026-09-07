import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  DashboardIcon,
  CoursesIcon,
  RegistrationIcon,
  ResultsIcon,
  GpaIcon,
  SettingsIcon,
  LogoutIcon,
} from "./icons";

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
    isActive
      ? "bg-white/10 text-white"
      : "text-slate-300/80 hover:bg-white/5 hover:text-white"
  }`;

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const role = profile?.role;

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-navy-950 px-4 py-6 text-white md:flex">
      <div className="flex items-center gap-2 px-2 pb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold">
          R
        </div>
        <span className="text-lg font-semibold tracking-tight">Result Portal</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Academic
          </p>
          <div className="space-y-1">
            <NavLink to="/dashboard" className={navItemClass}>
              <DashboardIcon className="shrink-0" />
              Dashboard
            </NavLink>
            <NavLink to="/courses" className={navItemClass}>
              <CoursesIcon className="shrink-0" />
              Courses
            </NavLink>
            {role === "student" && (
              <NavLink to="/registrations" className={navItemClass}>
                <RegistrationIcon className="shrink-0" />
                My Registrations
              </NavLink>
            )}
            <NavLink to="/results" className={navItemClass}>
              <ResultsIcon className="shrink-0" />
              {role === "staff" ? "Manage Results" : "Results"}
            </NavLink>
            {role === "student" && (
              <NavLink to="/gpa" className={navItemClass}>
                <GpaIcon className="shrink-0" />
                GPA / CGPA
              </NavLink>
            )}
          </div>
        </div>

        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Settings
          </p>
          <div className="space-y-1">
            <NavLink to="/account" className={navItemClass}>
              <SettingsIcon className="shrink-0" />
              Account Settings
            </NavLink>
          </div>
        </div>
      </nav>

      <button
        onClick={logout}
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium text-slate-300/80 transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogoutIcon className="shrink-0" />
        Logout
      </button>
    </aside>
  );
}
