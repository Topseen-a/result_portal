import { useState } from "react";
import { listMyRegistrations, listSessions, dropRegistration } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Card, SectionHeader, Button, Spinner, EmptyState, Alert } from "../components/ui";
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
        ) : registrations && registrations.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Session</th>
                <th className="px-5 py-3 font-medium">Semester</th>
                <th className="px-5 py-3 font-medium">Registered on</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => {
                const session = sessionById.get(r.session);
                return (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {r.course} — {r.course_title}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{session?.name || r.session}</td>
                    <td className="px-5 py-3 capitalize text-slate-600">{r.session_semester}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(r.register_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="danger"
                        className="!px-3 !py-1.5 text-xs"
                        disabled={droppingId === r.id}
                        onClick={() => handleDrop(r.id)}
                      >
                        <TrashIcon width={14} height={14} />
                        {droppingId === r.id ? "Dropping..." : "Drop"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="No course registrations yet"
            description="Browse the course catalog and register for the current session."
            action={
              <Link to="/courses" className="text-sm font-semibold text-brand-600 hover:text-brand-500">
                Browse courses →
              </Link>
            }
          />
        )}
      </Card>
    </div>
  );
}
