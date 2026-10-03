import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import FacilityHero from "../../components/Facilities/FacilityHero";
import FacilityStatCard from "../../components/Facilities/FacilityStatCard";
import BookingCard from "../../components/Facilities/BookingCard";
import MembershipCard from "../../components/Facilities/MembershipCard";
import FacilitySummaryCard from "../../components/Facilities/FacilitySummaryCard";
import PaymentBreakdownCard from "../../components/Facilities/PaymentBreakdownCard";
import FacilityRecentActivity from "../../components/Facilities/FacilityRecentActivity";
import NewBookingModal from "../../components/Facilities/NewBookingModal";
import DateCalendarCard from "../../components/common/DateCalendarCard";
import axiosInstance from "../../api/axiosInstance";
import {
  POOL_CAPACITY,
  getPhase,
  getDateRange,
} from "../../utils/poolBookingUtils";
import { formatDateKey, toDateKey } from "../../utils/turfRules";

const REFRESH_MS = 30 * 1000;

const DATE_PARAM = /^\d{4}-\d{2}-\d{2}$/;

const Facilities = () => {
  // Opened from the topbar search: ?q=<name>&date=<YYYY-MM-DD>
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsKey = searchParams.toString();
  const nameFilter = (searchParams.get("q") || "").trim();
  const paramDate = searchParams.get("date");

  const [selectedDate, setSelectedDate] = useState(() =>
    DATE_PARAM.test(paramDate || "") ? paramDate : toDateKey(new Date())
  );
  // A new search while this page is already open: jump to that booking's day.
  const [seenParams, setSeenParams] = useState(paramsKey);
  if (paramsKey !== seenParams) {
    setSeenParams(paramsKey);
    if (DATE_PARAM.test(paramDate || "")) setSelectedDate(paramDate);
  }
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const isToday = selectedDate === toDateKey(new Date());

  // Difference between server clock and this browser's clock, so timers are
  // right even if the admin's device clock is off.
  const offsetRef = useRef(0);
  const [now, setNow] = useState(() => Date.now());

  const syncClock = (serverTime) => {
    if (serverTime) offsetRef.current = new Date(serverTime).getTime() - Date.now();
  };

  const loadBookings = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/pool-bookings", {
        params: getDateRange(selectedDate),
      });
      syncClock(data.serverTime);
      setBookings(data.bookings);
      setLoadError("");
    } catch (err) {
      setLoadError(
        err.response?.data?.message || "Could not load bookings from server."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const first = setTimeout(() => {
      setLoading(true);
      loadBookings();
    }, 0);
    // Only keep auto-refreshing while viewing today - a past date picked
    // from the calendar is static and doesn't need re-polling.
    const id = isToday ? setInterval(loadBookings, REFRESH_MS) : null;
    return () => {
      clearTimeout(first);
      if (id) clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadBookings, selectedDate]);

  // One shared 1-second ticker drives every card's timer.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + offsetRef.current), 1000);
    return () => clearInterval(id);
  }, []);

  const handleCreated = (booking, serverTime) => {
    syncClock(serverTime);
    setNow(Date.now() + offsetRef.current);
    setModalOpen(false);
    // New pool bookings always start "now", so only splice it straight into
    // the list when today is what's on screen; otherwise jump back to today
    // so the just-created booking is visible (a past date reload wouldn't
    // include it).
    if (isToday) setBookings((prev) => [booking, ...prev]);
    else setSelectedDate(toDateKey(new Date()));
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel the booking for ${booking.name}?`)) return;
    setCancellingId(booking._id);
    try {
      const { data } = await axiosInstance.patch(
        `/pool-bookings/${booking._id}/cancel`
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? data.booking : b))
      );
    } catch (err) {
      window.alert(err.response?.data?.message || "Could not cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleFinish = async (booking) => {
    if (!window.confirm(`Finish and note check-out for ${booking.name}?`)) return;
    setCancellingId(booking._id);
    try {
      const { data } = await axiosInstance.patch(
        `/pool-bookings/${booking._id}/finish`
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? data.booking : b))
      );
    } catch (err) {
      window.alert(err.response?.data?.message || "Could not finish.");
    } finally {
      setCancellingId(null);
    }
  };

  const { activeBookings, stats, breakdown } = useMemo(() => {
    const active = bookings.filter((b) => b.status !== "cancelled");

    const headCount = active.reduce((sum, b) => {
      const phase = getPhase(b, now);
      return phase === "live" || phase === "ending" ? sum + b.persons : sum;
    }, 0);

    const paymentTotals = {
      online: { amount: 0, count: 0 },
      cash: { amount: 0, count: 0 },
      free: { amount: 0, count: 0 },
      membership: { amount: 0, count: 0 },
    };
    active.forEach((b) => {
      const slot = paymentTotals[b.paymentMode];
      if (slot) {
        slot.amount += b.totalAmount;
        slot.count += 1;
      }
    });
    const revenue = paymentTotals.online.amount + paymentTotals.cash.amount;
    const onlinePercent =
      revenue > 0 ? Math.round((paymentTotals.online.amount / revenue) * 100) : 0;

    const cancelledCount = bookings.length - active.length;

    return {
      activeBookings: active,
      breakdown: paymentTotals,
      stats: {
        revenue,
        list: [
          {
            id: "head-count",
            icon: "Users",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            titleLines: ["Swimming Pool", "Head Count"],
            titleColor: "text-slate-800",
            value: String(headCount),
            note: `${POOL_CAPACITY} (Capacity)`,
            noteColor: "text-blue-600",
          },
          {
            id: "todays-bookings",
            icon: "CalendarCheck2",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            titleLines: [isToday ? "Today's Bookings" : "Bookings"],
            titleColor: "text-slate-800",
            value: String(active.length),
            note: `${cancelledCount} cancelled`,
            noteColor: "text-slate-400",
          },
          {
            id: "total-revenue",
            icon: "IndianRupee",
            iconBg: "bg-violet-50",
            iconColor: "text-violet-600",
            titleLines: [isToday ? "Total Revenue (Today)" : "Total Revenue"],
            titleColor: "text-violet-600",
            value: `₹${revenue.toLocaleString("en-IN")}`,
            note: `${paymentTotals.free.count} free entries`,
            noteColor: "text-slate-400",
          },
          {
            id: "online-collection",
            icon: "Wallet",
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            titleLines: [isToday ? "Online Collection (Today)" : "Online Collection"],
            titleColor: "text-amber-600",
            value: `₹${paymentTotals.online.amount.toLocaleString("en-IN")}`,
            note: `${onlinePercent}% of total revenue`,
            noteColor: "text-slate-400",
          },
        ],
      },
    };
  }, [bookings, now, isToday]);

  // Only the list is filtered by the searched name; counts/stats stay for the whole day.
  const visibleBookings = nameFilter
    ? activeBookings.filter(
        (b) =>
          b.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
          b.mobile.includes(nameFilter)
      )
    : activeBookings;

  return (
    <div className="grid grid-cols-1 gap-5 py-5 xl:grid-cols-[1fr_340px]">
      {/* Main column */}
      <div className="flex min-w-0 flex-col gap-5">
        <FacilityHero />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.list.map((stat) => (
            <FacilityStatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                {isToday ? "Today's" : formatDateKey(selectedDate)} Swimming Pool Bookings
              </h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {activeBookings.length} Bookings
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

          <div className="flex max-h-[640px] flex-col gap-4 overflow-y-auto pr-1">
            {loading && (
              <p className="py-8 text-center text-sm text-slate-400">
                Loading bookings...
              </p>
            )}
            {!loading && visibleBookings.length === 0 && !loadError && (
              <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-slate-400">
                {nameFilter
                  ? `No bookings match "${nameFilter}" on this date.`
                  : `No bookings ${isToday ? "yet today" : "on this date"}. Click "New Booking" to add one.`}
              </p>
            )}
            {visibleBookings.map((booking) =>
              booking.paymentMode === "membership" ? (
                <MembershipCard
                  key={booking._id}
                  booking={booking}
                  now={now}
                  onFinish={handleFinish}
                  onCancel={handleCancel}
                  finishing={cancellingId === booking._id}
                />
              ) : (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  now={now}
                  onCancel={handleCancel}
                  cancelling={cancellingId === booking._id}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Right rail */}
      <div className="flex min-w-0 flex-col gap-5">
        <DateCalendarCard value={selectedDate} onChange={setSelectedDate} />
        <FacilitySummaryCard
          totalBookings={activeBookings.length}
          totalRevenue={stats.revenue}
        />
        <PaymentBreakdownCard breakdown={breakdown} />
        <FacilityRecentActivity bookings={bookings} />
      </div>

      {modalOpen && (
        <NewBookingModal
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default Facilities;
