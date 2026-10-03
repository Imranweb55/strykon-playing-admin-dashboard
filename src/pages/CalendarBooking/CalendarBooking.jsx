import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import MonthCalendar from "../../components/turf/MonthCalendar";
import axiosInstance from "../../api/axiosInstance";
import {
  ALL_SLOTS,
  SLOT_MINUTES,
  STRUCTURE_ROWS,
  formatDateKey,
  formatHours,
  formatMinutes,
  getSlotStructure,
  minutesNow,
  sourceLabel,
  toDateKey,
} from "../../utils/turfRules";

const REFRESH_MS = 30 * 1000;

const statusStyle = {
  booked: "bg-blue-50 text-blue-700",
  available: "bg-emerald-50 text-emerald-700",
  closed: "bg-red-50 text-red-600",
};
const statusText = { booked: "Booked", available: "Available", closed: "Closed" };
const cellStyle = {
  booked: "bg-blue-500 text-white",
  available: "bg-emerald-50 text-emerald-600",
  closed: "bg-red-100 text-red-400",
};
const cellText = { booked: "B", available: "", closed: "X" };

const th =
  "border border-gray-300 bg-slate-50 px-2 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600";
const td = "border border-gray-200 px-2 py-2 text-xs text-slate-700";

const defaultSlot = () => {
  const n = minutesNow(Date.now());
  const s = Math.floor(n / SLOT_MINUTES) * SLOT_MINUTES;
  return ALL_SLOTS.includes(s) ? s : ALL_SLOTS[0];
};

