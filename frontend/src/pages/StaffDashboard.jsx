import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listMyRegistrations, listResults } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Card, SectionHeader, Badge, Spinner } from "../components/ui";
import { DataTable } from "../components/DataTable";
import MiniCalendar from "../components/MiniCalendar";
import { ChevronRightIcon } from "../components/icons";

const resultColumns = [
  { key: "student", header: "Student", cellClassName: "font-medium text-slate-700" },
  { key: "course", header: "Course" },
  { key: "score", header: "Score" },
  {
    key: "status",
    header: "Status",
    cell: (r) => (
      <Badge tone={r.is_published ? "published" : "pending"}>
        {r.is_published ? "Published" : "Pending"}
      </Badge>
    ),
  },
];

export default function StaffDashboard() {
  const { profile } = useAuth();
  const staff = profile?.staff;

  const { data: registrations, loading: loadingRegs } = useFetch(listMyRegistrations, []);
  const { data: results, loading: loadingResults } = useFetch(listResults, []);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const gradedCount = results?.length ?? 0;
  const ungraded = (registrations?.length ?? 0) - gradedCount;
  const publishedCount = results?.filter((r) => r.is_published).length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-navy-900 to-navy-700 p-6 text-white">
          <p className="text-xs uppercase tracking-wide text-slate-300">{dateLabel}</p>
          <h1 className="mt-1 text-2xl font-semibold">
            Welcome back, {profile?.first_name || profile?.username} 👋
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            {staff ? `${staff.department_name} · ${staff.designation.replace(/_/g, " ")}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">Total registrations</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              {loadingRegs ? "—" : registrations?.length ?? 0}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">Awaiting a score</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              {loadingRegs || loadingResults ? "—" : Math.max(ungraded, 0)}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">Published results</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              {loadingResults ? "—" : publishedCount}
            </p>
          </Card>
        </div>

        <div>
          <SectionHeader
            title="Recently uploaded results"
            action={
              <Link
                to="/results"
                className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500"
              >
                Manage results <ChevronRightIcon width={14} height={14} />
              </Link>
            }
          />
          <Card className="overflow-x-auto p-0">
            {loadingResults ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : (
              <DataTable
                columns={resultColumns}
                rows={results?.slice(0, 6)}
                empty={
                  <div className="px-5 py-10 text-center text-sm text-slate-400">
                    No results uploaded yet.
                  </div>
                }
              />
            )}
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <MiniCalendar />
        </Card>
        <Card>
          <SectionHeader title="Quick links" />
          <div className="space-y-2">
            <Link to="/courses" className="block rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Add a course
            </Link>
            <Link to="/results" className="block rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Upload a result
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
