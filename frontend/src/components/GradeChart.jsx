import { useState } from "react";

const CHART_HEIGHT = 168;

// Single-series column chart of how many results fall in each grade.
// One hue (no legend needed), value on each cap, hover tooltip with share of total.
export default function GradeChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);

  if (total === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-sm text-slate-400">
        No results uploaded yet.
      </div>
    );
  }

  return (
    <div>
      <div
        role="img"
        aria-label={`Grade distribution: ${data.map((d) => `${d.grade} ${d.count}`).join(", ")}`}
        className="relative grid grid-cols-6 border-b border-slate-200"
        style={{ height: CHART_HEIGHT + 24 }}
      >
        {data.map((d) => {
          const height = d.count === 0 ? 0 : Math.max((d.count / max) * CHART_HEIGHT, 4);
          const share = Math.round((d.count / total) * 100);
          const isHovered = hovered === d.grade;
          return (
            <div
              key={d.grade}
              className="relative flex flex-col items-center justify-end"
              onMouseEnter={() => setHovered(d.grade)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHovered && (
                <div
                  className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg bg-navy-950 px-2.5 py-1.5 text-xs text-white shadow-lg"
                  style={{ bottom: height + 30 }}
                >
                  <span className="font-semibold">Grade {d.grade}</span>
                  <span className="text-slate-300">
                    {" "}
                    · {d.count.toLocaleString()} {d.count === 1 ? "result" : "results"} ({share}%)
                  </span>
                </div>
              )}
              <span className="mb-1.5 text-xs font-medium tabular-nums text-slate-600">{d.count.toLocaleString()}</span>
              <div
                className={`w-6 rounded-t transition-colors ${isHovered ? "bg-brand-600" : "bg-brand-500"}`}
                style={{ height }}
              />
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-6 pt-2 text-center text-xs font-medium text-slate-500">
        {data.map((d) => (
          <span key={d.grade}>{d.grade}</span>
        ))}
      </div>
    </div>
  );
}
