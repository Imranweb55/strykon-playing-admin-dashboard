import { Users, CalendarCheck2, IndianRupee, Wallet } from "lucide-react";

const iconMap = { Users, CalendarCheck2, IndianRupee, Wallet };

const FacilityStatCard = ({ stat }) => {
  const Icon = iconMap[stat.icon] || Users;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
        >
          <Icon size={20} />
        </span>
        <div>
          {stat.titleLines.map((line) => (
            <p
              key={line}
              className={`text-sm font-semibold leading-tight ${stat.titleColor}`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <p className="mt-4 text-2xl font-extrabold text-slate-800">
        {stat.value}
      </p>
      <p className={`mt-1 text-xs font-medium ${stat.noteColor}`}>
        {stat.note}
      </p>
    </div>
  );
};

export default FacilityStatCard;
