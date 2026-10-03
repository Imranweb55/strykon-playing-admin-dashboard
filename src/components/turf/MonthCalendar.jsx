import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { toDateKey } from "../../utils/turfRules";
import { useEffect } from "react";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const keyOf = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

// Month calendar. `value` is "YYYY-MM-DD". Days that already have bookings
// show a dot + count (loaded from the database for the visible month).
// minDate (optional) disables earlier days.
const MonthCalendar = ({ value, onChange, minDate, refreshKey = 0 }) => {
  const [y0, m0] = value.split("-").map(Number);
  const [view, setView] = useState({ y: y0, m: m0 - 1 });
  const [counts, setCounts] = useState({ month: "", data: {} });

  // Cannot page back into months that are entirely before minDate
  const prevMonthLastDay = toDateKey(new Date(view.y, view.m, 0));
  const prevDisabled = Boolean(minDate) && prevMonthLastDay < minDate;

  const monthStr = `${view.y}-${String(view.m + 1).padStart(2, "0")}`;

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/turf-bookings/month", { params: { month: monthStr } })
      .then(({ data }) => {
        if (!cancelled) setCounts({ month: monthStr, data: data.counts });
      })
      .catch(() => {
        if (!cancelled) setCounts({ month: monthStr, data: {} });
      });
    return () => {
      cancelled = true;
    };
  }, [monthStr, refreshKey]);

  const shiftMonth = (delta) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayKey = toDateKey(new Date());
  const title = first.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const data = counts.month === monthStr ? counts.data : {};

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={prevDisabled}
          aria-label="Previous month"
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-slate-800">{title}</span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK.map((w) => (
          <span key={w} className="py-1 text-[10px] font-semibold text-slate-400">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />;
          const key = keyOf(view.y, view.m, d);
          const disabled = minDate && key < minDate;
          const selected = key === value;
          const count = data[key] || 0;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(key)}
              aria-pressed={selected}
              aria-label={`${key}${count ? `, ${count} bookings` : ""}`}
              className={`relative flex h-11 flex-col items-center justify-center rounded-lg border text-sm font-semibold transition ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : disabled
                    ? "cursor-not-allowed border-transparent text-slate-300"
                    : key === todayKey
                      ? "border-blue-300 text-blue-700 hover:bg-blue-50"
                      : "border-transparent text-slate-700 hover:bg-slate-50"
              }`}
            >
              {d}
              {count > 0 && (
                <span
                  className={`text-[9px] font-bold leading-none ${
                    selected ? "text-blue-100" : "text-amber-600"
                  }`}
                >
                  {count} booked
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
