import {
  CalendarCheck2,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { basketballSummary } from "../../data/basketballData";

const BasketballSummary = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">
        Basketball Today's Summary
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CalendarCheck2 size={17} />
          </span>
          <div>
            <p className="text-xs text-slate-400">Total Bookings</p>
            <p className="text-base font-extrabold text-slate-800">
              {basketballSummary.totalBookings}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={17} />
          </span>
          <div>
            <p className="text-xs text-slate-400">Completed</p>
            <p className="text-base font-extrabold text-slate-800">
              {basketballSummary.completed}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <IndianRupee size={17} />
          </span>
          <div>
            <p className="text-xs text-slate-400">Total Revenue</p>
            <p className="text-base font-extrabold text-slate-800">
              ₹{basketballSummary.totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <TrendingUp size={17} />
          </span>
          <div>
            <p className="text-xs text-slate-400">Total Profit</p>
            <p className="text-base font-extrabold text-slate-800">
              ₹{basketballSummary.totalProfit.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketballSummary;
