import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { sportMeta } from "../../data/dashboardData";

const RevenueShareChart = ({ share }) => {
  const segments = share.segments.map((s) => ({
    ...s,
    name: sportMeta[s.id].name,
    color: sportMeta[s.id].color,
    percent: share.total ? Math.round((s.value / share.total) * 100) : 0,
  }));
  // Grey ring while there are no bookings yet
  const ringData = share.total
    ? segments
    : [{ name: "None", value: 1, color: "#E2E8F0", percent: 0 }];

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-bold text-slate-800">
        Bookings Share
      </h3>

      <div className="relative mx-auto mt-2 h-56 w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ringData}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {ringData.map((segment) => (
                <Cell key={segment.name} fill={segment.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-lg font-extrabold text-slate-800">
            {share.total}
          </p>
          <p className="text-xs text-slate-400">Bookings today</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {segments.map((segment) => (
          <div
            key={segment.name}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              {segment.name}
            </span>
            <span className="font-semibold text-slate-700">
              {segment.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueShareChart;
