import { useState } from "react";
import { Link } from "react-router-dom";
import { listMyRegistrations, dropRegistration } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/constants";
import { Card, PageHeader, Button, LoadingBlock, EmptyState, Badge, IconButton } from "../components/ui";
import { DataTable } from "../components/DataTable";
import { ConfirmDialog } from "../components/Modal";
import { TrashIcon, PlusIcon } from "../components/icons";

export default function Registrations() {
  const toast = useToast();
  const { data: registrations, loading, reload } = useFetch(listMyRegistrations, []);
  const [dropping, setDropping] = useState(null);
  const [dropState, setDropState] = useState({ busy: false, error: "" });

  async function confirmDrop() {
    setDropState({ busy: true, error: "" });
    try {
      await dropRegistration(dropping.id);
      toast(`Dropped ${dropping.course}.`);
      setDropping(null);
      setDropState({ busy: false, error: "" });
      reload();
    } catch (err) {
      setDropState({ busy: false, error: err.message });
    }
  }

  const columns = [
    {
      key: "course",
      header: "Course",
      cell: (r) => (
        <span className="block leading-tight">
          <span className="block font-medium text-slate-800">{r.course}</span>
          <span className="text-xs text-slate-500">{r.course_title}</span>
        </span>
      ),
    },
    { key: "session", header: "Session", cell: (r) => `${r.session_name} · ${r.session_semester}` },
    {
      key: "has_result",
      header: "Result",
      cell: (r) => <Badge tone={r.has_result ? "published" : "default"}>{r.has_result ? "Graded" : "Awaiting score"}</Badge>,
    },
    { key: "register_at", header: "Registered", cellClassName: "whitespace-nowrap text-slate-500", cell: (r) => formatDate(r.register_at) },
    {
      key: "actions",
      header: "",
      align: "right",
      hideLabel: true,
      cell: (r) =>
        r.has_result ? null : (
          <div className="flex justify-end">
            <IconButton label={`Drop ${r.course}`} tone="danger" onClick={() => setDropping(r)}>
              <TrashIcon width={16} height={16} />
            </IconButton>
          </div>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My registrations"
        description="Courses you've registered for. You can drop a course until it has been graded."
        actions={
          <Button as={Link} to="/courses">
            <PlusIcon width={16} height={16} />
            Register courses
          </Button>
        }
      />

      <Card flush>
        {loading ? (
          <LoadingBlock />
        ) : (
          <DataTable
            columns={columns}
            rows={registrations}
            empty={
              <EmptyState
                title="No course registrations yet"
                description="Browse the course catalog and register for the current session."
                action={
                  <Link to="/courses" className="text-sm font-semibold text-brand-600 hover:text-brand-500">
                    Browse courses →
                  </Link>
                }
              />
            }
          />
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(dropping)}
        onClose={() => {
          setDropping(null);
          setDropState({ busy: false, error: "" });
        }}
        onConfirm={confirmDrop}
        title="Drop this course?"
        confirmLabel="Drop course"
        message={
          dropping && (
            <>
              You'll be removed from{" "}
              <span className="font-semibold text-slate-800">
                {dropping.course} · {dropping.course_title}
              </span>
              . You can register again later if you change your mind.
            </>
          )
        }
        busy={dropState.busy}
        error={dropState.error}
      />
    </div>
  );
}
