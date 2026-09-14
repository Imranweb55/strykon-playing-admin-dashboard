import { CalendarCheck2, CheckCircle2, IndianRupee } from "lucide-react";
import { todaysOverallSummary } from "../../data/dashboardData";

const iconMap = { CalendarCheck2, CheckCircle2, IndianRupee };

const TodaysSummary = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">
        Today's Overall Summary
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {todaysOverallSummary.map((item, index) => {
          const Icon = iconMap[item.icon];
          const isLast =
            index === todaysOverallSummary.length - 1 &&
            todaysOverallSummary.length % 2 !== 0;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border border-gray-100 p-3.5 ${isLast ? "col-span-2" : ""}`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
              >
                <Icon size={17} />
              </span>
              <div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-base font-extrabold text-slate-800">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodaysSummary;
