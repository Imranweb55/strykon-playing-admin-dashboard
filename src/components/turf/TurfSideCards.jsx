import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Hourglass,
  UserPlus,
} from "lucide-react";
import { formatMinutes } from "../../utils/turfRules";

const Tile = ({ Icon, bg, color, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3.5">
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${color}`}
    >
      <Icon size={17} />
    </span>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-base font-extrabold text-slate-800">{value}</p>
    </div>
  </div>
);

export const TurfSummaryCard = ({ title, summary }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <h3 className="text-base font-bold text-slate-800">{title}</h3>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Tile
        Icon={CalendarCheck2}
        bg="bg-blue-50"
        color="text-blue-600"
        label="Total Bookings"
        value={summary.total}
      />
      <Tile
        Icon={CheckCircle2}
        bg="bg-emerald-50"
        color="text-emerald-600"
        label="Completed"
        value={summary.completed}
      />
      <Tile
        Icon={Hourglass}
        bg="bg-amber-50"
        color="text-amber-600"
        label="Booked Hours"
        value={summary.hours}
      />
      <Tile
        Icon={XCircle}
        bg="bg-rose-50"
        color="text-rose-600"
        label="Cancelled"
        value={summary.cancelled}
      />
    </div>
  </div>
);

const MAX_ITEMS = 6;

export const TurfActivity = ({ bookings }) => {
  const events = [];
  bookings.forEach((b) => {
    events.push({
      id: `${b._id}-c`,
      kind: "created",
      title: "New booking registered",
      subtitle: `${b.name} - ${b.optionLabel}, ${formatMinutes(b.startMin)}`,
      at: b.createdAt,
    });
    if (b.status === "cancelled" && b.cancelledAt) {
      events.push({
        id: `${b._id}-x`,
        kind: "cancelled",
        title: "Booking cancelled",
        subtitle: b.name,
        at: b.cancelledAt,
      });
    }
  });
  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
      <div className="mt-4 flex flex-col gap-4">
        {events.length === 0 && (
          <p className="text-sm text-slate-400">No activity yet.</p>
        )}
        {events.slice(0, MAX_ITEMS).map((ev) => {
          const Icon = ev.kind === "created" ? UserPlus : XCircle;
          const color = ev.kind === "created" ? "bg-blue-500" : "bg-red-500";
          return (
            <div key={ev.id} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${color}`}
                >
                  <Icon size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {ev.title}
                  </p>
                  <p className="text-xs text-slate-400">{ev.subtitle}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {new Date(ev.at).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
