import { Clock, Phone, Layers, CalendarDays } from "lucide-react";
import {
  formatDateKey,
  formatHours,
  formatMinutes,
  getPhase,
  minutesNow,
  sourceLabel,
} from "../../utils/turfRules";

const badge = {
  upcoming: { label: "Upcoming", style: "bg-blue-50 text-blue-600" },
  live: { label: "Live", style: "bg-emerald-50 text-emerald-600" },
  completed: { label: "Completed", style: "bg-slate-100 text-slate-500" },
};

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

const TurfBookingCard = ({ booking, now, todayKey, onCancel, cancelling }) => {
  const phase = getPhase(booking, now, todayKey);
  const b = badge[phase] || badge.completed;
  const isEnding =
    phase === "live" && booking.endMin - minutesNow(now) <= 10;

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 shadow-sm lg:gap-4 ${
        isEnding ? "border-red-400" : "border-gray-100"
      } ${phase === "completed" ? "opacity-75" : ""}`}
    >
      <div className="flex min-w-[200px] flex-1 basis-[200px] items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            {getInitials(booking.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold leading-tight text-slate-800">
              {booking.name}
            </p>
            <p className="truncate text-[11px] leading-tight text-slate-400">
              {sourceLabel(booking.entrySource)}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
            isEnding ? "bg-red-50 text-red-600" : b.style
          }`}
        >
          {isEnding ? "Ending soon" : b.label}
        </span>
      </div>

      <div className="flex min-w-[170px] flex-1 basis-[170px] items-center gap-2 text-[11px] text-slate-500">
        <Clock size={12} />
        <span className="font-semibold text-slate-700">
          {formatMinutes(booking.startMin)} - {formatMinutes(booking.endMin)}
        </span>
        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-medium">
          {formatHours(booking.hours)}
        </span>
      </div>

      <div className="flex min-w-[130px] flex-1 basis-[130px] items-center gap-1.5 text-[11px] text-slate-500">
        <Layers size={13} className="text-slate-400" />
        <span className="font-semibold text-slate-700">
          {booking.optionLabel}
        </span>
      </div>

      <div className="flex min-w-[120px] flex-1 basis-[120px] items-center gap-1.5 text-[11px] text-slate-500">
        <Phone size={12} className="text-slate-400" />
        {booking.mobile}
      </div>

      {booking.totalAmount > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
          ₹{booking.totalAmount.toLocaleString("en-IN")}
          {booking.discountAmount > 0 && (
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
              offer -₹{booking.discountAmount}
            </span>
          )}
          {booking.advancePaid > 0 && (
            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
              adv ₹{booking.advancePaid} · bal ₹{Math.max(0, booking.totalAmount - booking.advancePaid)}
            </span>
          )}
        </div>
      )}

      {booking.date !== todayKey && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <CalendarDays size={12} className="text-slate-400" />
          {formatDateKey(booking.date)}
        </div>
      )}

      {phase !== "completed" && (
        <button
          type="button"
          onClick={() => onCancel(booking)}
          disabled={cancelling}
          className="min-w-[90px] rounded-lg border border-red-300 px-3 py-1.5 text-[11px] font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
        >
          {cancelling ? "Cancelling..." : "Cancel"}
        </button>
      )}
    </div>
  );
};

export default TurfBookingCard;
