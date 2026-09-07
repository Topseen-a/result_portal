import { listResults } from "../api/endpoints";
import { useFetch } from "../utils/useFetch";
import { Card, SectionHeader, Badge, Spinner, EmptyState } from "./ui";

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
        ) : results && results.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Grade</th>
                <th className="px-5 py-3 font-medium">Grade Point</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-700">{r.course}</td>
                  <td className="px-5 py-3 text-slate-600">{r.score}</td>
                  <td className="px-5 py-3 text-slate-600">{r.grade}</td>
                  <td className="px-5 py-3 text-slate-600">{r.grade_point}</td>
                  <td className="px-5 py-3">
                    <Badge tone={r.is_published ? "published" : "pending"}>
                      {r.is_published ? "Published" : "Pending"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="No published results yet"
            description="Once your lecturer uploads and publishes a score, it will show up here."
          />
        )}
      </Card>
    </div>
  );
}
