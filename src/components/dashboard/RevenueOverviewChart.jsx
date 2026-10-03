import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { sportMeta, sportOrder } from "../../data/dashboardData";

const dayLabel = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

// Turf games do not store an amount, so the chart compares bookings per game.
const RevenueOverviewChart = ({ trend }) => {
  const series = sportOrder.map((key) => ({ key, ...sportMeta[key] }));
  // Reshape { days, series } into the array-of-objects format recharts expects
  const chartData = trend.days.map((day, index) => {
    const point = { day: dayLabel(day) };
    series.forEach((s) => {
      point[s.key] = trend.series[s.key]?.[index] ?? 0;
    });
    return point;
  });

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Bookings Overview
          </h3>
          <p className="text-xs text-slate-400">Last 7 days</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {series.map((s) => (
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
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => `${value} bookings`}
            />
            {series.map((s) => (
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
