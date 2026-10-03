import { useState } from "react";
import { ChevronLeft, ChevronRight, Moon, Sunrise, Sun, Sunset } from "lucide-react";
import {
  CAPACITY,
  CLOSE_MIN,
  SLOT_MINUTES,
  closureAt,
  describeBooking,
  findClosureConflict,
  findConflict,
  formatMinutes,
  getBlockers,
  getUsage,
} from "../../utils/turfRules";

// 24/7 picker: four 6-hour periods, each shown as two rows of 3 hours.
// Every row is one pill split into 30-minute segments.
const PERIODS = [
  { id: "twilight", label: "Twilight", from: 0, Icon: Moon },
  { id: "morning", label: "Morning", from: 6 * 60, Icon: Sunrise },
  { id: "noon", label: "Noon", from: 12 * 60, Icon: Sun },
  { id: "evening", label: "Evening", from: 18 * 60, Icon: Sunset },
];
const PERIOD_MINUTES = 6 * 60;
const ROW_MINUTES = 3 * 60;

const hourLabel = (min) => {
  const h24 = Math.floor(min / 60) % 24;
  const suffix = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12} ${suffix}`;
};

const hatched = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(148,163,184,0.28) 0, rgba(148,163,184,0.28) 4px, transparent 4px, transparent 9px)",
};

const periodIndexOf = (min) =>
  Math.min(PERIODS.length - 1, Math.floor(min / PERIOD_MINUTES));

// Props
//  bookings  : ACTIVE bookings of the date (all games)
//  closures  : admin-closed time ranges effective on the date (e.g. daily
//              4-6 PM skating coaching), each { startMin, endMin, reason }
//  weight    : turf units of the chosen court option
//  hours     : chosen duration - a segment is bookable only if the WHOLE
//              duration from it fits (6:30-7:30 taken -> 1 hr starts at 7:30)
//  selected  : { start, end } highlighted range
//  pastUntil : minutes of today already gone (disabled)
//  initialMinute : minute whose period is shown first
// Closed segments stay clickable so the admin gets the "already booked"/
// "closed" popup.
const TimeSlotGrid = ({
  bookings,
  closures = [],
  weight,
  hours,
  selected,
  pastUntil = 0,
  initialMinute = 6 * 60,
  onPick,
}) => {
  const [periodIndex, setPeriodIndex] = useState(() =>
    periodIndexOf(selected ? selected.start : initialMinute)
  );
  const period = PERIODS[periodIndex];
  const usage = getUsage(bookings);

  const rows = [period.from, period.from + ROW_MINUTES];

  const describe = (slot) => {
    const used = usage[slot] || 0;
    const isPast = slot + SLOT_MINUTES <= pastUntil;
    const slotFree = used + weight <= CAPACITY;
    const end = slot + hours * 60;
    const adminClosed = closureAt(closures, slot);
    const closureBlocked = findClosureConflict(closures, slot, end) !== null;
    const fits =
      slotFree &&
      end <= CLOSE_MIN &&
      findConflict(bookings, weight, slot, end) === null &&
      !closureBlocked;
    const isSelected = selected && slot >= selected.start && slot < selected.end;
    const blockers = getBlockers(bookings, slot).map(describeBooking);

    let state = "open";
    if (isSelected) state = "selected";
    else if (adminClosed) state = "admin-closed";
    else if (isPast) state = "past";
    else if (!slotFree) state = "closed";
    else if (!fits) state = "short";
    else if (used > 0) state = "partial";

    const left = Math.floor((CAPACITY - used) / weight);
    const title = `${formatMinutes(slot)} - ${formatMinutes(slot + SLOT_MINUTES)}: ${
      state === "admin-closed"
        ? `closed by admin (${adminClosed.reason})`
        : state === "past"
          ? "time already passed"
          : state === "closed"
            ? `closed (${blockers.join(", ")})`
            : state === "short"
              ? `not enough free time for ${hours} hr from here${blockers.length ? ` (${blockers.join(", ")})` : ""}`
              : state === "partial"
                ? `${left} left (${blockers.join(", ")})`
                : "available"
    }`;
    return { state, left, title, isPast, fits };
  };

  return (
    <div>
      {/* Period tabs */}
      <div
        role="tablist"
        className="grid grid-cols-2 gap-1.5 rounded-full bg-slate-100 p-1 sm:grid-cols-4"
      >
        {PERIODS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={i === periodIndex}
            onClick={() => setPeriodIndex(i)}
            className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ${
              i === periodIndex
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <p.Icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {/* Rows with side arrows */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous period"
          disabled={periodIndex === 0}
          onClick={() => setPeriodIndex((i) => Math.max(0, i - 1))}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {rows.map((rowStart) => (
            <div key={rowStart}>
              <div className="relative mb-1.5 h-4 text-xs font-bold text-slate-700">
                {[0, 1, 2, 3].map((k) => (
                  <span
                    key={k}
                    className="absolute top-0 whitespace-nowrap"
                    style={{
                      left: `${(k / 3) * 100}%`,
                      transform:
                        k === 0
                          ? "none"
                          : k === 3
                            ? "translateX(-100%)"
                            : "translateX(-50%)",
                    }}
                  >
                    {hourLabel(rowStart + k * 60)}
                  </span>
                ))}
              </div>
              <div className="flex h-11 overflow-hidden rounded-full border border-gray-300 bg-white">
                {Array.from({ length: ROW_MINUTES / SLOT_MINUTES }, (_, i) => {
                  const slot = rowStart + i * SLOT_MINUTES;
                  const { state, left, title, isPast, fits } = describe(slot);
                  const base =
                    "flex flex-1 items-center justify-center text-[10px] font-semibold transition";
                  let cls = "bg-white text-slate-500 hover:bg-blue-50";
                  let style;
                  if (state === "selected")
                    cls = "bg-blue-100 text-blue-700 shadow-[inset_0_0_0_2px_#2563eb]";
                  else if (state === "admin-closed") {
                    cls = "bg-red-50 text-red-400";
                    style = hatched;
                  } else if (state === "past") {
                    cls = "bg-slate-50 text-slate-300";
                    style = hatched;
                  } else if (state === "closed") {
                    cls = "bg-slate-50 text-slate-400";
                    style = hatched;
                  } else if (state === "short") {
                    cls = "bg-amber-50/60 text-amber-500";
                    style = hatched;
                  } else if (state === "partial")
                    cls = "bg-blue-50 text-blue-600 hover:bg-blue-100";

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isPast && state !== "selected"}
                      aria-disabled={!fits}
                      aria-pressed={state === "selected"}
                      title={title}
                      aria-label={title}
                      onClick={() => onPick(slot)}
                      style={style}
                      className={`${base} ${cls} ${
                        i > 0 ? "border-l border-gray-200" : ""
                      } ${isPast || !fits ? "cursor-not-allowed" : ""}`}
                    >
                      {state === "partial" ? `${left} left` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Next period"
          disabled={periodIndex === PERIODS.length - 1}
          onClick={() =>
            setPeriodIndex((i) => Math.min(PERIODS.length - 1, i + 1))
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export const SlotLegend = () => (
  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
    <span className="flex items-center gap-1.5">
      <i className="h-3 w-5 rounded-full border border-gray-300 bg-white" />
      Available
    </span>
    <span className="flex items-center gap-1.5">
      <i className="h-3 w-5 rounded-full border border-blue-200 bg-blue-50" />
      Partly booked
    </span>
    <span className="flex items-center gap-1.5">
      <i
        className="h-3 w-5 rounded-full border border-gray-300 bg-slate-50"
        style={hatched}
      />
      Closed / too short
    </span>
    <span className="flex items-center gap-1.5">
      <i className="h-3 w-5 rounded-full border border-red-200 bg-red-50" style={hatched} />
      Closed by admin
    </span>
    <span className="flex items-center gap-1.5">
      <i className="h-3 w-5 rounded-full bg-blue-100 shadow-[inset_0_0_0_2px_#2563eb]" />
      Selected
    </span>
  </div>
);

export default TimeSlotGrid;
