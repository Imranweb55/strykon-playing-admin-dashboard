import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { revenueOverview } from "../../data/dashboardData";

// Reshape { days, series } into the array-of-objects format recharts expects
const chartData = revenueOverview.days.map((day, index) => {
  const point = { day };
  revenueOverview.series.forEach((s) => {
    point[s.key] = s.values[index];
  });
  return point;
});

const RevenueOverviewChart = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Revenue Overview
          </h3>
          <p className="text-xs text-slate-400">Last 7 days</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {revenueOverview.series.map((s) => (
            <span
              key={s.key}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v / 1000}K`}
              tick={{ fontSize: 12, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
            />
            {revenueOverview.series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueOverviewChart;
