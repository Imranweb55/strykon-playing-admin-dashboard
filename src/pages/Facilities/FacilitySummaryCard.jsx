import { Waves, Users, IndianRupee } from "lucide-react";
import { poolSummary } from "../../data/facilitiesData";

const FacilitySummaryCard = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Waves size={18} className="text-blue-600" />
        <h3 className="text-base font-bold text-slate-800">
          Swimming Pool Summary
        </h3>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users size={17} />
          </span>
          <div>
            <p className="text-xs text-slate-400">Total Bookings</p>
            <p className="text-base font-extrabold text-slate-800">
              {poolSummary.totalBookings}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <IndianRupee size={17} />
          </span>
          <div>
            <p className="text-xs text-slate-400">Total Revenue</p>
            <p className="text-base font-extrabold text-slate-800">
              ₹{poolSummary.totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitySummaryCard;
