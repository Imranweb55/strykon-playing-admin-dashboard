import { LogIn, LogOut, Timer, BadgeCheck } from "lucide-react";
import { formatClock, formatTime, getInitials } from "../../utils/poolBookingUtils";

// Swimming list card for a membership visit: shows the member's plan,
// check-in time and (after Finish) the check-out time. `now` is a ms timestamp.
const MembershipCard = ({ booking, now, onFinish, finishing, onCancel }) => {
  const inside = !booking.checkOutAt;
  const inAt = new Date(booking.startsAt).getTime();
  const outAt = booking.checkOutAt ? new Date(booking.checkOutAt).getTime() : null;
  const elapsed = (outAt ?? now) - inAt;

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 shadow-sm lg:gap-4 ${
        inside ? "border-emerald-300" : "border-gray-100 opacity-80"
      }`}
    >
      {/* Photo + name + plan */}
      <div className="flex min-w-[220px] basis-[220px] items-center gap-2.5">
        {booking.memberThumb ? (
          <img src={booking.memberThumb} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {getInitials(booking.name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold leading-tight text-slate-800">
            {booking.name}
            <span className="ml-1 font-medium text-slate-400">· {booking.age}</span>
          </p>
          <p className="truncate text-[11px] leading-tight text-slate-400">
            ID {booking.memberCode} · {booking.mobile}
          </p>
        </div>
      </div>

      {/* Plan */}
      <div className="flex min-w-[150px] basis-[150px] items-center gap-1.5">
        <BadgeCheck size={14} className="shrink-0 text-blue-600" />
        <div className="min-w-0">
          <p className="text-[10px] leading-tight text-slate-400">Membership plan</p>
          <p className="truncate text-[12px] font-bold leading-tight text-blue-700">{booking.memberPlan}</p>
        </div>
      </div>

      {/* In / out */}
      <div className="flex min-w-[170px] basis-[170px] items-center gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <LogIn size={12} className="text-emerald-600" />
          <b className="text-slate-700">{formatTime(inAt)}</b>
        </span>
        <span className="flex items-center gap-1">
          <LogOut size={12} className={outAt ? "text-orange-500" : "text-slate-300"} />
          <b className={outAt ? "text-slate-700" : "text-slate-300"}>{outAt ? formatTime(outAt) : "--:--"}</b>
        </span>
      </div>

      {/* Time inside */}
      <div className="flex min-w-[110px] basis-[110px] items-center gap-1.5">
        <Timer size={14} className={inside ? "text-emerald-600" : "text-slate-400"} />
        <div>
          <p className="text-[10px] leading-tight text-slate-400">{inside ? "Inside for" : "Stayed"}</p>
          <p className="text-[15px] font-extrabold leading-tight tabular-nums text-slate-800">{formatClock(elapsed)}</p>
        </div>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
          inside ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
        }`}
      >
        {inside ? "Inside" : "Checked out"}
      </span>

      {inside && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onFinish(booking)}
            disabled={finishing}
            className="min-w-[80px] rounded-lg bg-orange-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {finishing ? "Saving..." : "Finish"}
          </button>
          <button
            type="button"
            onClick={() => onCancel(booking)}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-[11px] font-semibold text-red-500 transition hover:bg-red-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default MembershipCard;
