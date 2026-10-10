import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon, SearchIcon, ChevronRightIcon, ChevronDownIcon } from "./icons";

// `flush` drops the padding so tables and toolbars can run edge to edge.
export function Card({ className = "", flush = false, children }) {
  return (
    <div className={`rounded-2xl bg-white shadow-soft ${flush ? "overflow-hidden" : "p-5"} ${className}`}>{children}</div>
  );
}

export function SectionHeader({ title, action }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[15px] font-semibold text-slate-800">{title}</h2>
      {action}
    </div>
  );
}

const badgeStyles = {
  published: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
  graduated: "bg-blue-100 text-blue-700",
  withdrawn: "bg-slate-200 text-slate-600",
  info: "bg-brand-50 text-brand-600",
  default: "bg-slate-100 text-slate-600",
};

export function Badge({ tone = "default", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        badgeStyles[tone] || badgeStyles.default
      }`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500 ${className}`}
    />
  );
}

const alertStyles = {
  error: "bg-red-50 text-red-700 border-red-100",
  success: "bg-green-50 text-green-700 border-green-100",
  warning: "bg-amber-50 text-amber-800 border-amber-100",
  info: "bg-brand-50 text-slate-700 border-brand-100",
};

export function Alert({ tone = "error", children }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-lg border px-3 py-2.5 text-sm ${alertStyles[tone] || alertStyles.error}`}>
      {children}
    </div>
  );
}

export function Button({ as: Component = "button", variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-navy-900 text-white hover:bg-navy-800",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    dangerSolid: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-500 hover:bg-slate-100",
  };
  return <Component className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <input
        className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

// Native <select> for accessibility and mobile pickers, with the browser arrow
// replaced by our own chevron so it sits inside the field like other inputs.
export function Select({ label, error, className = "", children, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <span className="relative block">
        <select
          className={`w-full cursor-pointer appearance-none truncate rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-colors hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon
          width={16}
          height={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </span>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

// Password field with a show/hide toggle. `labelAction` renders on the right of
// the label row (e.g. a "Forgot password?" link).
export function PasswordInput({ label, labelAction, error, className = "", id, ...props }) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div>
      {(label || labelAction) && (
        <div className="mb-1.5 flex items-center justify-between gap-3">
          {label && (
            <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
              {label}
            </label>
          )}
          {labelAction}
        </div>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={`w-full rounded-lg border border-slate-200 py-2.5 pl-3 pr-11 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={inputId}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-slate-400 hover:text-slate-600 focus-visible:text-brand-600 focus-visible:outline-none"
        >
          {visible ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
        </button>
      </div>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </div>
  );
}

// Top of every page: title, one-line description, and actions on the right.
export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <textarea
        className={`w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

export function SearchInput({ className = "", ...props }) {
  return (
    <div className={`relative ${className}`}>
      <SearchIcon
        width={16}
        height={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="search"
        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        {...props}
      />
    </div>
  );
}

// Toolbar row above a table: search and filters.
export function FilterBar({ children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:flex-wrap sm:items-center">
      {children}
    </div>
  );
}

export function Pagination({ page, pageSize, count, onPageChange }) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (count === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:px-5">
      <span>
        <span className="font-medium text-slate-700">{from.toLocaleString()}</span>–
        <span className="font-medium text-slate-700">{to.toLocaleString()}</span> of{" "}
        <span className="font-medium text-slate-700">{count.toLocaleString()}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronRightIcon width={16} height={16} className="rotate-180" />
        </button>
        <span className="px-2 text-xs">
          Page {page} of {pages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronRightIcon width={16} height={16} />
        </button>
      </div>
    </div>
  );
}

export function LoadingBlock({ className = "py-12" }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <Spinner />
    </div>
  );
}

// Small square button holding just an icon, e.g. row actions.
export function IconButton({ label, tone = "default", className = "", children, ...props }) {
  const tones = {
    default: "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
    danger: "text-slate-400 hover:bg-red-50 hover:text-red-600",
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:opacity-40 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
