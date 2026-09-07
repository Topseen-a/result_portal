import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listSessions, getGpa, getCgpa } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Card, SectionHeader, Select, Spinner, Alert } from "../components/ui";

export default function Gpa() {
  const { profile } = useAuth();
  const matric = profile?.student?.matric_number;

  const { data: sessions } = useFetch(listSessions, []);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    if (sessions && sessions.length > 0 && !sessionId) {
      const current = sessions.find((s) => s.is_current) || sessions[0];
      setSessionId(String(current.id));
    }
  }, [sessions, sessionId]);

  const {
    data: gpaData,
    loading: loadingGpa,
    error: gpaError,
  } = useFetch(() => getGpa(matric, sessionId), [matric, sessionId], { skip: !matric || !sessionId });

  const { data: cgpaData, loading: loadingCgpa } = useFetch(() => getCgpa(matric), [matric], {
    skip: !matric,
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="GPA / CGPA" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Cumulative GPA</p>
          {loadingCgpa ? (
            <div className="mt-3">
              <Spinner />
            </div>
          ) : (
            <p className="mt-2 text-4xl font-semibold text-slate-800">{cgpaData?.cgpa ?? "—"}</p>
          )}
          <p className="mt-1 text-sm text-slate-400">Across every published result so far</p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Session GPA</p>
          {loadingGpa ? (
            <div className="mt-3">
              <Spinner />
            </div>
          ) : gpaError ? (
            <p className="mt-2 text-sm text-slate-400">No data for this session yet.</p>
          ) : (
            <p className="mt-2 text-4xl font-semibold text-slate-800">{gpaData?.gpa ?? "—"}</p>
          )}
          <div className="mt-3">
            <Select value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="!py-2">
              {(sessions || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.semester === "first" ? "First Semester" : "Second Semester"}
                </option>
              ))}
            </Select>
          </div>
        </Card>
      </div>

      {!matric && (
        <Alert>Your account doesn't have a student profile attached, so GPA can't be calculated.</Alert>
      )}
    </div>
  );
}
