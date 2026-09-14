import { CheckCircle2, Waves, Dribbble, CircleDot, Zap } from "lucide-react";
import { todaysBookings } from "../../data/dashboardData";

const sportIconMap = {
  Swimming: Waves,
  Basketball: Dribbble,
  Pickleball: CircleDot,
  Cricket: Zap,
};

const TodaysBookingsTable = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-blue-600" />
          <h3 className="text-base font-bold text-slate-800">
            Today's Bookings (Completed)
          </h3>
        </div>
        <button className="text-xs font-semibold text-amber-500">
          View All →
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-xs text-slate-400">
              <th className="py-2 pr-4 font-medium">#</th>
              <th className="py-2 pr-4 font-medium">Game</th>
              <th className="py-2 pr-4 font-medium">Member Name</th>
              <th className="py-2 pr-4 font-medium">Time</th>
              <th className="py-2 pr-4 font-medium">Duration</th>
              <th className="py-2 pr-4 font-medium">Amount</th>
              <th className="py-2 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {todaysBookings.map((booking, index) => {
              const Icon = sportIconMap[booking.game] || Waves;
              return (
                <tr key={booking.id} className="border-t border-slate-50">
                  <td className="py-3 pr-4 text-slate-500">{index + 1}</td>
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: `${booking.color}1A`,
                          color: booking.color,
                        }}
                      >
                        <Icon size={13} />
                      </span>
                      {booking.game}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{booking.member}</td>
                  <td className="py-3 pr-4 text-slate-500">{booking.time}</td>
                  <td className="py-3 pr-4 text-slate-500">
                    {booking.duration}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-slate-700">
                    ₹{booking.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      {booking.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TodaysBookingsTable;
