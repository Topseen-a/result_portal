import { CheckIcon } from "./icons";
import Logo from "./Logo";

const FEATURES = [
  "Register for courses each session in a few clicks",
  "See scores and grades the moment they're published",
  "GPA and CGPA calculated for you automatically",
];

// Split-screen shell shared by the sign-in, sign-up and password reset pages:
// a brand panel on large screens, and the form on the right.
export default function AuthLayout({ heading, subheading, panelTitle, panelText, children, footer }) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative hidden w-[46%] max-w-2xl flex-col justify-between overflow-hidden bg-navy-950 p-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-500/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-navy-600/60 blur-3xl"
        />

        <Logo className="relative" />

        <div className="relative max-w-md">
          <h1 className="text-[2rem] font-semibold leading-tight tracking-tight">{panelTitle}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-400">{panelText}</p>
          <ul className="mt-10 space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-100">
                  <CheckIcon width={12} height={12} strokeWidth={2.5} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} Result Portal. All rights reserved.</p>
      </aside>

      <main className="flex flex-1 flex-col bg-[#f6f7fb] lg:bg-white">
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[400px]">
            <Logo className="mb-10 text-slate-900 lg:hidden" />
            <div className="rounded-2xl bg-white p-6 shadow-soft sm:p-8 lg:p-0 lg:shadow-none">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{heading}</h2>
              {subheading && <p className="mt-1.5 text-sm text-slate-500">{subheading}</p>}
              <div className="mt-8">{children}</div>
            </div>
            {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
