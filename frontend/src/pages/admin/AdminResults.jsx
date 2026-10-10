import { useState } from "react";
import { listResultsPage, listSessions, getAdminOverview } from "../../api/endpoints";
import { useFetch } from "../../utils/useFetch";
import { useDebounce } from "../../utils/useDebounce";
import { PAGE_SIZE, semesterLabel, formatDate } from "../../utils/constants";
import { Card, PageHeader, Select, Badge, SearchInput, FilterBar, Pagination, LoadingBlock, EmptyState } from "../../components/ui";
import { DataTable } from "../../components/DataTable";
import { AlertIcon } from "../../components/icons";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "true", label: "Published" },
  { value: "false", label: "Pending" },
];

const columns = [
  {
    key: "student",
    header: "Student",
    cell: (r) => (
      <span className="block leading-tight">
        <span className="block font-medium text-slate-800">{r.student_name || r.student}</span>
        <span className="font-mono text-xs text-slate-400">{r.student}</span>
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
  { key: "session_name", header: "Session" },
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
    key: "is_published",
    header: "Status",
    cell: (r) => <Badge tone={r.is_published ? "published" : "pending"}>{r.is_published ? "Published" : "Pending"}</Badge>,
  },
  {
    key: "uploaded_by_name",
    header: "Graded by",
    cell: (r) => (
      <span className="block leading-tight">
        <span className="block text-slate-700">{r.uploaded_by_name || "—"}</span>
        <span className="text-xs text-slate-400">{formatDate(r.updated_at)}</span>
      </span>
    ),
  },
];

export default function AdminResults() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [session, setSession] = useState("");
  const [published, setPublished] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data: sessions } = useFetch(listSessions, []);
  const { data: overview } = useFetch(getAdminOverview, []);
  const { data, loading } = useFetch(
    () => listResultsPage({ page, search: debouncedSearch, session, is_published: published }),
    [page, debouncedSearch, session, published]
  );

  const counts = overview?.counts;
  const tabCount = { "": counts?.results, true: counts?.published_results, false: counts?.pending_results };
  const filtered = debouncedSearch || session || published;

  return (
    <div>
      <PageHeader title="Results" description="Every uploaded result across all departments and sessions." />

      <div className="mb-5 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-slate-600">
        <AlertIcon width={18} height={18} className="mt-0.5 shrink-0 text-brand-600" />
        <p>
          Scores are entered and published by the lecturer who teaches the course. As an admin you can review every
          result here, but you can't enter or change scores.
        </p>
      </div>

      <Card flush>
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-3">
          {STATUS_TABS.map((tab) => {
            const active = published === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setPublished(tab.value);
                  setPage(1);
                }}
                className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${
                  active ? "border-brand-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                {tabCount[tab.value] != null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                      active ? "bg-brand-50 text-brand-600" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tabCount[tab.value].toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
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
                  title={filtered ? "No results match these filters" : "No results uploaded yet"}
                  description={filtered ? undefined : "Results appear here once lecturers grade their students."}
                />
              }
            />
            <Pagination page={page} pageSize={PAGE_SIZE} count={data?.count ?? 0} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
