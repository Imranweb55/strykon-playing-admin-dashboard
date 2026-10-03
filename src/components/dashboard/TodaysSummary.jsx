import { CalendarCheck2, CheckCircle2, IndianRupee } from "lucide-react";

const iconMap = { CalendarCheck2, CheckCircle2, IndianRupee };

const TodaysSummary = ({ summary }) => {
  const todaysOverallSummary = [
    {
      id: "total-bookings",
      label: "Total Bookings",
      value: summary.totalBookings,
      icon: "CalendarCheck2",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "completed",
      label: "Completed",
      value: summary.completed,
      icon: "CheckCircle2",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "total-revenue",
      label: "Pool Revenue",
      value: `₹${summary.poolRevenue.toLocaleString("en-IN")}`,
      icon: "IndianRupee",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

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
