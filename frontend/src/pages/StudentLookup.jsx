import { useState } from "react";
import { getCgpa } from "../api/endpoints";
import { statusLabel } from "../utils/constants";
import { Card, PageHeader, Button, Alert, Badge, EmptyState } from "../components/ui";
import { DataTable } from "../components/DataTable";
import { initials } from "../components/Sidebar";
import { SearchIcon } from "../components/icons";

const sessionColumns = [
  { key: "name", header: "Session", cell: (s) => `${s.name} · ${s.semester}` },
  { key: "courses", header: "Courses", align: "right", cellClassName: "tabular-nums text-slate-600" },
  { key: "units", header: "Credit units", align: "right", cellClassName: "tabular-nums text-slate-600" },
  { key: "gpa", header: "GPA", align: "right", cellClassName: "tabular-nums font-semibold text-slate-800" },
];

export default function StudentLookup() {
  const [matric, setMatric] = useState("");
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = matric.trim().toUpperCase();
    if (!value) return;
    setError("");
    setLoading(true);
    try {
      setRecord(await getCgpa(value));
    } catch (err) {
      setRecord(null);
      setError(err.status === 404 ? `No student has the matric number ${value}.` : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Student lookup"
        description="Check a student's GPA and CGPA by matric number. Only published results are counted."
      />

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Matric number</span>
            <SearchIcon
              width={16}
              height={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={matric}
              onChange={(e) => setMatric(e.target.value)}
              placeholder="Matric no., e.g. STU20254821"
              autoFocus
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 font-mono text-sm uppercase text-slate-800 outline-none placeholder:font-sans placeholder:normal-case placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <Button type="submit" disabled={loading || !matric.trim()}>
            {loading ? "Looking up..." : "Look up"}
          </Button>
        </form>
        {error && (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        )}
      </Card>

      {record && (
        <div className="mt-6 space-y-6">
          <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 font-semibold text-brand-600">
                {initials(record.student_name)}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="font-semibold text-slate-900">{record.student_name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="font-mono">{record.student}</span> · {record.department_name} · {record.level} Level
                </p>
                <div className="mt-2">
                  <Badge tone={record.status}>{statusLabel(record.status)}</Badge>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-5 py-3 text-left sm:text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">CGPA</p>
              <p className="text-3xl font-semibold tracking-tight text-slate-900">{record.cgpa}</p>
              <p className="text-xs text-slate-400">out of 5.00</p>
            </div>
          </Card>

          <div>
            <h2 className="mb-3 text-[15px] font-semibold text-slate-800">GPA by session</h2>
            <Card flush>
              <DataTable
                columns={sessionColumns}
                rows={record.sessions}
                empty={
                  <EmptyState
                    title="No published results yet"
                    description="GPA appears once this student's results are published."
                  />
                }
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
