import { useState } from "react";
import { listMyRegistrations, listSessions, dropRegistration } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Card, SectionHeader, Button, Spinner, EmptyState, Alert } from "../components/ui";
import { DataTable } from "../components/DataTable";
import { TrashIcon } from "../components/icons";
import { Link } from "react-router-dom";

export default function Registrations() {
  const { data: registrations, loading, reload } = useFetch(listMyRegistrations, []);
  const { data: sessions } = useFetch(listSessions, []);
  const [droppingId, setDroppingId] = useState(null);
  const [error, setError] = useState("");

  const sessionById = new Map((sessions || []).map((s) => [s.id, s]));

  async function handleDrop(id) {
    setError("");
    setDroppingId(id);
    try {
      await dropRegistration(id);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setDroppingId(null);
    }
  }

  const columns = [
    {
      key: "course",
      header: "Course",
      cellClassName: "font-medium text-slate-700",
      cell: (r) => `${r.course} — ${r.course_title}`,
    },
    {
      key: "session",
      header: "Session",
      cell: (r) => sessionById.get(r.session)?.name || r.session,
    },
    { key: "session_semester", header: "Semester", cellClassName: "capitalize text-slate-600" },
    {
      key: "register_at",
      header: "Registered on",
      cell: (r) => new Date(r.register_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      hideLabel: true,
      cell: (r) => (
        <Button
          variant="danger"
          className="w-full !px-3 !py-1.5 text-xs sm:w-auto"
          disabled={droppingId === r.id}
          onClick={() => handleDrop(r.id)}
        >
          <TrashIcon width={14} height={14} />
          {droppingId === r.id ? "Dropping..." : "Drop"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="My Registrations"
        action={
          <Link to="/courses" className="text-sm font-semibold text-brand-600 hover:text-brand-500">
            Browse courses
          </Link>
        }
      />

      {error && <Alert>{error}</Alert>}

      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
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
    </div>
  );
}
