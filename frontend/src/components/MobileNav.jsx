import { useEffect } from "react";
import { SidebarNav } from "./Sidebar";
import { CloseIcon } from "./icons";

export default function MobileNav({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />
      <aside className="relative flex h-full w-72 max-w-[85%] flex-col bg-navy-950 px-4 py-6 text-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-slate-300 hover:bg-white/10"
        >
          <CloseIcon width={18} height={18} />
        </button>
        <SidebarNav onNavigate={onClose} />
      </aside>
    </div>
  );
}
