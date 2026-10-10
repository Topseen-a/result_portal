import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdminOverview } from "../api/endpoints";
import { BASE_URL } from "../api/client";
import { useFetch } from "../utils/useFetch";
import { Card, SectionHeader, Spinner, Alert, Button } from "../components/ui";
import { DataTable } from "../components/DataTable";
import GradeChart from "../components/GradeChart";
import MiniCalendar from "../components/MiniCalendar";
import {
  UsersIcon,
  BriefcaseIcon,
  BuildingIcon,
  BookIcon,
  CalendarIcon,
  ExternalLinkIcon,
  ChevronRightIcon,
} from "../components/icons";

// Department, session and user management still lives in the Django admin.
const DJANGO_ADMIN_URL = `${BASE_URL.replace(/\/api\/?$/, "")}/admin`;

const formatNumber = (n) => (n ?? 0).toLocaleString();

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : null;

function StatTile({ icon: Icon, label, value, detail }) {
  return (
    <Card className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:gap-4 sm:p-5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 sm:h-11 sm:w-11">
        <Icon width={20} height={20} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{formatNumber(value)}</p>
        {detail && <p className="mt-0.5 text-xs text-slate-400">{detail}</p>}
      </div>
    </Card>
  );
}

function PublishingCard({ counts }) {
  const { results, published_results: published, pending_results: pending, registrations } = counts;
  const publishedShare = results ? Math.round((published / results) * 100) : 0;
  const gradedShare = registrations ? Math.round((results / registrations) * 100) : 0;

  return (
    <Card className="flex flex-col">
      <h3 className="text-[15px] font-semibold text-slate-800">Result publishing</h3>
      <p className="mt-0.5 text-sm text-slate-500">Uploaded results visible to students</p>

      <p className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
        {publishedShare}
        <span className="text-xl text-slate-400">%</span>
      </p>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={publishedShare}
        aria-label="Share of results published"
      >
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${publishedShare}%` }} />
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            Published
          </dt>
          <dd className="font-medium tabular-nums text-slate-800">{formatNumber(published)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-brand-100" />
            Awaiting publication
          </dt>
          <dd className="font-medium tabular-nums text-slate-800">{formatNumber(pending)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <dt className="text-slate-500">Registrations graded</dt>
          <dd className="font-medium tabular-nums text-slate-800">{gradedShare}%</dd>
        </div>
      </dl>
      <p className="mt-1.5 text-xs text-slate-400">
        {formatNumber(results)} of {formatNumber(registrations)} registrations have a score.
      </p>
    </Card>
  );
}

function CurrentSessionCard({ session }) {
  const start = formatDate(session?.start_date);
  const end = formatDate(session?.end_date);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-slate-800">Academic session</h3>
        {session?.is_current && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Current
          </span>
        )}
      </div>
      {session ? (
        <div className="mt-4 flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
            <CalendarIcon width={20} height={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{session.name}</p>
            <p className="text-sm text-slate-500">{session.semester}</p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No academic session has been created yet.</p>
      )}
      {session && (start || end) && (
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {start ?? "Not set"} – {end ?? "Not set"}
        </p>
      )}
      {session && !session.is_current && (
        <p className="mt-3 text-xs text-amber-700">
          No session is marked as current. Students register against the latest one.
        </p>
      )}
    </Card>
  );
}

const quickActionClass =
  "flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-200 hover:bg-slate-50";

const QUICK_ACTIONS = [
  { label: "Manage departments", to: "/departments" },
  { label: "Manage sessions", to: "/sessions" },
  { label: "Add a course", to: "/courses" },
  { label: "Add a staff member", to: "/staff" },
  { label: "Find a student", to: "/students" },
];

function QuickActions() {
  return (
    <Card>
      <SectionHeader title="Quick actions" />
      <div className="space-y-2">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.to} to={action.to} className={quickActionClass}>
            {action.label}
            <ChevronRightIcon width={16} height={16} className="text-slate-400" />
          </Link>
        ))}
      </div>
      <a
        href={`${DJANGO_ADMIN_URL}/`}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600"
      >
        Open the Django admin
        <ExternalLinkIcon width={13} height={13} />
      </a>
    </Card>
  );
}

const departmentColumns = [
  {
    key: "name",
    header: "Department",
    cellClassName: "text-slate-700",
    cell: (d) => (
      <span>
        <span className="font-medium text-slate-800">{d.name}</span>
        <span className="ml-2 text-xs text-slate-400">{d.department_code}</span>
      </span>
    ),
  },
  { key: "students", header: "Students", align: "right", cellClassName: "tabular-nums text-slate-600" },
  { key: "staff", header: "Staff", align: "right", cellClassName: "tabular-nums text-slate-600" },
  { key: "courses", header: "Courses", align: "right", cellClassName: "tabular-nums text-slate-600" },
];

const registrationColumns = [
  {
    key: "student",
    header: "Student",
    cell: (r) => (
      <span className="block leading-tight">
        <span className="block font-medium text-slate-800">{r.student_name || r.student}</span>
        <span className="text-xs text-slate-400">{r.student}</span>
      </span>
    ),
  },
  {
    key: "course",
    header: "Course",
    cell: (r) => (
      <span title={r.course_title}>
        <span className="font-medium text-slate-700">{r.course}</span>
        <span className="hidden text-slate-400 lg:inline"> · {r.course_title}</span>
      </span>
    ),
  },
  { key: "session", header: "Session" },
  {
    key: "register_at",
    header: "Date",
    align: "right",
    cellClassName: "whitespace-nowrap text-slate-500",
    cell: (r) => formatDate(r.register_at),
  },
];

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { data, loading, error, reload } = useFetch(getAdminOverview, []);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading && !data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <Alert>{error.message || "Could not load the dashboard."}</Alert>
        <Button variant="secondary" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  const { counts, current_session: session, grade_distribution, departments, recent_registrations } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-700 p-6 text-white sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-300">{dateLabel}</p>
          <h1 className="mt-1 text-2xl font-semibold">Welcome back, {profile?.first_name || profile?.username}</h1>
          <p className="mt-2 text-sm text-slate-300">Here's how the portal is doing today.</p>
        </div>
        {session && (
          <div className="rounded-xl bg-white/10 px-4 py-3 text-sm">
            <p className="text-xs text-slate-300">{session.is_current ? "Current session" : "Latest session"}</p>
            <p className="font-semibold">
              {session.name} · {session.semester}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile
          icon={UsersIcon}
          label="Students"
          value={counts.students}
          detail={`${formatNumber(counts.active_students)} active`}
        />
        <StatTile icon={BriefcaseIcon} label="Academic staff" value={counts.staff} />
        <StatTile icon={BuildingIcon} label="Departments" value={counts.departments} />
        <StatTile
          icon={BookIcon}
          label="Courses"
          value={counts.courses}
          detail={`${formatNumber(counts.registrations)} registrations`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            <Card>
              <h3 className="text-[15px] font-semibold text-slate-800">Grade distribution</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                All {formatNumber(counts.results)} uploaded results, published and pending
              </p>
              <div className="mt-6">
                <GradeChart data={grade_distribution} />
              </div>
            </Card>
            <PublishingCard counts={counts} />
          </div>

          <div>
            <SectionHeader title="Departments" />
            <Card flush>
              <DataTable
                columns={departmentColumns}
                rows={departments}
                keyField="department_code"
                empty={<div className="px-5 py-10 text-center text-sm text-slate-400">No departments yet.</div>}
              />
            </Card>
          </div>

          <div>
            <SectionHeader
              title="Recent course registrations"
              action={
                <Link
                  to="/results"
                  className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500"
                >
                  View results <ChevronRightIcon width={14} height={14} />
                </Link>
              }
            />
            <Card flush>
              <DataTable
                columns={registrationColumns}
                rows={recent_registrations}
                empty={
                  <div className="px-5 py-10 text-center text-sm text-slate-400">No course registrations yet.</div>
                }
              />
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <CurrentSessionCard session={session} />
          <QuickActions />
          <Card>
            <MiniCalendar />
          </Card>
        </div>
      </div>
    </div>
  );
}
