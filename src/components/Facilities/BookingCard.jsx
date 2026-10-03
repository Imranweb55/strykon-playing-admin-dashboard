import {
  Clock,
  Users,
  IndianRupee,
  AlertTriangle,
  Timer,
  CheckCircle2,
  Smartphone,
  Banknote,
  Gift,
} from "lucide-react";
import {
  formatClock,
  formatHours,
  formatTime,
  getInitials,
  getPhase,
  sourceLabel,
} from "../../utils/poolBookingUtils";

const paymentMeta = {
  cash: { label: "Cash", Icon: Banknote },
  online: { label: "Online", Icon: Smartphone },
  free: { label: "Free", Icon: Gift },
};

const productLabel = { rent: "Rented", buy: "Bought", own: "Own" };

const phaseBadge = {
  waiting: { label: "Fresh-up", style: "bg-blue-50 text-blue-600" },
  live: { label: "Live", style: "bg-emerald-50 text-emerald-600" },
  ending: { label: "Ending soon", style: "bg-red-50 text-red-600" },
  finished: { label: "Completed", style: "bg-slate-100 text-slate-500" },
};

// Compact rectangle row - flex-wrap so narrow widths wrap instead of scrolling.
// `now` is a server-synced timestamp (ms) supplied by the page's 1s ticker.
const BookingCard = ({ booking, now, onCancel, cancelling }) => {
  const phase = getPhase(booking, now);
  const badge = phaseBadge[phase] || phaseBadge.finished;
  const payment = paymentMeta[booking.paymentMode] || paymentMeta.cash;
  const PaymentIcon = payment.Icon;

  const start = new Date(booking.startsAt).getTime();
  const end = new Date(booking.endsAt).getTime();
  const isEnding = phase === "ending";
  const canCancel = phase !== "finished";

  let timerLabel;
  let timerValue;
  if (phase === "waiting") {
    timerLabel = "Starts in";
    timerValue = formatClock(start - now);
  } else if (phase === "finished") {
    timerLabel = "Time over";
    timerValue = "00:00";
  } else {
    timerLabel = "Time left";
    timerValue = formatClock(end - now);
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 shadow-sm lg:gap-4 ${
        isEnding ? "border-red-400" : "border-gray-100"
      } ${phase === "finished" ? "opacity-75" : ""}`}
    >
      {/* Avatar + name + status badge */}
      <div className="flex min-w-[190px] basis-[190px] items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            {getInitials(booking.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold leading-tight text-slate-800">
              {booking.name}
              <span className="ml-1 font-medium text-slate-400">
                · {booking.age}
              </span>
            </p>
            <p className="truncate text-[11px] leading-tight text-slate-400">
              {sourceLabel(booking.entrySource)} · {booking.mobile}
            </p>
          </div>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${badge.style}`}
        >
          {phase === "waiting" && <Clock size={11} />}
          {badge.label}
        </span>
      </div>

      {/* Timer */}
      <div className="flex min-w-[120px] basis-[120px] items-center gap-1.5">
        <Timer
          size={14}
          className={isEnding ? "text-red-500" : "text-slate-400"}
        />
        <div>
          <p className="text-[10px] leading-tight text-slate-400">
            {timerLabel}
          </p>
          <p
            className={`text-[15px] font-extrabold leading-tight tabular-nums ${
              isEnding ? "text-red-600" : "text-slate-800"
            }`}
          >
            {timerValue}
          </p>
        </div>
      </div>

      {/* Hint line - last 10 minutes only */}
      {isEnding && (
        <div className="flex min-w-[190px] basis-[190px] items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600">
          <AlertTriangle size={12} />
          Time is about to end!
        </div>
      )}

      {/* Slot + duration */}
      <div className="flex min-w-[150px] basis-[150px] items-center gap-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatTime(start)} - {formatTime(end)}
        </span>
        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500">
          {formatHours(booking.hours)}
        </span>
      </div>

      {/* Head count */}
      <div className="flex min-w-[100px] basis-[100px] items-center gap-1.5">
        <Users size={13} className="text-slate-400" />
        <div>
          <p className="text-[10px] leading-tight text-slate-400">Persons</p>
          <p className="text-[13px] font-bold leading-tight text-slate-700">
            {booking.persons}
          </p>
        </div>
      </div>

      {/* Amount + product */}
      <div className="flex min-w-[100px] basis-[100px] items-center gap-1.5">
        <IndianRupee size={13} className="text-slate-400" />
        <div>
          <p className="text-[10px] leading-tight text-slate-400">
            {booking.productType !== "none"
              ? `Amount · ${productLabel[booking.productType]}`
              : "Amount"}
          </p>
          <p className="text-[13px] font-bold leading-tight text-slate-700">
            {booking.paymentMode === "free"
              ? "Free"
              : `₹${booking.totalAmount.toLocaleString("en-IN")}`}
          </p>
          {booking.advancePaid > 0 && (
            <p className="text-[10px] font-medium leading-tight text-blue-600">
              Adv ₹{booking.advancePaid} · Bal ₹{Math.max(0, booking.totalAmount - booking.advancePaid)}
            </p>
          )}
        </div>
      </div>

      {/* Payment mode */}
      <div className="flex min-w-[110px] basis-[110px] items-center justify-between gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
          <PaymentIcon size={13} />
          {payment.label}
        </span>
        <CheckCircle2 size={12} className="text-emerald-600" />
      </div>

      {/* Cancel */}
      {canCancel && (
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

export default BookingCard;
