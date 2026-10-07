import { useState } from "react";
import { ChevronRightIcon } from "./icons";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  // Convert Sunday(0)-Saturday(6) to Monday-first index
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function MiniCalendar() {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const cells = getMonthGrid(cursor.year, cursor.month);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(delta) {
    setCursor(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  const isToday = (d) =>
    d === today.getDate() && cursor.month === today.getMonth() && cursor.year === today.getFullYear();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => shiftMonth(-1)}
          className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100"
          aria-label="Previous month"
        >
          <ChevronRightIcon className="rotate-180" width={14} height={14} />
        </button>
        <p className="text-sm font-semibold text-slate-700">{monthLabel}</p>
        <button
          onClick={() => shiftMonth(1)}
          className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100"
          aria-label="Next month"
        >
          <ChevronRightIcon width={14} height={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 font-medium text-slate-400">
            {d}
          </span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
              d == null
                ? ""
                : isToday(d)
                ? "bg-navy-900 font-semibold text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {d ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}
