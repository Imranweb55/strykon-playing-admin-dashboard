import { UserPlus, IndianRupee, CheckCircle2 } from "lucide-react";
import { facilityRecentActivity } from "../../data/facilitiesData";

const iconMap = { UserPlus, IndianRupee, CheckCircle2 };

const FacilityRecentActivity = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
        <button className="text-xs font-semibold text-amber-500">
          View All →
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {facilityRecentActivity.map((activity) => {
          const Icon = iconMap[activity.icon];
          return (
            <div
              key={activity.id}
              className="flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${activity.color}`}
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
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FacilityRecentActivity;
