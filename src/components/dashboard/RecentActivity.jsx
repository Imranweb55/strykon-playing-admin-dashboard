import { UserPlus, XCircle } from "lucide-react";

const kindStyle = {
  created: { Icon: UserPlus, color: "bg-emerald-500" },
  cancelled: { Icon: XCircle, color: "bg-red-500" },
};

const formatAt = (value) =>
  new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const RecentActivity = ({ activity: activities }) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
        <button className="text-xs font-semibold text-amber-500">
          View All →
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {activities.length === 0 && (
          <p className="text-sm text-slate-400">No activity yet today.</p>
        )}
        {activities.map((activity) => {
          const { Icon, color } = kindStyle[activity.kind];
          return (
            <div
              key={activity.id}
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
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-400">{activity.subtitle}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {formatAt(activity.at)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
