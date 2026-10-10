import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, PageHeader, Badge } from "../components/ui";
import { initials } from "../components/Sidebar";
import { fullName, designationLabel, statusLabel } from "../utils/constants";

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value ?? "—"}</span>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <Card className="grid gap-4 md:grid-cols-[220px_1fr] md:gap-8">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-800">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="-my-3.5">{children}</div>
    </Card>
  );
}

export default function Account() {
  const { profile } = useAuth();
  const name = fullName(profile);

  return (
    <div className="max-w-4xl">
      <PageHeader title="Account settings" description="Your profile as it appears across the portal." />

      <div className="space-y-6">
        <Card className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-100 text-lg font-semibold text-brand-600">
            {initials(name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900">{name}</p>
            <p className="truncate text-sm text-slate-500">{profile?.email}</p>
          </div>
          <span className="ml-auto">
            <Badge tone="info">
              <span className="capitalize">{profile?.role}</span>
            </Badge>
          </span>
        </Card>

        <Section title="Profile" description="Contact an administrator to change these details.">
          <Row label="Full name" value={name} />
          <Row label="Username" value={profile?.username} />
          <Row label="Email address" value={profile?.email} />
        </Section>

        {profile?.student && (
          <Section title="Student details">
            <Row label="Matric number" value={<span className="font-mono">{profile.student.matric_number}</span>} />
            <Row label="Department" value={`${profile.student.department_name} (${profile.student.department})`} />
            <Row label="Level" value={`${profile.student.level} Level`} />
            <Row label="Status" value={<Badge tone={profile.student.status}>{statusLabel(profile.student.status)}</Badge>} />
            <Row label="Entry year" value={profile.student.entry_year} />
          </Section>
        )}

        {profile?.staff && (
          <Section title="Staff details">
            <Row label="Department" value={`${profile.staff.department_name} (${profile.staff.department})`} />
            <Row label="Designation" value={designationLabel(profile.staff.designation)} />
          </Section>
        )}

        <Section title="Password" description="Forgotten it, or want a new one? We'll email you a reset link.">
          <Row
            label="Reset your password"
            value={
              <Link to="/forgot-password" state={{ email: profile?.email }} className="font-semibold text-brand-600 hover:text-brand-500">
                Send reset link →
              </Link>
            }
          />
        </Section>
      </div>
    </div>
  );
}
