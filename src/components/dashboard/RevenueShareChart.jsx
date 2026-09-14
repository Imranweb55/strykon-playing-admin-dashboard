import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { revenueShare } from "../../data/dashboardData";

const RevenueShareChart = () => {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-bold text-slate-800">
        Total Revenue Share
      </h3>

      <div className="relative mx-auto mt-2 h-56 w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={revenueShare.segments}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {revenueShare.segments.map((segment) => (
                <Cell key={segment.name} fill={segment.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-lg font-extrabold text-slate-800">
            ₹{revenueShare.total.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-400">{revenueShare.label}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {revenueShare.segments.map((segment) => (
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
              {segment.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueShareChart;
