import { UserPlus, XCircle } from "lucide-react";
import { formatTime } from "../../utils/poolBookingUtils";

const MAX_ITEMS = 6;

// Built from real bookings: one "booked" event per booking, plus a
// "cancelled" event for cancelled ones. Newest first.
const buildActivity = (bookings) => {
  const events = [];
  bookings.forEach((b) => {
    events.push({
      id: `${b._id}-created`,
      kind: "created",
      title: "New booking registered",
      subtitle: `${b.name} - ${b.persons} ${b.persons === 1 ? "person" : "persons"}`,
      at: b.createdAt,
    });
    if (b.status === "cancelled" && b.cancelledAt) {
      events.push({
        id: `${b._id}-cancelled`,
        kind: "cancelled",
        title: "Booking cancelled",
        subtitle: b.name,
        at: b.cancelledAt,
      });
    }
  });
  return events
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, MAX_ITEMS);
};

const kindStyle = {
  created: { Icon: UserPlus, color: "bg-blue-500" },
  cancelled: { Icon: XCircle, color: "bg-red-500" },
};

const FacilityRecentActivity = ({ bookings = [] }) => {
  const activity = buildActivity(bookings);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>

      <div className="mt-4 flex flex-col gap-4">
        {activity.length === 0 && (
          <p className="text-sm text-slate-400">No activity yet today.</p>
        )}
        {activity.map((item) => {
          const { Icon, color } = kindStyle[item.kind];
          return (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${color}`}
                >
                  <Icon size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {formatTime(item.at)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FacilityRecentActivity;
