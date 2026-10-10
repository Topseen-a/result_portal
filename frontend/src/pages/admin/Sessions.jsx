import { useState } from "react";
import { listSessions, createSession, updateSession, deleteSession } from "../../api/endpoints";
import { useFetch } from "../../utils/useFetch";
import { useToast } from "../../context/ToastContext";
import { SEMESTERS, semesterLabel, formatDate } from "../../utils/constants";
import { Card, PageHeader, Button, Input, Select, Alert, LoadingBlock, EmptyState, IconButton, Badge } from "../../components/ui";
import { DataTable } from "../../components/DataTable";
import Modal, { ConfirmDialog } from "../../components/Modal";
import { PlusIcon, PencilIcon, TrashIcon } from "../../components/icons";

const thisYear = new Date().getFullYear();
const EMPTY_FORM = {
  name: `${thisYear}/${thisYear + 1}`,
  year: thisYear,
  semester: "first",
  is_current: false,
  start_date: "",
  end_date: "",
};

function SessionFormModal({ session, onClose, onSaved }) {
  const isEdit = Boolean(session);
  const [form, setForm] = useState(
    session ? { ...session, start_date: session.start_date || "", end_date: session.end_date || "" } : EMPTY_FORM
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      name: form.name,
      year: Number(form.year),
      semester: form.semester,
      is_current: form.is_current,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    try {
      if (isEdit) await updateSession(session.id, payload);
      else await createSession(payload);
      onSaved(isEdit ? "Session updated." : "Session created.");
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
      title={isEdit ? "Edit session" : "New academic session"}
      description="Each academic year has one session per semester."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="session-form" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create session"}
          </Button>
        </>
      }
    >
      <form id="session-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            required
            maxLength={20}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="2025/2026"
          />
          <Input
            label="Start year"
            type="number"
            required
            min={2000}
            max={2100}
            value={form.year}
            onChange={(e) => update("year", e.target.value)}
          />
          <Select label="Semester" value={form.semester} onChange={(e) => update("semester", e.target.value)}>
            {SEMESTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <div className="hidden sm:block" />
          <Input label="Start date" type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} />
          <Input label="End date" type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} />
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
          <input
            type="checkbox"
            checked={form.is_current}
            onChange={(e) => update("is_current", e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-600"
          />
          <span>
            <span className="block text-sm font-medium text-slate-800">Make this the current session</span>
            <span className="block text-xs text-slate-500">
              Students register against the current session. Any other current session is switched off.
            </span>
          </span>
        </label>
      </form>
    </Modal>
  );
}

export default function Sessions() {
  const toast = useToast();
  const { data: sessions, loading, reload } = useFetch(listSessions, []);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteState, setDeleteState] = useState({ busy: false, error: "" });
  const [settingCurrent, setSettingCurrent] = useState(null);

  // Newest first.
  const rows = [...(sessions || [])].sort((a, b) => b.year - a.year || b.semester.localeCompare(a.semester));

  async function makeCurrent(session) {
    setSettingCurrent(session.id);
    try {
      await updateSession(session.id, { is_current: true });
      toast(`${session.name} · ${semesterLabel(session.semester)} is now the current session.`);
      reload();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSettingCurrent(null);
    }
  }

  async function confirmDelete() {
    setDeleteState({ busy: true, error: "" });
    try {
      await deleteSession(deleting.id);
      toast("Session deleted.");
      setDeleting(null);
      setDeleteState({ busy: false, error: "" });
      reload();
    } catch (err) {
      setDeleteState({ busy: false, error: err.message });
    }
  }

  const columns = [
    {
      key: "name",
      header: "Session",
      cell: (s) => (
        <span className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{s.name}</span>
          {s.is_current && <Badge tone="published">Current</Badge>}
        </span>
      ),
    },
    { key: "semester", header: "Semester", cell: (s) => semesterLabel(s.semester) },
    {
      key: "dates",
      header: "Dates",
      cellClassName: "whitespace-nowrap text-slate-500",
      cell: (s) => (s.start_date || s.end_date ? `${formatDate(s.start_date)} – ${formatDate(s.end_date)}` : "Not set"),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      hideLabel: true,
      cell: (s) => (
        <div className="flex items-center justify-end gap-1">
          {!s.is_current && (
            <Button
              variant="ghost"
              className="!px-2.5 !py-1.5 text-xs"
              disabled={settingCurrent === s.id}
              onClick={() => makeCurrent(s)}
            >
              {settingCurrent === s.id ? "Setting..." : "Make current"}
            </Button>
          )}
          <IconButton label="Edit session" onClick={() => setEditing(s)}>
            <PencilIcon width={16} height={16} />
          </IconButton>
          <IconButton label="Delete session" tone="danger" onClick={() => setDeleting(s)}>
            <TrashIcon width={16} height={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  const hasCurrent = rows.some((s) => s.is_current);

  return (
    <div>
      <PageHeader
        title="Academic sessions"
        description="Create sessions for each semester and choose which one is current."
        actions={
          <Button onClick={() => setEditing("new")}>
            <PlusIcon width={16} height={16} />
            New session
          </Button>
        }
      />

      {!loading && rows.length > 0 && !hasCurrent && (
        <div className="mb-4">
          <Alert tone="warning">No session is marked as current. Pick one so students know where to register.</Alert>
        </div>
      )}

      <Card flush>
        {loading ? (
          <LoadingBlock />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            empty={
              <EmptyState
                title="No academic sessions yet"
                description="Create a session so students can register for courses."
              />
            }
          />
        )}
      </Card>

      {editing && (
        <SessionFormModal
          session={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            toast(message);
            reload();
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
        title="Delete session?"
        message={
          deleting && (
            <>
              <span className="font-semibold text-slate-800">
                {deleting.name} · {semesterLabel(deleting.semester)}
              </span>{" "}
              will be removed. Sessions with course registrations can't be deleted.
            </>
          )
        }
        busy={deleteState.busy}
        error={deleteState.error}
      />
    </div>
  );
}
