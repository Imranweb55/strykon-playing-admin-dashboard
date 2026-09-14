import { Waves, Dribbble, CircleDot, Zap, ChevronDown } from "lucide-react";

// One icon per sport. Add more here if new sports are introduced later.
const sportIconMap = {
  swimming: Waves,
  basketball: Dribbble,
  pickleball: CircleDot,
  cricket: Zap,
};

const SportStatCard = ({ stat }) => {
  const Icon = sportIconMap[stat.id] || Waves;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header: icon + name + period dropdown */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${stat.color}1A`, color: stat.color }}
          >
            <Icon size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-800">{stat.name}</p>
            <p className="text-xs text-slate-400">{stat.subtitle}</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-xs font-medium text-slate-400">
          {stat.period}
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Bookings / Completed */}
      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Bookings</p>
          <p className="text-xl font-extrabold text-slate-800">
            {stat.bookings}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Completed</p>
          <p className="text-xl font-extrabold text-slate-800">
            {stat.completed}
          </p>
        </div>
      </div>

      {/* Revenue only */}
      <div className="mt-4">
        <p className="text-xs text-slate-400">Revenue</p>
        <p className="text-lg font-extrabold text-slate-800">
          ₹{stat.revenue.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Completion progress bar */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full"
            style={{
              width: `${stat.completionRate}%`,
              backgroundColor: stat.color,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {stat.completionRate}% completion rate
        </p>
      </div>

      <button
        className="mt-3 self-start text-xs font-semibold"
        style={{ color: stat.color }}
      >
        View Details →
      </button>
    </div>
  );
};

export default SportStatCard;
