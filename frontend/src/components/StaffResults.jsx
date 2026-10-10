import { useState } from "react";
import {
  listMyRegistrations,
  listResults,
  listSessions,
  uploadResult,
  publishResult,
  updateResultScore,
  deleteResult,
} from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate, semesterLabel } from "../utils/constants";
import { Card, PageHeader, Badge, LoadingBlock, EmptyState, Button, SearchInput, FilterBar, Select, Input, Alert, IconButton } from "./ui";
import { DataTable } from "./DataTable";
import Modal, { ConfirmDialog } from "./Modal";
import { PencilIcon, TrashIcon } from "./icons";

function EditScoreModal({ result, onClose, onSaved }) {
  const [score, setScore] = useState(String(Number(result.score)));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = Number(score);
    if (score === "" || Number.isNaN(value) || value < 0 || value > 100) {
      setError("Enter a score from 0 to 100.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const updated = await updateResultScore(result.id, value);
      onSaved(`${result.course} score for ${result.student_name || result.student} changed to ${Number(updated.score)} (${updated.grade}).`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Correct score"
      description={`${result.student_name || result.student} · ${result.course}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-score-form" disabled={saving}>
            {saving ? "Saving..." : "Save score"}
          </Button>
        </>
      }
    >
      <form id="edit-score-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Input
          label="Score"
          type="number"
          min={0}
          max={100}
          step="0.01"
          required
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
        <p className="text-sm text-slate-500">
          Currently <span className="font-medium text-slate-700">{Number(result.score)}</span> (grade {result.grade}). The
          grade is recalculated when you save.
          {result.is_published && " This result is published, so the student will see the new score straight away."}
        </p>
      </form>
    </Modal>
  );
}

function ScoreCell({ registration, onGraded }) {
  const toast = useToast();
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    const value = Number(score);
    if (score === "" || Number.isNaN(value) || value < 0 || value > 100) {
      setError("Enter a score from 0 to 100");
      return;
    }
    setSaving(true);
    try {
      await uploadResult({ registration: registration.id, score: value });
      toast(`Saved ${registration.course} score for ${registration.student_name || registration.student?.matric_number}.`);
      onGraded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-stretch gap-1 sm:items-end">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={100}
          step="0.01"
          inputMode="decimal"
          aria-label={`Score for ${registration.student?.matric_number} in ${registration.course}`}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="0–100"
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-24"
        />
        <Button type="submit" disabled={saving} className="shrink-0 !px-3 !py-1.5 text-xs">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}

const studentCell = (name, matric) => (
  <span className="block leading-tight">
    <span className="block font-medium text-slate-800">{name || matric}</span>
    <span className="font-mono text-xs text-slate-400">{matric}</span>
  </span>
);

const courseCell = (code, title) => (
  <span className="block leading-tight">
    <span className="block font-medium text-slate-700">{code}</span>
    <span className="text-xs text-slate-400">{title}</span>
  </span>
);

function matches(term, ...values) {
  const t = term.trim().toLowerCase();
  return !t || values.some((v) => v?.toLowerCase().includes(t));
}

export default function StaffResults() {
  const toast = useToast();
  const { profile } = useAuth();
  const { data: registrations, loading: loadingRegs, reload: reloadRegs } = useFetch(listMyRegistrations, []);
  const { data: results, loading: loadingResults, reload: reloadResults } = useFetch(listResults, []);
  const { data: sessions } = useFetch(listSessions, []);
  const [tab, setTab] = useState("grade");
  const [search, setSearch] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [course, setCourse] = useState("");
  const [publishingId, setPublishingId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteState, setDeleteState] = useState({ busy: false, error: "" });

  // Course options come from what this department actually has registrations for.
  const courseOptions = [...new Map((registrations || []).map((r) => [r.course, r.course_title])).entries()].sort();

  const inFilters = (sessionOf, courseOf) =>
    (!sessionId || String(sessionOf) === sessionId) && (!course || courseOf === course);

  const ungraded = (registrations || []).filter(
    (r) =>
      !r.has_result &&
      inFilters(r.session, r.course) &&
      matches(search, r.student_name, r.student?.matric_number, r.course)
  );
  const graded = (results || []).filter(
    (r) => inFilters(r.session, r.course) && matches(search, r.student_name, r.student, r.course)
  );
  const pendingCount = (results || []).filter((r) => !r.is_published).length;

  async function confirmDelete() {
    setDeleteState({ busy: true, error: "" });
    try {
      await deleteResult(deleting.id);
      toast(`Deleted ${deleting.course} result for ${deleting.student_name || deleting.student}.`);
      setDeleting(null);
      setDeleteState({ busy: false, error: "" });
      reloadAll();
    } catch (err) {
      setDeleteState({ busy: false, error: err.message });
    }
  }

  function reloadAll() {
    reloadRegs();
    reloadResults();
  }

  async function togglePublish(result) {
    setPublishingId(result.id);
    try {
      await publishResult(result.id, !result.is_published);
      toast(result.is_published ? `${result.course} result unpublished.` : `${result.course} result published to the student.`);
      reloadResults();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setPublishingId(null);
    }
  }

  const ungradedColumns = [
    { key: "student", header: "Student", cell: (r) => studentCell(r.student_name, r.student?.matric_number) },
    { key: "course", header: "Course", cell: (r) => courseCell(r.course, r.course_title) },
    { key: "session", header: "Session", cell: (r) => `${r.session_name} · ${r.session_semester}` },
    { key: "score", header: "Score", align: "right", hideLabel: true, cell: (r) => <ScoreCell registration={r} onGraded={reloadAll} /> },
  ];

  const gradedColumns = [
    { key: "student", header: "Student", cell: (r) => studentCell(r.student_name, r.student) },
    { key: "course", header: "Course", cell: (r) => courseCell(r.course, r.course_title) },
    {
      key: "score",
      header: "Score",
      align: "right",
      cell: (r) => (
        <span className="tabular-nums">
          <span className="font-medium text-slate-800">{Number(r.score)}</span>
          <span className="ml-2 inline-grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
            {r.grade}
          </span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <Badge tone={r.is_published ? "published" : "pending"}>{r.is_published ? "Published" : "Pending"}</Badge>,
    },
    { key: "updated_at", header: "Updated", cellClassName: "whitespace-nowrap text-slate-500", cell: (r) => formatDate(r.updated_at) },
    {
      key: "actions",
      header: "",
      align: "right",
      hideLabel: true,
      cell: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant={r.is_published ? "outline" : "primary"}
            className="flex-1 !px-3 !py-1.5 text-xs sm:flex-none"
            disabled={publishingId === r.id}
            onClick={() => togglePublish(r)}
          >
            {publishingId === r.id ? "Saving..." : r.is_published ? "Unpublish" : "Publish"}
          </Button>
          <IconButton label="Correct score" onClick={() => setEditing(r)}>
            <PencilIcon width={16} height={16} />
          </IconButton>
          <IconButton label="Delete result" tone="danger" onClick={() => setDeleting(r)}>
            <TrashIcon width={16} height={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: "grade", label: "Needs a score", count: (registrations || []).filter((r) => !r.has_result).length },
    { id: "graded", label: "Graded", count: (results || []).length },
  ];
  const loading = tab === "grade" ? loadingRegs : loadingResults;

  return (
    <div>
      <PageHeader
        title="Grade results"
        description={
          pendingCount > 0
            ? `${pendingCount} graded ${pendingCount === 1 ? "result is" : "results are"} not yet visible to students. Publish them when you're ready.`
            : `Enter scores for ${profile?.staff?.department_name || "your department"} courses, then publish them so students can see their grades.`
        }
      />

      <Card flush>
        <div className="flex gap-1 border-b border-slate-100 px-4 pt-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${
                tab === t.id ? "border-brand-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  tab === t.id ? "bg-brand-50 text-brand-600" : "bg-slate-100 text-slate-500"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <FilterBar>
          <SearchInput
            className="sm:w-72"
            placeholder="Search students or courses"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Select value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="sm:w-60" aria-label="Session">
              <option value="">All sessions</option>
              {[...(sessions || [])].reverse().map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {semesterLabel(s.semester)}
                </option>
              ))}
            </Select>
            <Select value={course} onChange={(e) => setCourse(e.target.value)} className="sm:w-56" aria-label="Course">
              <option value="">All courses</option>
              {courseOptions.map(([code, title]) => (
                <option key={code} value={code}>
                  {code} · {title}
                </option>
              ))}
            </Select>
          </div>
        </FilterBar>
        {loading ? (
          <LoadingBlock />
        ) : tab === "grade" ? (
          <DataTable
            columns={ungradedColumns}
            rows={ungraded}
            empty={<EmptyState title={search || sessionId || course ? "No registrations match these filters" : "Every registration has a score"} />}
          />
        ) : (
          <DataTable
            columns={gradedColumns}
            rows={graded}
            empty={<EmptyState title={search || sessionId || course ? "No results match these filters" : "No results uploaded yet"} />}
          />
        )}
      </Card>

      {editing && (
        <EditScoreModal
          result={editing}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            toast(message);
            reloadResults();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => {
          setDeleting(null);
          setDeleteState({ busy: false, error: "" });
        }}
        onConfirm={confirmDelete}
        title="Delete this result?"
        confirmLabel="Delete result"
        message={
          deleting && (
            <>
              The {deleting.course} score of{" "}
              <span className="font-semibold text-slate-800">
                {Number(deleting.score)} ({deleting.grade})
              </span>{" "}
              for {deleting.student_name || deleting.student} will be removed and the registration moves back to
              “Needs a score”.
              {deleting.is_published && " The student will no longer see this result."}
            </>
          )
        }
        busy={deleteState.busy}
        error={deleteState.error}
      />
    </div>
  );
}
