import { Plus } from "lucide-react";
import CricketHero from "../../components/cricket/CricketHero";
import FacilityStatCard from "../../components/facilities/FacilityStatCard";
import CricketBookingRow from "../../components/cricket/CricketBookingRow";
import CricketSummary from "../../components/cricket/CricketSummary";
import CricketRecentActivity from "../../components/cricket/CricketRecentActivity";
import CricketPromoCard from "../../components/cricket/CricketPromoCard";
import DateCard from "../../components/dashboard/DateCard";
import QuickActions from "../../components/dashboard/QuickActions";
import { cricketStats, cricketBookings } from "../../data/cricketData";

const Cricket = () => {
  return (
    <div className="grid grid-cols-1 gap-5 py-5 xl:grid-cols-[1fr_340px]">
      {/* Main column */}
      <div className="flex flex-col gap-5">
        <CricketHero />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cricketStats.map((stat) => (
            <FacilityStatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                Today's Cricket Bookings
              </h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                {cricketBookings.length} Bookings
              </span>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              <Plus size={16} />
              New Booking
            </button>
          </div>

          {/* Vertically scrollable list - rows wrap taller if needed, never scroll sideways */}
          <div className="flex max-h-[640px] flex-col gap-4 overflow-y-auto pr-1">
            {cricketBookings.map((booking) => (
              <CricketBookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      </div>

      {/* Right rail */}
      <div className="flex flex-col gap-5">
        <DateCard />
        <QuickActions />
        <CricketSummary />
        <CricketRecentActivity />
        <CricketPromoCard />
      </div>
    </div>
  );
};

export default Cricket;
