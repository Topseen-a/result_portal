import { listResults } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Card, SectionHeader, Badge, Spinner, EmptyState } from "./ui";
import { DataTable } from "./DataTable";

const columns = [
  { key: "course", header: "Course", cellClassName: "font-medium text-slate-700" },
  { key: "score", header: "Score" },
  { key: "grade", header: "Grade" },
  { key: "grade_point", header: "Grade Point" },
  {
    key: "status",
    header: "Status",
    cell: (r) => (
      <Badge tone={r.is_published ? "published" : "pending"}>
        {r.is_published ? "Published" : "Pending"}
      </Badge>
    ),
  },
];

export default function StudentResults() {
  const { data: results, loading } = useFetch(listResults, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="My Results" />
      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
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
