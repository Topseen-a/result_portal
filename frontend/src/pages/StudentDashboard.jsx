import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listMyRegistrations, listResults, listSessions, getCgpa } from "../api/endpoints";
import { useFetch, cardPalette } from "../utils/useFetch";
import { Card, SectionHeader, Badge, EmptyState, Spinner } from "../components/ui";
import { DataTable } from "../components/DataTable";
import MiniCalendar from "../components/MiniCalendar";
import { ChevronRightIcon } from "../components/icons";

const LEVEL_LABEL = { "100": "100 Level", "200": "200 Level", "300": "300 Level", "400": "400 Level", "500": "500 Level" };

const resultColumns = [
  { key: "course", header: "Course", cellClassName: "font-medium text-slate-700" },
  { key: "score", header: "Score", cell: (r) => Number(r.score) },
  { key: "grade", header: "Grade" },
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

export default function StudentDashboard() {
  const { profile } = useAuth();
  const student = profile?.student;

  const { data: registrations, loading: loadingRegs } = useFetch(listMyRegistrations, []);
  const { data: results, loading: loadingResults } = useFetch(listResults, []);
  const { data: sessions } = useFetch(listSessions, []);
  const { data: cgpaData } = useFetch(
    () => getCgpa(student.matric_number),
    [student?.matric_number],
    { skip: !student?.matric_number }
  );

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const sessionById = new Map((sessions || []).map((s) => [s.id, s]));

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-700 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-300">{dateLabel}</p>
            <h1 className="mt-1 text-2xl font-semibold">
              Welcome back, {profile?.first_name || profile?.username} 👋
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {student
                ? `${student.matric_number} · ${student.department_name} · ${LEVEL_LABEL[student.level] || student.level}`
                : "Complete your enrollment to get started."}
            </p>
          </div>
          <div className="flex gap-6 rounded-xl bg-white/10 px-5 py-4">
            <div>
              <p className="text-xs text-slate-300">CGPA</p>
              <p className="text-xl font-semibold">{cgpaData ? cgpaData.cgpa : "—"}</p>
            </div>
            <div className="w-px bg-white/15" />
            <div>
              <p className="text-xs text-slate-300">Registered courses</p>
              <p className="text-xl font-semibold">{registrations?.length ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* Enrolled courses */}
        <div>
          <SectionHeader
            title="Enrolled Courses"
            action={
              <Link to="/registrations" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500">
                View all <ChevronRightIcon width={14} height={14} />
              </Link>
            }
          />
          {loadingRegs ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : registrations && registrations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {registrations.slice(0, 4).map((reg, i) => {
                const palette = cardPalette[i % cardPalette.length];
                const session = sessionById.get(reg.session);
                return (
                  <div
                    key={reg.id}
                    className="rounded-2xl p-4"
                    style={{ backgroundColor: palette.bg, color: palette.text }}
                  >
                    <p className="text-sm font-semibold leading-snug">
                      {reg.course_title} - {reg.course}
                    </p>
                    <p className="mt-3 text-xs opacity-80">{reg.session_semester}</p>
                    {session && <p className="text-xs opacity-80">{session.name}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No courses registered yet"
              description="Browse available courses and register for the current session."
              action={
                <Link to="/courses" className="text-sm font-semibold text-brand-600 hover:text-brand-500">
                  Browse courses →
                </Link>
              }
            />
          )}
        </div>

        {/* Results table */}
        <div>
          <SectionHeader
            title="My Results"
            action={
              <Link to="/results" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500">
                View all <ChevronRightIcon width={14} height={14} />
              </Link>
            }
          />
          <Card flush>
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
                    No published results yet.
                  </div>
                }
              />
            )}
          </Card>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <Card>
          <MiniCalendar />
        </Card>
        <Card>
          <SectionHeader title="Academic Summary" />
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <Badge tone={student?.status || "default"}>{student?.status || "—"}</Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Entry year</dt>
              <dd className="font-medium text-slate-700">{student?.entry_year || "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Level</dt>
              <dd className="font-medium text-slate-700">
                {student ? LEVEL_LABEL[student.level] || student.level : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">CGPA</dt>
              <dd className="font-medium text-slate-700">{cgpaData ? cgpaData.cgpa : "—"}</dd>
            </div>
          </dl>
          <Link
            to="/gpa"
            className="mt-4 flex items-center justify-center gap-1 rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            View GPA by session
          </Link>
        </Card>
      </div>
    </div>
  );
}
