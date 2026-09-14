import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const formatDate = (date) =>
  date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const DateCard = () => {
  const [date, setDate] = useState(new Date());

  const changeDay = (delta) => {
    setDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
          <CalendarDays size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">Today</p>
          <p className="text-xs text-slate-400">{formatDate(date)}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => changeDay(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50"
          aria-label="Previous day"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => changeDay(1)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50"
          aria-label="Next day"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default DateCard;
