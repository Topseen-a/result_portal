import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { listDepartments, listCourses, listSessions, listMyRegistrations, registerCourse, deleteCourse } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { LEVELS, SEMESTERS, semesterLabel } from "../utils/constants";
import { Card, PageHeader, Button, Select, SearchInput, FilterBar, LoadingBlock, EmptyState, IconButton, Badge, Alert } from "../components/ui";
import { DataTable } from "../components/DataTable";
import { ConfirmDialog } from "../components/Modal";
import CourseFormModal from "../components/CourseFormModal";
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from "../components/icons";

export default function Courses() {
  const { profile } = useAuth();
  const toast = useToast();
  const role = profile?.role;
  const ownDepartment = profile?.staff?.department;
  const isStudent = role === "student";

  const { data: departments, loading: loadingDepts } = useFetch(listDepartments, []);
  const [deptCode, setDeptCode] = useState("");
  const { data: sessions } = useFetch(listSessions, [], { skip: !isStudent });
  const [sessionId, setSessionId] = useState("");
  const { data: myRegistrations, reload: reloadRegistrations } = useFetch(listMyRegistrations, [], { skip: !isStudent });

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | course
  const [deleting, setDeleting] = useState(null);
  const [deleteState, setDeleteState] = useState({ busy: false, error: "" });
  const [registeringCode, setRegisteringCode] = useState(null);

  const {
    data: courses,
    loading: loadingCourses,
    reload: reloadCourses,
  } = useFetch(() => listCourses(deptCode), [deptCode], { skip: !deptCode });

  // Default to the user's own department, otherwise the first one.
  useEffect(() => {
    if (departments?.length && !deptCode) {
      const own = profile?.student?.department || profile?.staff?.department;
      const match = departments.find((d) => d.department_code === own) || departments[0];
      setDeptCode(match.department_code);
    }
  }, [departments, deptCode, profile]);

  useEffect(() => {
    if (sessions?.length && !sessionId) {
      const current = sessions.find((s) => s.is_current) || sessions[sessions.length - 1];
      setSessionId(String(current.id));
    }
  }, [sessions, sessionId]);

  const department = (departments || []).find((d) => d.department_code === deptCode);
  // Admins manage every department; staff only their own.
  const canManage = role === "admin" || (role === "staff" && deptCode === ownDepartment);
  const selectedSession = (sessions || []).find((s) => String(s.id) === sessionId);
  const registeredKeys = new Set((myRegistrations || []).map((r) => `${r.course}:${r.session}`));

  const rows = (courses || []).filter((c) => {
    const term = search.trim().toLowerCase();
    return (
      (!term || c.course_code.toLowerCase().includes(term) || c.title.toLowerCase().includes(term)) &&
      (!level || c.level === level) &&
      (!semester || c.semester === semester)
    );
  });

  async function handleRegister(course) {
    setRegisteringCode(course.course_code);
    try {
      await registerCourse({ course: course.course_code, session: Number(sessionId) });
      toast(`Registered for ${course.course_code}.`);
      reloadRegistrations();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setRegisteringCode(null);
    }
  }

  async function confirmDelete() {
    setDeleteState({ busy: true, error: "" });
    try {
      await deleteCourse(deptCode, deleting.course_code);
      toast(`${deleting.course_code} deleted.`);
      setDeleting(null);
      setDeleteState({ busy: false, error: "" });
      reloadCourses();
    } catch (err) {
      setDeleteState({ busy: false, error: err.message });
    }
  }

  function studentAction(c) {
    const registered = registeredKeys.has(`${c.course_code}:${Number(sessionId)}`);
    if (registered) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
          <CheckIcon width={14} height={14} strokeWidth={2.5} />
          Registered
        </span>
      );
    }
    const wrongSemester = selectedSession && selectedSession.semester !== c.semester;
    return (
      <Button
        variant="outline"
        disabled={!sessionId || wrongSemester || registeringCode === c.course_code}
        title={wrongSemester ? `Only offered in the ${semesterLabel(c.semester)}` : undefined}
        onClick={() => handleRegister(c)}
        className="w-full !px-3 !py-1.5 text-xs sm:w-auto"
      >
        {registeringCode === c.course_code ? "Registering..." : wrongSemester ? "Other semester" : "Register"}
      </Button>
    );
  }

  const columns = [
    {
      key: "course_code",
      header: "Course",
      cell: (c) => (
        <span className="block leading-tight">
          <span className="block font-medium text-slate-800">{c.course_code}</span>
          <span className="text-xs text-slate-500">{c.title}</span>
        </span>
      ),
    },
    { key: "level", header: "Level", cell: (c) => `${c.level}L` },
    { key: "semester", header: "Semester", cell: (c) => <Badge>{semesterLabel(c.semester)}</Badge> },
    { key: "credit_units", header: "Units", align: "right", cellClassName: "tabular-nums text-slate-600" },
    ...(isStudent ? [{ key: "register", header: "", align: "right", hideLabel: true, cell: studentAction }] : []),
    ...(canManage
      ? [
          {
            key: "actions",
            header: "",
            align: "right",
            hideLabel: true,
            cell: (c) => (
              <div className="flex justify-end gap-1">
                <IconButton label={`Edit ${c.course_code}`} onClick={() => setEditing(c)}>
                  <PencilIcon width={16} height={16} />
                </IconButton>
                <IconButton label={`Delete ${c.course_code}`} tone="danger" onClick={() => setDeleting(c)}>
                  <TrashIcon width={16} height={16} />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  const filtered = search || level || semester;

  return (
    <div>
      <PageHeader
        title={isStudent ? "Course catalog" : "Courses"}
        description={
          isStudent
            ? "Browse courses by department and register for the session you're in."
            : "Courses offered by each department."
        }
        actions={
          canManage && (
            <Button onClick={() => setEditing("new")} disabled={!department}>
              <PlusIcon width={16} height={16} />
              New course
            </Button>
          )
        }
      />

      {role === "staff" && department && !canManage && (
        <div className="mb-4">
          <Alert tone="info">
            You're viewing the {department.name} catalog. You can only add or change courses in your own department.
          </Alert>
        </div>
      )}

      <Card flush>
        <FilterBar>
          <Select
            value={deptCode}
            onChange={(e) => setDeptCode(e.target.value)}
            disabled={loadingDepts}
            className="sm:w-60"
            aria-label="Department"
          >
            {(departments || []).map((d) => (
              <option key={d.department_code} value={d.department_code}>
                {d.name}
              </option>
            ))}
          </Select>
          {isStudent && (
            <Select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="sm:w-80"
              aria-label="Registering for session"
            >
              {(sessions || []).map((s) => (
                <option key={s.id} value={s.id}>
                  Session: {s.name} · {semesterLabel(s.semester)}
                </option>
              ))}
            </Select>
          )}
          <SearchInput
            className="sm:w-56"
            placeholder="Search code or title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Select value={level} onChange={(e) => setLevel(e.target.value)} className="sm:w-32" aria-label="Level">
              <option value="">All levels</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l} Level
                </option>
              ))}
            </Select>
            <Select value={semester} onChange={(e) => setSemester(e.target.value)} className="sm:w-44" aria-label="Semester">
              <option value="">All semesters</option>
              {SEMESTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </FilterBar>
        {loadingCourses || loadingDepts ? (
          <LoadingBlock />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            keyField="course_code"
            empty={
              <EmptyState
                title={filtered ? "No courses match these filters" : "No courses in this department yet"}
                description={!filtered && canManage ? "Use “New course” to add the first one." : undefined}
              />
            }
          />
        )}
      </Card>

      {editing && department && (
        <CourseFormModal
          course={editing === "new" ? null : editing}
          department={department}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            toast(message);
            reloadCourses();
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
        title="Delete course?"
        message={
          deleting && (
            <>
              <span className="font-semibold text-slate-800">
                {deleting.course_code} · {deleting.title}
              </span>{" "}
              will be removed. Courses that students have registered for can't be deleted.
            </>
          )
        }
        busy={deleteState.busy}
        error={deleteState.error}
      />
    </div>
  );
}
