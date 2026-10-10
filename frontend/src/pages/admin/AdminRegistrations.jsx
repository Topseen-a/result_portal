import { useState } from "react";
import { listRegistrationsPage, listSessions, dropRegistration } from "../../api/endpoints";
import { useFetch } from "../../utils/useFetch";
import { useDebounce } from "../../utils/useDebounce";
import { useToast } from "../../context/ToastContext";
import { PAGE_SIZE, semesterLabel, formatDate } from "../../utils/constants";
import { Card, PageHeader, Select, Badge, SearchInput, FilterBar, Pagination, LoadingBlock, EmptyState, IconButton } from "../../components/ui";
import { DataTable } from "../../components/DataTable";
import { ConfirmDialog } from "../../components/Modal";
import { TrashIcon } from "../../components/icons";

export default function AdminRegistrations() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [session, setSession] = useState("");
  const debouncedSearch = useDebounce(search);
  const [dropping, setDropping] = useState(null);
  const [dropState, setDropState] = useState({ busy: false, error: "" });

  const { data: sessions } = useFetch(listSessions, []);
  const { data, loading, reload } = useFetch(
    () => listRegistrationsPage({ page, search: debouncedSearch, session }),
    [page, debouncedSearch, session]
  );

  async function confirmDrop() {
    setDropState({ busy: true, error: "" });
    try {
      await dropRegistration(dropping.id);
      toast(`Dropped ${dropping.student.matric_number} from ${dropping.course}.`);
      setDropping(null);
      setDropState({ busy: false, error: "" });
      reload();
    } catch (err) {
      setDropState({ busy: false, error: err.message });
    }
  }

  const columns = [
    {
      key: "student",
      header: "Student",
      cell: (r) => (
        <span className="block leading-tight">
          <span className="block font-medium text-slate-800">{r.student_name || r.student?.matric_number}</span>
          <span className="font-mono text-xs text-slate-400">{r.student?.matric_number}</span>
        </span>
      ),
    },
    {
      key: "course",
      header: "Course",
      cell: (r) => (
        <span className="block leading-tight">
          <span className="block font-medium text-slate-700">{r.course}</span>
          <span className="text-xs text-slate-400">{r.course_title}</span>
        </span>
      ),
    },
    { key: "session", header: "Session", cell: (r) => `${r.session_name} · ${r.session_semester}` },
    {
      key: "has_result",
      header: "Result",
      cell: (r) => <Badge tone={r.has_result ? "published" : "default"}>{r.has_result ? "Graded" : "Not graded"}</Badge>,
    },
    { key: "register_at", header: "Registered", cellClassName: "whitespace-nowrap text-slate-500", cell: (r) => formatDate(r.register_at) },
    {
      key: "actions",
      header: "",
      align: "right",
      hideLabel: true,
      cell: (r) => (
        <div className="flex justify-end">
          <IconButton label="Drop registration" tone="danger" onClick={() => setDropping(r)}>
            <TrashIcon width={16} height={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Course registrations" description="Every course registration across all students and sessions." />

      <Card flush>
        <FilterBar>
          <SearchInput
            className="sm:w-72"
            placeholder="Search students or courses"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            value={session}
            onChange={(e) => {
              setSession(e.target.value);
              setPage(1);
            }}
            className="sm:w-60"
          >
            <option value="">All sessions</option>
            {(sessions || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {semesterLabel(s.semester)}
              </option>
            ))}
          </Select>
        </FilterBar>
        {loading && !data ? (
          <LoadingBlock />
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""}>
            <DataTable
              columns={columns}
              rows={data?.results}
              empty={
                <EmptyState
                  title={debouncedSearch || session ? "No registrations match these filters" : "No registrations yet"}
                />
              }
            />
            <Pagination page={page} pageSize={PAGE_SIZE} count={data?.count ?? 0} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(dropping)}
        onClose={() => {
          setDropping(null);
          setDropState({ busy: false, error: "" });
        }}
        onConfirm={confirmDrop}
        title="Drop this registration?"
        confirmLabel="Drop registration"
        message={
          dropping && (
            <>
              <span className="font-semibold text-slate-800">{dropping.student_name || dropping.student?.matric_number}</span>{" "}
              will be removed from <span className="font-semibold text-slate-800">{dropping.course}</span>.
              {dropping.has_result && (
                <span className="mt-2 block font-medium text-red-600">
                  This registration has a result. Dropping it deletes the result as well.
                </span>
              )}
            </>
          )
        }
        busy={dropState.busy}
        error={dropState.error}
      />
    </div>
  );
}
