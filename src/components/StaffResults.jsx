import { useState } from "react";
import { listMyRegistrations, listResults, uploadResult, publishResult } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Card, SectionHeader, Badge, Spinner, EmptyState, Button, Input, Alert } from "./ui";

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
    <tr className="border-b border-slate-50 last:border-0">
      <td className="px-5 py-3 font-medium text-slate-700">{registration.student?.matric_number}</td>
      <td className="px-5 py-3 text-slate-600">{registration.course}</td>
      <td className="px-5 py-3">
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
      </td>
      <td className="px-5 py-3 text-right">
        <Button onClick={submit} disabled={saving} className="!px-3 !py-1.5 text-xs">
          {saving ? "Saving..." : "Save score"}
        </Button>
      </td>
    </tr>
  );
}

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

  return (
    <div className="space-y-8">
      {error && <Alert>{error}</Alert>}

      <div>
        <SectionHeader title="Needs grading" />
        <Card className="overflow-x-auto p-0">
          {loadingRegs || loadingResults ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : ungraded.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {ungraded.map((reg) => (
                  <UngradedRow key={reg.id} registration={reg} onGraded={reloadAll} />
                ))}
              </tbody>
            </table>
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
          ) : results && results.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Grade</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-700">{r.student}</td>
                    <td className="px-5 py-3 text-slate-600">{r.course}</td>
                    <td className="px-5 py-3 text-slate-600">{r.score}</td>
                    <td className="px-5 py-3 text-slate-600">{r.grade}</td>
                    <td className="px-5 py-3">
                      <Badge tone={r.is_published ? "published" : "pending"}>
                        {r.is_published ? "Published" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="secondary"
                        className="!px-3 !py-1.5 text-xs"
                        disabled={publishingId === r.id}
                        onClick={() => togglePublish(r)}
                      >
                        {publishingId === r.id
                          ? "Saving..."
                          : r.is_published
                          ? "Unpublish"
                          : "Publish"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState title="No results uploaded yet" />
          )}
        </Card>
      </div>
    </div>
  );
}
