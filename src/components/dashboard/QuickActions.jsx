import { UserPlus, CalendarPlus, BarChart3, Users } from "lucide-react";
import { quickActions } from "../../data/dashboardData";

const iconMap = { UserPlus, CalendarPlus, BarChart3, Users };

const QuickActions = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">Quick Actions</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = iconMap[action.icon];
          return (
            <button
              key={action.id}
              className="flex flex-col items-start gap-2.5 rounded-xl border border-gray-100 p-3.5 text-left transition-colors hover:bg-slate-50"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-white ${action.color}`}
              >
                <Icon size={17} />
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
