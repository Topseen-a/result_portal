import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  listDepartments,
  listCourses,
  listSessions,
  listMyRegistrations,
  registerCourse,
} from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Card, SectionHeader, Button, Select, Alert, Spinner, EmptyState } from "../components/ui";
import { DataTable } from "../components/DataTable";
import { PlusIcon } from "../components/icons";
import AddCourseForm from "../components/AddCourseForm";

export default function Courses() {
  const { profile } = useAuth();
  const isStaffOrAdmin = profile?.role === "staff" || profile?.role === "admin";

  const { data: departments, loading: loadingDepts } = useFetch(listDepartments, []);
  const [deptCode, setDeptCode] = useState("");
  const { data: sessions } = useFetch(listSessions, []);
  const [sessionId, setSessionId] = useState("");
  const { data: myRegistrations, reload: reloadRegistrations } = useFetch(
    listMyRegistrations,
    [],
    { skip: profile?.role !== "student" }
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [registeringCode, setRegisteringCode] = useState(null);
  const [message, setMessage] = useState(null);

  const {
    data: courses,
    loading: loadingCourses,
    reload: reloadCourses,
  } = useFetch(() => listCourses(deptCode), [deptCode], { skip: !deptCode });

  useEffect(() => {
    if (departments && departments.length > 0 && !deptCode) {
      setDeptCode(departments[0].department_code);
    }
  }, [departments, deptCode]);

  useEffect(() => {
    if (sessions && sessions.length > 0 && !sessionId) {
      const current = sessions.find((s) => s.is_current) || sessions[0];
      setSessionId(String(current.id));
    }
  }, [sessions, sessionId]);

  const registeredCodes = new Set((myRegistrations || []).map((r) => r.course));

  const columns = [
    { key: "course_code", header: "Code", cellClassName: "font-medium text-slate-700" },
    { key: "title", header: "Title" },
    { key: "level", header: "Level", cell: (c) => `${c.level}L` },
    { key: "semester", header: "Semester", cellClassName: "capitalize text-slate-600" },
    { key: "credit_units", header: "Units" },
    ...(profile?.role === "student"
      ? [
          {
            key: "actions",
            header: "",
            align: "right",
            hideLabel: true,
            cell: (c) => {
              const isRegistered = registeredCodes.has(c.course_code);
              return (
                <Button
                  variant={isRegistered ? "secondary" : "primary"}
                  disabled={isRegistered || registeringCode === c.course_code}
                  onClick={() => handleRegister(c.course_code)}
                  className="w-full !px-3 !py-1.5 text-xs sm:w-auto"
                >
                  {isRegistered
                    ? "Registered"
                    : registeringCode === c.course_code
                    ? "Registering..."
                    : "Register"}
                </Button>
              );
            },
          },
        ]
      : []),
  ];

  async function handleRegister(courseCode) {
    setMessage(null);
    if (!sessionId) {
      setMessage({ tone: "error", text: "Choose an academic session first." });
      return;
    }
    setRegisteringCode(courseCode);
    try {
      await registerCourse({ course: courseCode, session: Number(sessionId) });
      setMessage({ tone: "success", text: `Registered for ${courseCode}.` });
      reloadRegistrations();
    } catch (err) {
      setMessage({ tone: "error", text: err.message });
    } finally {
      setRegisteringCode(null);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Courses"
        action={
          isStaffOrAdmin && (
            <Button onClick={() => setShowAddForm((v) => !v)} className="!px-3 !py-2">
              <PlusIcon width={16} height={16} />
              {showAddForm ? "Close" : "Add course"}
            </Button>
          )
        }
      />

      {message && (
        <Alert tone={message.tone === "success" ? "success" : "error"}>{message.text}</Alert>
      )}

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Department"
            value={deptCode}
            onChange={(e) => setDeptCode(e.target.value)}
            disabled={loadingDepts}
          >
            {(departments || []).map((d) => (
              <option key={d.department_code} value={d.department_code}>
                {d.department_code} — {d.name}
              </option>
            ))}
          </Select>
          {profile?.role === "student" && (
            <Select label="Registering for session" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              {(sessions || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.semester === "first" ? "First Semester" : "Second Semester"}
                </option>
              ))}
            </Select>
          )}
        </div>
      </Card>

      {isStaffOrAdmin && showAddForm && (
        <AddCourseForm
          departmentCode={deptCode}
          onCreated={() => {
            setShowAddForm(false);
            reloadCourses();
          }}
        />
      )}

      <Card className="overflow-x-auto p-0">
        {loadingCourses ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={courses}
            keyField="course_code"
            empty={
              <EmptyState
                title="No courses in this department yet"
                description={isStaffOrAdmin ? "Use “Add course” to create the first one." : undefined}
              />
            }
          />
        )}
      </Card>
    </div>
  );
}
