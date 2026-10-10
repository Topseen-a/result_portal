import { useId } from "react";

// Brand mark: an "R" whose leg rises into a check mark (a verified result),
// on an indigo tile. Keep in sync with public/favicon.svg.
export function LogoMark({ size = 36, className = "" }) {
  const gradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f63e0" />
          <stop offset="1" stopColor="#2a3aa8" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill={`url(#${gradientId})`} />
      <g
        transform="translate(-2.2 0.8)"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13.5 29V11h7a5.5 5.5 0 0 1 0 11h-7M20.5 22l4 5.5L31 16" />
      </g>
    </svg>
  );
}

// Mark plus wordmark. Text color is inherited, so it works on light and dark backgrounds.
export default function Logo({ size = 36, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="text-lg tracking-tight">
        <span className="font-bold">Result</span>
        <span className="font-medium opacity-70"> Portal</span>
      </span>
    </div>
  );
}
