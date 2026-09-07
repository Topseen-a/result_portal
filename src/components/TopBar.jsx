import { useAuth } from "../context/AuthContext";
import { SearchIcon, BellIcon } from "./icons";

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function TopBar() {
  const { profile } = useAuth();
  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim() || profile.username
    : "";

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex w-full max-w-sm items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-slate-500">
        <SearchIcon className="shrink-0" width={16} height={16} />
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <BellIcon width={18} height={18} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600">
            {initials(displayName)}
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-800">{displayName}</p>
            <p className="text-xs capitalize text-slate-400">{profile?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
