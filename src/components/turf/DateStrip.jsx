import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import MonthCalendar from "./MonthCalendar";
import { formatDateKey, shiftDateKey } from "../../utils/turfRules";

const DAYS_SHOWN = 7;

const parts = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    weekday: date.toLocaleDateString("en-GB", { weekday: "short" }),
    day: d,
    month: date.toLocaleDateString("en-GB", { month: "short" }),
  };
};

// Slide left/right through days (a week at a time) or open the calendar
// popup to jump to any date. Days before `minDate` can never be picked.
const DateStrip = ({ value, onChange, minDate }) => {
  const [windowStart, setWindowStart] = useState(value);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const start = windowStart < minDate ? minDate : windowStart;
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) =>
    shiftDateKey(start, i)
  );
  const inWindow = value >= days[0] && value <= days[DAYS_SHOWN - 1];
  const shown = inWindow ? days : Array.from({ length: DAYS_SHOWN }, (_, i) =>
    shiftDateKey(value, i)
  );

  const slide = (delta) => {
    const base = inWindow ? start : value;
    const next = shiftDateKey(base, delta * DAYS_SHOWN);
    setWindowStart(next < minDate ? minDate : next);
  };

  const pickFromCalendar = (key) => {
    onChange(key);
    setWindowStart(key);
    setCalendarOpen(false);
  };

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          Play date - {formatDateKey(value)}
        </span>
        <button
          type="button"
          onClick={() => setCalendarOpen((o) => !o)}
          aria-expanded={calendarOpen}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <CalendarDays size={14} className="text-amber-500" />
          Open calendar
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Earlier days"
          disabled={shown[0] <= minDate}
          onClick={() => slide(-1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="grid min-w-0 flex-1 grid-cols-7 gap-1.5">
          {shown.map((key) => {
            const p = parts(key);
            const selected = key === value;
            const disabled = key < minDate;
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => onChange(key)}
                className={`flex flex-col items-center rounded-xl border py-2 text-center transition ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : disabled
                      ? "border-transparent text-slate-300"
                      : "border-gray-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <span className="text-[10px] font-medium opacity-80">
                  {p.weekday}
                </span>
                <span className="text-base font-bold leading-tight">
                  {p.day}
                </span>
                <span className="text-[10px] opacity-80">{p.month}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Later days"
          onClick={() => slide(1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600 hover:bg-slate-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {calendarOpen && (
        <>
          <button
            type="button"
            aria-label="Close calendar"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setCalendarOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-[min(340px,100%)] shadow-xl">
            <MonthCalendar
              value={value}
              onChange={pickFromCalendar}
              minDate={minDate}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DateStrip;
