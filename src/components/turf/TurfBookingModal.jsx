import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  Minus,
  Plus,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import TimeSlotGrid, { SlotLegend } from "./TimeSlotGrid";
import DateStrip from "./DateStrip";
import OfferField from "../pricing/OfferField";
import AdvanceField from "../pricing/AdvanceField";
import { calcDiscount, rupees } from "../../utils/pricingUtils";
import {
  CLOSE_MIN,
  ENTRY_SOURCES,
  SPORTS,
  findClosureConflict,
  findConflict,
  formatDateKey,
  formatHours,
  formatMinutes,
  minutesNow,
  toDateKey,
} from "../../utils/turfRules";

// text-base (16px) stops iOS Safari zooming into focused inputs
const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const formatBookedAt = (date) =>
  date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const Choice = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
      active
        ? "border-blue-600 bg-blue-600 text-white"
        : "border-gray-200 bg-white text-slate-600 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

const TurfBookingModal = ({ sportId, initialDate, onClose, onCreated }) => {
  const sport = SPORTS[sportId];
  const todayKey = toDateKey(new Date());

  const [name, setName] = useState("");
  const [entrySource, setEntrySource] = useState("");
  const [mobile, setMobile] = useState("");
  const [optionId, setOptionId] = useState(sport.options[0].id);
  const [dateKey, setDateKey] = useState(
    initialDate < todayKey ? todayKey : initialDate
  );
  const [hours, setHours] = useState(1);
  const [start, setStart] = useState(null);

  const [dayData, setDayData] = useState({ date: "", bookings: [] });
  const [closures, setClosures] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rates, setRates] = useState(null);
  const [discountType, setDiscountType] = useState("amount");
  const [discountValue, setDiscountValue] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");

  // Per-hour price of this game (Products & Pricing)
  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/pricing")
      .then(({ data }) => {
        if (!cancelled) setRates(data.rates);
      })
      .catch(() => {
        if (!cancelled) setRates({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const option = sport.options.find((o) => o.id === optionId);
  const loading = dayData.date !== dateKey;
  const activeBookings = dayData.bookings.filter((b) => b.status === "active");
  const end = start === null ? null : start + hours * 60;

  // One price per hour for the game, whatever the number of players
  let ratePerHour = rates?.[`${sportId}PerHour`] || 0;
  // basketball half courts have their own price (2 half courts = 2 x half)
  if (sportId === "basketball" && optionId !== "full")
    ratePerHour =
      (rates?.basketballHalfPerHour || 0) * (optionId === "half-2" ? 2 : 1);
  const fee = Math.round(ratePerHour * hours);
  const discount = calcDiscount(fee, discountType, discountValue);
  const total = fee - discount;

  // Advance already paid in the District / Turf Town app is deducted
  const viaApp = ["district", "turftown"].includes(entrySource);
  const advance = viaApp ? Math.min(Number(advancePaid) || 0, total) : 0;
  const toCollect = total - advance;

  // Load every game's bookings for the chosen date - the grid needs them all
  // because one game closes slots for the others.
  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/turf-bookings", { params: { date: dateKey } })
      .then(({ data }) => {
        if (cancelled) return;
        setFetchError("");
        setDayData({ date: dateKey, bookings: data.bookings });
      })
      .catch((err) => {
        if (cancelled) return;
        setFetchError(
          err.response?.data?.message || "Could not load available times."
        );
        setDayData({ date: dateKey, bookings: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  // Admin-closed time ranges effective on the chosen date (e.g. daily
  // 4-6 PM skating coaching) - block those slots the same as a full turf.
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
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, saving]);

  // Try to place a selection; if it collides show the "already booked" popup.
  const trySelect = (slot, nextHours, nextOption) => {
    const end = slot + nextHours * 60;
    const conflict =
      end > CLOSE_MIN
        ? `${formatHours(nextHours)} from ${formatMinutes(slot)} goes past closing time (${formatMinutes(CLOSE_MIN)}). Choose an earlier start or fewer hours.`
        : findClosureConflict(closures, slot, end) ||
          findConflict(activeBookings, nextOption.weight, slot, end);
    if (conflict) {
      setStart(null);
      setError(conflict);
      return;
    }
    setError("");
    setStart(slot);
  };

  const changeHours = (delta) => {
    const next = Math.min(12, Math.max(0.5, hours + delta));
    setHours(next);
    if (start !== null) trySelect(start, next, option);
  };

  const changeOption = (opt) => {
    setOptionId(opt.id);
    setError("");
    setStart(null);
  };

  const changeDate = (key) => {
    if (key < todayKey) return;
    setDateKey(key);
    setStart(null);
    setError("");
  };

  const validate = () => {
    if (!name.trim()) return "Enter the customer name";
    if (!entrySource) return "Select the entry source";
    if (!/^[0-9+\-\s]{10,15}$/.test(mobile.trim()))
      return "Enter a valid mobile number";
    if (start === null) return "Pick a start time from the slots";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setSaving(true);
    try {
      const { data } = await axiosInstance.post("/turf-bookings", {
        sport: sportId,
        optionId,
        name: name.trim(),
        entrySource,
        mobile: mobile.trim(),
        date: dateKey,
        startMin: start,
        hours,
        discountType,
        discountValue,
        advancePaid: advance,
      });
      onCreated(data.booking, data.serverTime);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not save booking. Try again."
      );
      setSaving(false);
      // Someone else may have taken the slot - refresh the grid.
      if (err.response?.status === 409) {
        setStart(null);
        setDayData({ date: "", bookings: [] });
        axiosInstance
          .get("/turf-bookings", { params: { date: dateKey } })
          .then(({ data }) =>
            setDayData({ date: dateKey, bookings: data.bookings })
          )
          .catch(() => {});
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="turf-booking-title"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-h-[90vh] max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="sticky top-0 z-10 -mx-5 -mt-5 flex items-start justify-between gap-3 rounded-t-2xl bg-white px-5 pb-3 pt-5 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6">
          <div>
            <h2
              id="turf-booking-title"
              className="text-lg font-bold text-slate-800"
            >
              New {sport.name} Booking
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Booking made: {formatBookedAt(now)} (auto)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">
              Customer name
            </span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              placeholder="Full name"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">
              Mobile number
            </span>
            <input
              className={inputClass}
              type="tel"
              value={mobile}
              maxLength={15}
              onChange={(e) =>
                setMobile(e.target.value.replace(/[^\d+\-\s]/g, ""))
              }
              placeholder="10-digit mobile"
            />
          </label>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-semibold text-slate-500">
              Entry through
            </span>
            <div className="flex flex-wrap gap-2">
              {ENTRY_SOURCES.map((s) => (
                <Choice
                  key={s.value}
                  active={entrySource === s.value}
                  onClick={() => setEntrySource(s.value)}
                >
                  {s.label}
                </Choice>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-semibold text-slate-500">
              {sport.name} court
            </span>
            <div className="flex flex-wrap gap-2">
              {sport.options.map((opt) => (
                <Choice
                  key={opt.id}
                  active={optionId === opt.id}
                  onClick={() => changeOption(opt)}
                >
                  {opt.label}
                </Choice>
              ))}
            </div>
          </div>

          {/* Calendar + duration */}
          <div className="sm:col-span-2">
            <DateStrip
              value={dateKey}
              onChange={changeDate}
              minDate={todayKey}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">
              How many hours
            </span>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-2 py-1.5">
              <button
                type="button"
                onClick={() => changeHours(-0.5)}
                disabled={hours <= 0.5}
                aria-label="Decrease hours"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
              >
                <Minus size={16} />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                {formatHours(hours)}
              </span>
              <button
                type="button"
                onClick={() => changeHours(0.5)}
                disabled={hours >= 12}
                aria-label="Increase hours"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Slot picker */}
        <div className="mt-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Pick start time (each segment = 30 min)
            </span>
            <SlotLegend />
          </div>
          {loading ? (
            <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-slate-400">
              Loading available times...
            </p>
          ) : (
            <TimeSlotGrid
              key={dateKey}
              initialMinute={
                dateKey === todayKey ? minutesNow(now.getTime()) : 6 * 60
              }
              bookings={activeBookings}
              closures={closures}
              weight={option.weight}
              hours={hours}
              selected={start === null ? null : { start, end }}
              pastUntil={dateKey === todayKey ? minutesNow(now.getTime()) : 0}
              onPick={(slot) => trySelect(slot, hours, option)}
            />
          )}
          {fetchError && (
            <p className="mt-2 text-xs font-medium text-red-600">
              {fetchError}
            </p>
          )}
        </div>

        {start !== null && (
          <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span className="font-semibold">
              {sport.name} · {option.label}
            </span>{" "}
            on {formatDateKey(dateKey)}, {formatMinutes(start)} -{" "}
            {formatMinutes(end)} ({formatHours(hours)})
          </div>
        )}

        {viaApp && (
          <div className="mt-4">
            <AdvanceField
              source={entrySource}
              value={advancePaid}
              onChange={setAdvancePaid}
              total={total}
            />
          </div>
        )}

        {/* Auto price + manual offer */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <OfferField
            type={discountType}
            value={discountValue}
            onType={setDiscountType}
            onValue={setDiscountValue}
          />
          <div className="rounded-xl border border-gray-100 p-4 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>
                {formatHours(hours)} × {rupees(ratePerHour)}/hr
              </span>
              <span className="font-semibold">{rupees(fee)}</span>
            </div>
            {discount > 0 && (
              <div className="mt-1.5 flex items-center justify-between text-emerald-600">
                <span>
                  Offer {discountType === "percent" ? `(${discountValue}%)` : ""}
                </span>
                <span className="font-semibold">- {rupees(discount)}</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="font-semibold text-slate-500">Total</span>
              <span className="text-lg font-extrabold text-slate-800">
                {rupees(total)}
              </span>
            </div>
            {advance > 0 && (
              <>
                <div className="mt-1.5 flex items-center justify-between text-blue-600">
                  <span>Advance paid (app)</span>
                  <span className="font-semibold">- {rupees(advance)}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Balance to collect</span>
                  <span className="text-lg font-extrabold text-slate-800">{rupees(toCollect)}</span>
                </div>
              </>
            )}
            {rates && ratePerHour === 0 && (
              <p className="mt-2 text-[11px] font-medium text-amber-600">
                Price not set yet - set it in Products &amp; Pricing.
              </p>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="sticky bottom-0 -mx-5 -mb-5 mt-5 flex justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-white px-5 py-3 sm:-mx-6 sm:-mb-6 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            Confirm Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default TurfBookingModal;
