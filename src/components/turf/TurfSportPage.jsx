import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Lock, X } from "lucide-react";
import FacilityStatCard from "../Facilities/FacilityStatCard";
import TurfBookingCard from "./TurfBookingCard";
import TurfBookingModal from "./TurfBookingModal";
import { TurfSummaryCard, TurfActivity } from "./TurfSideCards";
import DateCalendarCard from "../common/DateCalendarCard";
import axiosInstance from "../../api/axiosInstance";
import {
  ALL_SLOTS,
  CAPACITY,
  SLOT_MINUTES,
  SPORTS,
  describeBooking,
  formatClosureRange,
  formatMinutes,
  getPhase,
  getUsage,
  minutesNow,
  toDateKey,
} from "../../utils/turfRules";

const REFRESH_MS = 30 * 1000;

// Shared page for Basketball / Pickleball / Cricket. All three read and write
// the same TurfBooking collection, which is how one game closes the others.
const TurfSportPage = ({ sportId, Hero }) => {
  const sport = SPORTS[sportId];
  const [now, setNow] = useState(() => Date.now());
  const todayKey = toDateKey(new Date(now));

  // Opened from the topbar search: ?q=<name>&date=<YYYY-MM-DD>
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsKey = searchParams.toString();
  const nameFilter = (searchParams.get("q") || "").trim();
  const paramDate = searchParams.get("date");
  const validParamDate = /^\d{4}-\d{2}-\d{2}$/.test(paramDate || "");

  const [dateKey, setDateKey] = useState(() =>
    validParamDate ? paramDate : toDateKey(new Date())
  );
  // A new search while this page is already open: jump to that booking's day.
  const [seenParams, setSeenParams] = useState(paramsKey);
  if (paramsKey !== seenParams) {
    setSeenParams(paramsKey);
    if (validParamDate) setDateKey(paramDate);
  }
  const [dayData, setDayData] = useState({ date: "", bookings: [] });
  const [closures, setClosures] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const loading = dayData.date !== dateKey;

  const load = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/turf-bookings", {
        params: { date: dateKey },
      });
      setDayData({ date: dateKey, bookings: data.bookings });
      setLoadError("");
    } catch (err) {
      setLoadError(
        err.response?.data?.message || "Could not load bookings from server."
      );
      setDayData((prev) =>
        prev.date === dateKey ? prev : { date: dateKey, bookings: [] }
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

  // Admin-closed time ranges (e.g. daily 4-6 PM skating coaching) effective
  // on the viewed date - shown as a heads-up banner above the bookings.
  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/turf-closures/active", { params: { date: dateKey } })
      .then(({ data }) => {
        if (!cancelled) setClosures(data.closures);
      })
      .catch(() => {
        if (!cancelled) setClosures([]);
      });
    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const handleCreated = (booking) => {
    setModalOpen(false);
    if (booking.date === dateKey) {
      setDayData((prev) => ({
        date: prev.date,
        bookings: [...prev.bookings, booking],
      }));
    } else {
      setDateKey(booking.date); // jump to the day that was just booked
    }
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel the booking for ${booking.name}?`)) return;
    setCancellingId(booking._id);
    try {
      const { data } = await axiosInstance.patch(
        `/turf-bookings/${booking._id}/cancel`
      );
      setDayData((prev) => ({
        date: prev.date,
        bookings: prev.bookings.map((b) =>
          b._id === booking._id ? data.booking : b
        ),
      }));
    } catch (err) {
      window.alert(err.response?.data?.message || "Could not cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const { mine, otherGames, summary, stats } = useMemo(() => {
    const all = dayData.bookings;
    const active = all.filter((b) => b.status === "active");
    const own = all
      .filter((b) => b.sport === sportId)
      .sort((a, b) => a.startMin - b.startMin);
    const ownActive = own.filter((b) => b.status === "active");

    const phases = ownActive.map((b) => getPhase(b, now, todayKey));
    const bookedHours = ownActive.reduce((s, b) => s + b.hours, 0);

    // free 30-min boxes for the smallest option of this game
    const smallest = sport.options[0].weight;
    const usage = getUsage(active);
    const past = dateKey === todayKey ? minutesNow(now) : 0;
    const freeSlots = ALL_SLOTS.filter(
      (t) => (usage[t] || 0) + smallest <= CAPACITY && t + SLOT_MINUTES > past
    ).length;

    return {
      mine: own,
      otherGames: active.filter((b) => b.sport !== sportId),
      summary: {
        total: ownActive.length,
        completed: phases.filter((p) => p === "completed").length,
        hours: bookedHours,
        cancelled: own.length - ownActive.length,
      },
      stats: [
        {
          id: "bookings",
          icon: "CalendarCheck2",
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-600",
          titleLines: [`${sport.name} Bookings`],
          titleColor: "text-slate-800",
          value: String(ownActive.length),
          note: `${own.length - ownActive.length} cancelled`,
          noteColor: "text-slate-400",
        },
        {
          id: "hours",
          icon: "Wallet",
          iconBg: "bg-amber-50",
          iconColor: "text-amber-600",
          titleLines: ["Booked Hours"],
          titleColor: "text-amber-600",
          value: String(bookedHours),
          note: "on this date",
          noteColor: "text-slate-400",
        },
        {
          id: "live",
          icon: "Users",
          iconBg: "bg-blue-50",
          iconColor: "text-blue-600",
          titleLines: ["Playing Now"],
          titleColor: "text-slate-800",
          value: String(phases.filter((p) => p === "live").length),
          note: `${phases.filter((p) => p === "upcoming").length} upcoming`,
          noteColor: "text-blue-600",
        },
        {
          id: "free",
          icon: "IndianRupee",
          iconBg: "bg-violet-50",
          iconColor: "text-violet-600",
          titleLines: ["Free 30-min Slots"],
          titleColor: "text-violet-600",
          value: String(freeSlots),
          note: `for ${sport.options[0].label.toLowerCase()}`,
          noteColor: "text-slate-400",
        },
      ],
    };
  }, [dayData, sportId, sport, now, todayKey, dateKey]);

  // Only the list is filtered by the searched name; counts/stats stay for the whole day.
  const visibleMine = mine.filter(
    (b) =>
      b.status === "active" &&
      (!nameFilter ||
        b.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
        b.mobile.includes(nameFilter))
  );

  return (
    <div className="grid grid-cols-1 gap-5 py-5 xl:grid-cols-[1fr_340px]">
      <div className="flex min-w-0 flex-col gap-5">
        <Hero />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <FacilityStatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                {sport.name} Bookings
              </h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {summary.total} Bookings
              </span>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={16} />
              New Booking
            </button>
          </div>

          {loadError && (
            <p
              role="alert"
              className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
            >
              {loadError}
            </p>
          )}

          {closures.length > 0 && (
            <div className="mb-3 flex flex-col gap-1.5">
              {closures.map((c) => (
                <p
                  key={c._id}
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
                >
                  <Lock size={13} className="shrink-0" />
                  {formatClosureRange(c)} is closed on this date: {c.reason}
                </p>
              ))}
            </div>
          )}

          {nameFilter && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
              Showing bookings for &ldquo;{nameFilter}&rdquo;
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="ml-auto flex items-center gap-1 rounded-md bg-white px-2 py-1 font-semibold text-blue-700 shadow-sm hover:bg-blue-100"
              >
                <X size={12} /> Clear
              </button>
            </div>
          )}

          <div className="flex max-h-[520px] flex-col gap-4 overflow-y-auto pr-1">
            {loading && (
              <p className="py-8 text-center text-sm text-slate-400">
                Loading bookings...
              </p>
            )}
            {!loading && visibleMine.length === 0 && !loadError && (
              <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-slate-400">
                {nameFilter
                  ? `No ${sport.name.toLowerCase()} bookings match "${nameFilter}" on this date.`
                  : `No ${sport.name.toLowerCase()} bookings on this date. Click "New Booking" to add one.`}
              </p>
            )}
            {visibleMine
              .map((booking) => (
                <TurfBookingCard
                  key={booking._id}
                  booking={booking}
                  now={now}
                  todayKey={todayKey}
                  onCancel={handleCancel}
                  cancelling={cancellingId === booking._id}
                />
              ))}
          </div>
        </div>

        {/* Impact of the other games (one shared turf) */}
        {otherGames.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-800">
              Turf also booked for other games
            </h3>
            <p className="mb-3 text-xs text-slate-400">
              These bookings use the same turf, so they close or reduce{" "}
              {sport.name.toLowerCase()} slots at those times.
            </p>
            <ul className="flex flex-col gap-1.5">
              {otherGames.map((b) => (
                <li
                  key={b._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"
                >
                  <span className="font-semibold">{describeBooking(b)}</span>
                  <span className="text-slate-500">
                    {formatMinutes(b.startMin)} - {formatMinutes(b.endMin)} ·{" "}
                    {b.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <DateCalendarCard value={dateKey} onChange={setDateKey} />
        <TurfSummaryCard title={`${sport.name} Summary`} summary={summary} />
        <TurfActivity bookings={mine} />
      </div>

      {modalOpen && (
        <TurfBookingModal
          sportId={sportId}
          initialDate={dateKey}
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default TurfSportPage;
