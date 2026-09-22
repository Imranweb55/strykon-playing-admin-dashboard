import { Plus } from "lucide-react";
import BasketballHero from "../../components/basketball/BasketballHero";
import FacilityStatCard from "../../components/facilities/FacilityStatCard";
import BasketballBookingRow from "../../components/basketball/BasketballBookingRow";
import BasketballSummary from "../../components/basketball/BasketballSummary";
import DateCard from "../../components/dashboard/DateCard";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentActivity from "../../components/dashboard/RecentActivity";
import { basketballStats, basketballBookings } from "../../data/basketballData";

const Basketball = () => {
  return (
    <div className="grid grid-cols-1 gap-5 py-5 xl:grid-cols-[1fr_340px]">
      {/* Main column */}
      <div className="flex flex-col gap-5">
        <BasketballHero />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {basketballStats.map((stat) => (
            <FacilityStatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                Today's Basketball Bookings
              </h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {basketballBookings.length} Bookings
              </span>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              <Plus size={16} />
              New Booking
            </button>
          </div>

          {/* Fixed-height scrollable list - rows stack downward, scroll to see more */}
          <div className="flex max-h-[640px] flex-col gap-4 overflow-y-auto pr-1">
            {basketballBookings.map((booking) => (
              <BasketballBookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      </div>

      {/* Right rail */}
      <div className="flex flex-col gap-5">
        <DateCard />
        <QuickActions />
        <BasketballSummary />
        <RecentActivity />
      </div>
    </div>
  );
};

export default Basketball;
