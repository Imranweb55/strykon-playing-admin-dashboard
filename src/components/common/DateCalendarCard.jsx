import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { toDateKey } from "../../utils/turfRules";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const keyOf = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const formatDate = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Calendar-popup date card: click to open a month calendar and pick any day.
// Controlled - `value` is the selected "YYYY-MM-DD", `onChange` applies a
// pick. Used on the Swimming Pool, Basketball, Pickleball and Cricket pages
// so each one's bookings reload for whichever date is chosen.
const DateCalendarCard = ({ value, onChange, label = "Today's Bookings" }) => {
  const [open, setOpen] = useState(false);
  const [y0, m0] = value.split("-").map(Number);
  const [view, setView] = useState({ y: y0, m: m0 - 1 });

  const todayKey = toDateKey(new Date());
  const isToday = value === todayKey;

  const openCalendar = () => {
    const [y, m] = value.split("-").map(Number);
    setView({ y, m: m - 1 });
    setOpen(true);
  };

  const shiftMonth = (delta) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const pick = (key) => {
    onChange(key);
    setOpen(false);
  };

  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const title = first.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={openCalendar}
        aria-expanded={open}
        aria-label={`Change date - ${label}`}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
            <CalendarDays size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{isToday ? "Today" : "Viewing"}</p>
            <p className="text-xs text-slate-400">{formatDate(value)}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50">
          Change
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close calendar"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 z-50 mt-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:left-auto sm:w-80">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
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
                const selected = key === value;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pick(key)}
                    aria-pressed={selected}
                    className={`flex h-9 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : key === todayKey
                          ? "border-blue-300 text-blue-700 hover:bg-blue-50"
                          : "border-transparent text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            {!isToday && (
              <button
                type="button"
                onClick={() => pick(todayKey)}
                className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Jump to today
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DateCalendarCard;
