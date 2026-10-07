import { useAuth } from "../context/AuthContext";
import { Card, SectionHeader, Badge } from "../components/ui";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value ?? "—"}</span>
    </div>
  );
}

export default function Account() {
  const { profile } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <SectionHeader title="Account Settings" />

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-800">Profile</h3>
        <Row label="Name" value={`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim()} />
        <Row label="Username" value={profile?.username} />
        <Row label="Email" value={profile?.email} />
        <Row label="Role" value={<Badge tone="default">{profile?.role}</Badge>} />
      </Card>

      {profile?.student && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Student details</h3>
          <Row label="Matric number" value={profile.student.matric_number} />
          <Row label="Department" value={`${profile.student.department} — ${profile.student.department_name}`} />
          <Row label="Level" value={`${profile.student.level} Level`} />
          <Row label="Status" value={<Badge tone={profile.student.status}>{profile.student.status}</Badge>} />
          <Row label="Entry year" value={profile.student.entry_year} />
        </Card>
      )}

      {profile?.staff && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Staff details</h3>
          <Row label="Department" value={`${profile.staff.department} — ${profile.staff.department_name}`} />
          <Row label="Designation" value={profile.staff.designation.replace(/_/g, " ")} />
        </Card>
      )}
    </div>
  );
}
