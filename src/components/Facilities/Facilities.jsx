import { Plus } from "lucide-react";
import FacilityHero from "../../components/facilities/FacilityHero";
import FacilityStatCard from "../../components/facilities/FacilityStatCard";
import BookingCard from "../../components/facilities/BookingCard";
import FacilitySummaryCard from "../../components/facilities/FacilitySummaryCard";
import PaymentBreakdownCard from "../../components/facilities/PaymentBreakdownCard";
import FacilityRecentActivity from "../../components/facilities/FacilityRecentActivity";
import DateCard from "../../components/dashboard/DateCard";
import { facilityStats, poolBookings } from "../../data/facilitiesData";

const Facilities = () => {
  return (
    <div className="grid grid-cols-1 gap-5 py-5 xl:grid-cols-[1fr_340px]">
      {/* Main column */}
      <div className="flex flex-col gap-5">
        <FacilityHero />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {facilityStats.map((stat) => (
            <FacilityStatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                Today's Swimming Pool Bookings
              </h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {poolBookings.length} Bookings
              </span>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              <Plus size={16} />
              New Booking
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {poolBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      </div>

      {/* Right rail */}
      <div className="flex flex-col gap-5">
        <DateCard />
        <FacilitySummaryCard />
        <PaymentBreakdownCard />
        <FacilityRecentActivity />
      </div>
    </div>
  );
};

export default Facilities;
