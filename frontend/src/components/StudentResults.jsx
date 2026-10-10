import { Link } from "react-router-dom";
import { listResults } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Card, PageHeader, LoadingBlock, EmptyState, Button } from "./ui";
import { DataTable } from "./DataTable";
import { GpaIcon } from "./icons";

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
  { key: "session_name", header: "Session" },
  { key: "score", header: "Score", align: "right", cellClassName: "tabular-nums text-slate-700", cell: (r) => Number(r.score) },
  {
    key: "grade",
    header: "Grade",
    align: "right",
    cell: (r) => (
      <span className="inline-grid h-7 w-7 place-items-center rounded-md bg-slate-100 text-sm font-semibold text-slate-800">
        {r.grade}
      </span>
    ),
  },
  { key: "grade_point", header: "Grade point", align: "right", cellClassName: "tabular-nums text-slate-600" },
];

export default function StudentResults() {
  const { data: results, loading } = useFetch(listResults, []);

  return (
    <div>
      <PageHeader
        title="My results"
        description="Results appear here once your lecturer publishes them."
        actions={
          <Button as={Link} to="/gpa" variant="outline">
            <GpaIcon width={16} height={16} />
            View GPA / CGPA
          </Button>
        }
      />
      <Card flush>
        {loading ? (
          <LoadingBlock />
        ) : (
          <DataTable
            columns={columns}
            rows={results}
            empty={
              <EmptyState
                title="No published results yet"
                description="Once your lecturer uploads and publishes a score, it will show up here."
              />
            }
          />
        )}
      </Card>
    </div>
  );
}
