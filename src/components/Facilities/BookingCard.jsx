import {
  Clock,
  Users,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Banknote,
} from "lucide-react";

const paymentIconMap = {
  GPay: CreditCard,
  UPI: Smartphone,
  Cash: Banknote,
};

const statusStyles = {
  live: "bg-emerald-50 text-emerald-600",
  "ending-soon": "bg-amber-50 text-amber-600",
  urgent: "bg-red-50 text-red-600",
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

const BookingCard = ({ booking }) => {
  const isUrgent = booking.status === "urgent";
  const PaymentIcon = paymentIconMap[booking.paymentMethod] || CreditCard;

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm ${
        isUrgent ? "border-red-400" : "border-gray-100"
      }`}
    >
      {/* Header: avatar + name + status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
            {getInitials(booking.name)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{booking.name}</p>
            <p className="text-xs text-slate-400">Member</p>
          </div>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[booking.status]}`}
        >
          {booking.status !== "live" && <Clock size={12} />}
          {booking.statusLabel}
        </span>
      </div>

      {/* Warning banner - only for urgent bookings */}
      {isUrgent && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
          <AlertTriangle size={14} />
          Your time is going to be end!
        </div>
      )}

      {/* Time + duration */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Clock size={13} />
          {booking.time}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
          {booking.duration}
        </span>
      </div>

      {/* Head count + amount */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-slate-400" />
          <div>
            <p className="text-[11px] text-slate-400">Head Count</p>
            <p className="text-sm font-bold text-slate-700">
              {booking.headCount} People
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IndianRupee size={15} className="text-slate-400" />
          <div>
            <p className="text-[11px] text-slate-400">Amount</p>
            <p className="text-sm font-bold text-slate-700">
              ₹{booking.amount}
            </p>
          </div>
        </div>
      </div>

      {/* Payment method row */}
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <PaymentIcon size={15} />
          {booking.paymentMethod}
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <CheckCircle2 size={13} />
          {booking.paymentStatus}
        </span>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {isUrgent ? (
          <button className="rounded-lg bg-red-500 py-2 text-xs font-semibold text-white transition hover:bg-red-600">
            Extend Time
          </button>
        ) : (
          <button className="rounded-lg border border-gray-200 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
            View Details
          </button>
        )}
        <button className="rounded-lg border border-red-300 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50">
          End Session
        </button>
      </div>
    </div>
  );
};

export default BookingCard;