const CalendarBooking = () => {
  const [dateKey, setDateKey] = useState(() => toDateKey(new Date()));
  const [slot, setSlot] = useState(defaultSlot);
  const [dayData, setDayData] = useState({ date: "", bookings: [] });
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/turf-bookings", {
        params: { date: dateKey },
      });
      setDayData({ date: dateKey, bookings: data.bookings });
      setLoadError("");
    } catch (err) {
      setLoadError(err.response?.data?.message || "Could not load bookings.");
      setDayData((p) =>
        p.date === dateKey ? p : { date: dateKey, bookings: [] }
      );
    }
  }, [dateKey]);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const id = setInterval(load, REFRESH_MS);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [load]);

  const loading = dayData.date !== dateKey;
  const active = useMemo(
    () => dayData.bookings.filter((b) => b.status === "active"),
    [dayData]
  );
  const structure = useMemo(() => getSlotStructure(active, slot), [active, slot]);
  const matrix = useMemo(
    () => ALL_SLOTS.map((t) => getSlotStructure(active, t)),
    [active]
  );
  const sorted = useMemo(
    () => [...active].sort((a, b) => a.startMin - b.startMin),
    [active]
  );

  const availableText = [
    structure.pickleFree > 0 &&
      `${structure.pickleFree} Pickleball court${structure.pickleFree > 1 ? "s" : ""}`,
    structure.halfFree > 0 &&
      `${structure.halfFree} Basketball half court${structure.halfFree > 1 ? "s" : ""}`,
    structure.wholeFree && "Basketball full court",
    structure.wholeFree && "Cricket",
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
          <CalendarDays size={20} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Calendar Booking</h1>
          <p className="text-xs text-slate-400">
            Pick a date and time to see which courts are booked, available or
            closed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-4">
          <MonthCalendar value={dateKey} onChange={setDateKey} />
          <label className="flex flex-col gap-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Time</span>
            <select
              value={slot}
              onChange={(e) => setSlot(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none focus:border-blue-500"
            >
              {ALL_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {formatMinutes(t)} - {formatMinutes(t + SLOT_MINUTES)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Structure for the selected date + time (PDF-style table) */}
        <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">
            Turf Structure · {formatDateKey(dateKey)},{" "}
            {formatMinutes(slot)} - {formatMinutes(slot + SLOT_MINUTES)}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {loading
              ? "Loading..."
              : availableText.length
                ? `Available: ${availableText.join(", ")}`
                : "Everything is booked or closed for this time."}
          </p>
          {loadError && (
            <p role="alert" className="mt-2 text-xs font-medium text-red-600">
              {loadError}
            </p>
          )}

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>S.No</th>
                  <th className={th}>Game</th>
                  <th className={th}>Court</th>
                  <th className={th}>Status</th>
                  <th className={th}>Booked by</th>
                  <th className={th}>Mobile</th>
                  <th className={th}>Entry through</th>
                  <th className={th}>Booked time</th>
                </tr>
              </thead>
              <tbody>
                {structure.rows.map((row, i) => (
                  <tr key={row.id}>
                    <td className={td}>{i + 1}</td>
                    <td className={td}>{row.group}</td>
                    <td className={`${td} font-semibold`}>{row.label}</td>
                    <td className={td}>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle[row.status]}`}
                      >
                        {statusText[row.status]}
                      </span>
                    </td>
                    <td className={td}>{row.booking?.name || "-"}</td>
                    <td className={td}>{row.booking?.mobile || "-"}</td>
                    <td className={td}>
                      {row.booking ? sourceLabel(row.booking.entrySource) : "-"}
                    </td>
                    <td className={td}>
                      {row.booking
                        ? `${formatMinutes(row.booking.startMin)} - ${formatMinutes(row.booking.endMin)}`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Whole-day matrix: court x 30-min slot */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-800">
            Day Overview · {formatDateKey(dateKey)}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <i className="h-3 w-3 rounded bg-blue-500" /> Booked
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-3 w-3 rounded border border-emerald-200 bg-emerald-50" />{" "}
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-3 w-3 rounded bg-red-100" /> Closed
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="border-collapse text-[10px]">
            <thead>
              <tr>
                <th className={`${th} sticky left-0 z-10 min-w-[170px]`}>
                  Court
                </th>
                {ALL_SLOTS.map((t) => (
                  <th
                    key={t}
                    className={`border border-gray-300 px-1 py-1 text-center font-semibold ${
                      t === slot
                        ? "bg-blue-600 text-white"
                        : "bg-slate-50 text-slate-500"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSlot(t)}
                      className="w-full whitespace-nowrap"
                    >
                      {formatMinutes(t).replace(" ", "")}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STRUCTURE_ROWS.map((row, r) => (
                <tr key={row.id}>
                  <td className="sticky left-0 z-10 border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700">
                    {row.label}
                  </td>
                  {matrix.map((m, c) => {
                    const cell = m.rows[r];
                    return (
                      <td
                        key={ALL_SLOTS[c]}
                        title={
                          cell.booking
                            ? `${cell.booking.name} - ${cell.booking.optionLabel}`
                            : statusText[cell.status]
                        }
                        className={`min-w-[52px] border border-gray-200 px-1 py-1.5 text-center font-bold ${cellStyle[cell.status]}`}
                      >
                        {cell.booking
                          ? cell.booking.name.slice(0, 5)
                          : cellText[cell.status]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register of the day - same column style as the paper register */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-bold text-slate-800">
          Bookings on {formatDateKey(dateKey)}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr>
                <th className={th}>S.No</th>
                <th className={th}>Name</th>
                <th className={th}>Entry through</th>
                <th className={th}>Mobile</th>
                <th className={th}>Game</th>
                <th className={th}>Court</th>
                <th className={th}>Time</th>
                <th className={th}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className={`${td} py-6 text-center text-slate-400`}>
                    No bookings on this date.
                  </td>
                </tr>
              )}
              {sorted.map((b, i) => (
                <tr key={b._id}>
                  <td className={td}>{i + 1}</td>
                  <td className={`${td} font-semibold`}>{b.name}</td>
                  <td className={td}>{sourceLabel(b.entrySource)}</td>
                  <td className={td}>{b.mobile}</td>
                  <td className={td}>
                    {b.sport.charAt(0).toUpperCase() + b.sport.slice(1)}
                  </td>
                  <td className={td}>{b.optionLabel}</td>
                  <td className={td}>
                    {formatMinutes(b.startMin)} - {formatMinutes(b.endMin)}
                  </td>
                  <td className={td}>{formatHours(b.hours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CalendarBooking;
