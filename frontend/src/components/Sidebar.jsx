import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { NAV_BY_ROLE } from "./navigation";
import { LogoutIcon } from "./icons";
import { fullName } from "../utils/constants";

const navItemClass = ({ isActive }) =>
  `group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors ${
    isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
  }`;

export function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// Shared nav content rendered by both the desktop sidebar and the mobile drawer.
// `onNavigate` closes the mobile drawer when a link is tapped.
export function SidebarNav({ onNavigate }) {
  const { profile, logout } = useAuth();
  const groups = NAV_BY_ROLE[profile?.role] || [];
  const name = fullName(profile);

  return (
    <>
      <Logo size={32} className="px-2 pb-7" />

      <nav className="flex-1 space-y-6 overflow-y-auto" onClick={onNavigate}>
        {groups.map((group) => (
          <div key={group.section}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={navItemClass}>
                  {({ isActive }) => (
                    <>
                      <Icon className={`shrink-0 ${isActive ? "text-brand-100" : ""}`} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500/25 text-sm font-semibold text-brand-100">
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-white">{name}</p>
          <p className="text-xs capitalize text-slate-400">{profile?.role}</p>
        </div>
        <button
          onClick={logout}
          aria-label="Sign out"
          title="Sign out"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <LogoutIcon width={17} height={17} />
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-navy-950 px-4 py-6 text-white lg:flex">
      <SidebarNav />
    </aside>
  );
}
