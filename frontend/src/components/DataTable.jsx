// Renders a real <table> from sm breakpoint up, and a stacked label/value
// card list below it - tables can't shrink to fit a phone screen without
// either clipping columns or shrinking text to the point of being unreadable.
export function DataTable({ columns, rows, keyField = "id", empty }) {
  if (!rows || rows.length === 0) {
    return empty ?? null;
  }

  return (
    <div>
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3 font-medium ${col.align === "right" ? "text-right" : ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]} className="border-b border-slate-50 last:border-0">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-5 py-3 ${col.align === "right" ? "text-right" : ""} ${
                    col.cellClassName || "text-slate-600"
                  }`}
                >
                  {col.cell ? col.cell(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divide-y divide-slate-50 sm:hidden">
        {rows.map((row) => (
          <div key={row[keyField]} className="space-y-2.5 px-4 py-4">
            {columns.map((col) =>
              col.hideLabel ? (
                <div key={col.key} className="pt-1">
                  {col.cell ? col.cell(row) : row[col.key]}
                </div>
              ) : (
                <div key={col.key} className="flex items-center justify-between gap-3">
                  <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {col.header}
                  </span>
                  <span className={`text-right text-sm ${col.cellClassName || "text-slate-700"}`}>
                    {col.cell ? col.cell(row) : row[col.key]}
                  </span>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
