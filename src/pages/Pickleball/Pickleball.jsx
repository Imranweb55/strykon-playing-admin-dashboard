import { Plus } from "lucide-react";
import PickleballHero from "../../components/pickleball/PickleballHero";
import FacilityStatCard from "../../components/facilities/FacilityStatCard";
import PickleballBookingRow from "../../components/pickleball/PickleballBookingRow";
import PickleballSummary from "../../components/pickleball/PickleballSummary";
import PickleballRecentActivity from "../../components/pickleball/PickleballRecentActivity";
import PickleballPromoCard from "../../components/pickleball/PickleballPromoCard";
import DateCard from "../../components/dashboard/DateCard";
import QuickActions from "../../components/dashboard/QuickActions";
import { pickleballStats, pickleballBookings } from "../../data/pickleballData";

const Pickleball = () => {
  return (
    <div className="grid grid-cols-1 gap-5 py-5 xl:grid-cols-[1fr_340px]">
      {/* Main column */}
      <div className="flex flex-col gap-5">
        <PickleballHero />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {pickleballStats.map((stat) => (
            <FacilityStatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                Today's Pickleball Bookings
              </h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                {pickleballBookings.length} Bookings
              </span>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              <Plus size={16} />
              New Booking
            </button>
          </div>

          {/* Vertically scrollable list - rows wrap taller if needed, never scroll sideways */}
          <div className="flex max-h-[640px] flex-col gap-4 overflow-y-auto pr-1">
            {pickleballBookings.map((booking) => (
              <PickleballBookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      </div>

      {/* Right rail */}
      <div className="flex flex-col gap-5">
        <DateCard />
        <QuickActions />
        <PickleballSummary />
        <PickleballRecentActivity />
        <PickleballPromoCard />
      </div>
    </div>
  );
};

export default Pickleball;
