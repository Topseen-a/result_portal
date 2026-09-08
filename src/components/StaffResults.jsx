import { useState } from "react";
import { listMyRegistrations, listResults, uploadResult, publishResult } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Card, SectionHeader, Badge, Spinner, EmptyState, Button, Input, Alert } from "./ui";
import { DataTable } from "./DataTable";

function UngradedRow({ registration, onGraded }) {
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (score === "" || Number.isNaN(Number(score))) {
      setError("Enter a score");
      return;
    }
    setSaving(true);
    try {
      await uploadResult({ registration: registration.id, score: Number(score) });
      onGraded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 border-b border-slate-50 px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-3">
      <div className="flex items-center justify-between gap-3 sm:w-36 sm:shrink-0 sm:justify-start">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:hidden">
          Student
        </span>
        <span className="font-medium text-slate-700">{registration.student?.matric_number}</span>
      </div>
      <div className="flex items-center justify-between gap-3 sm:w-28 sm:shrink-0 sm:justify-start">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:hidden">
          Course
        </span>
        <span className="text-slate-600">{registration.course}</span>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-1 sm:justify-start">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:hidden">
          Score
        </span>
        <div>
          <Input
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="!py-1.5 w-24"
            placeholder="0-100"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </div>
      <Button onClick={submit} disabled={saving} className="w-full !px-3 !py-1.5 text-xs sm:w-auto">
        {saving ? "Saving..." : "Save score"}
      </Button>
    </div>
  );
}

const gradedColumns = [
  { key: "student", header: "Student", cellClassName: "font-medium text-slate-700" },
  { key: "course", header: "Course" },
  { key: "score", header: "Score" },
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

export default function StaffResults() {
  const { data: registrations, loading: loadingRegs, reload: reloadRegs } = useFetch(
    listMyRegistrations,
    []
  );
  const { data: results, loading: loadingResults, reload: reloadResults } = useFetch(
    listResults,
    []
  );
  const [error, setError] = useState("");
  const [publishingId, setPublishingId] = useState(null);

  const gradedRegistrationIds = new Set((results || []).map((r) => r.registration));
  const ungraded = (registrations || []).filter((r) => !gradedRegistrationIds.has(r.id));

  function reloadAll() {
    reloadRegs();
    reloadResults();
  }

  async function togglePublish(result) {
    setError("");
    setPublishingId(result.id);
    try {
      await publishResult(result.id, !result.is_published);
      reloadResults();
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishingId(null);
    }
  }

  const columns = [
    ...gradedColumns,
    {
      key: "actions",
      header: "",
      align: "right",
      hideLabel: true,
      cell: (r) => (
        <Button
          variant="secondary"
          className="w-full !px-3 !py-1.5 text-xs sm:w-auto"
          disabled={publishingId === r.id}
          onClick={() => togglePublish(r)}
        >
          {publishingId === r.id ? "Saving..." : r.is_published ? "Unpublish" : "Publish"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {error && <Alert>{error}</Alert>}

      <div>
        <SectionHeader title="Needs grading" />
        <Card className="overflow-hidden p-0">
          {loadingRegs || loadingResults ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : ungraded.length > 0 ? (
            <div>
              {ungraded.map((reg) => (
                <UngradedRow key={reg.id} registration={reg} onGraded={reloadAll} />
              ))}
            </div>
          ) : (
            <EmptyState title="All registrations are graded" />
          )}
        </Card>
      </div>

      <div>
        <SectionHeader title="Graded results" />
        <Card className="overflow-x-auto p-0">
          {loadingResults ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : (
            <DataTable columns={columns} rows={results} empty={<EmptyState title="No results uploaded yet" />} />
          )}
        </Card>
      </div>
    </div>
  );
}
