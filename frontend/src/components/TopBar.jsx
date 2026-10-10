import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoMark } from "./Logo";
import { initials } from "./Sidebar";
import { pageTitle } from "./navigation";
import { MenuIcon, ChevronDownIcon, ChevronRightIcon, SettingsIcon, LogoutIcon } from "./icons";
import { fullName } from "../utils/constants";

function UserMenu() {
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const name = fullName(profile);

  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600">
          {initials(name)}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-semibold text-slate-800">{name}</span>
          <span className="block text-xs capitalize text-slate-400">{profile?.role}</span>
        </span>
        <ChevronDownIcon width={16} height={16} className="hidden text-slate-400 sm:block" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
            <p className="truncate text-xs text-slate-500">{profile?.email}</p>
          </div>
          <div className="p-1.5">
            <Link
              to="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <SettingsIcon width={16} height={16} className="text-slate-400" />
              Account settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogoutIcon width={16} height={16} className="text-slate-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopBar({ onMenuClick }) {
  const { profile } = useAuth();
  const { pathname } = useLocation();
  const current = pageTitle(profile?.role, pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <MenuIcon width={20} height={20} />
        </button>
        <span className="lg:hidden">
          <LogoMark size={28} />
        </span>
        {current && (
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="hidden text-slate-400 sm:inline">{current.section}</span>
            <ChevronRightIcon width={14} height={14} className="hidden shrink-0 text-slate-300 sm:block" />
            <span className="truncate font-medium text-slate-700">{current.label}</span>
          </nav>
        )}
      </div>
      <UserMenu />
    </header>
  );
}
