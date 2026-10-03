import { useCallback, useEffect, useState } from "react";
import HeroBanner from "../../components/dashboard/HeroBanner";
import SportStatCard from "../../components/dashboard/SportStatCard";
import RevenueOverviewChart from "../../components/dashboard/RevenueOverviewChart";
import RevenueShareChart from "../../components/dashboard/RevenueShareChart";
import TodaysBookingsTable from "../../components/dashboard/TodaysBookingsTable";
import DashboardDateCard from "../../components/dashboard/DashboardDateCard";
import QuickActions from "../../components/dashboard/QuickActions";
import TodaysSummary from "../../components/dashboard/TodaysSummary";
import RecentActivity from "../../components/dashboard/RecentActivity";
import PromoCard from "../../components/dashboard/PromoCard";
import axiosInstance from "../../api/axiosInstance";
import { sportOrder } from "../../data/dashboardData";
import { toDateKey } from "../../utils/turfRules";

const REFRESH_MS = 30 * 1000;

// Shown until the first response arrives (and if the server is unreachable)
const emptyData = {
  sports: sportOrder.map((id) => ({
    id,
    bookings: 0,
    completed: 0,
    live: 0,
    hours: 0,
    revenue: id === "swimming" ? 0 : null,
    completionRate: 0,
  })),
  trend: { days: [], series: {} },
  share: { total: 0, segments: [] },
  todaysBookings: [],
  summary: { totalBookings: 0, completed: 0, poolRevenue: 0 },
  activity: [],
};

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/dashboard", {
        params: {
          date: selectedDate, // whichever day is picked on the calendar
          tz: new Date().getTimezoneOffset(),
        },
      });
      setData(res.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const first = setTimeout(() => {
      setLoading(true);
      load();
    }, 0);
    // Keep auto-refreshing only while looking at today - a past/future date
    // picked from the calendar is static and doesn't need re-polling.
    const isToday = selectedDate === toDateKey(new Date());
    const id = isToday ? setInterval(load, REFRESH_MS) : null;
    return () => {
      clearTimeout(first);
      if (id) clearInterval(id);
    };
  }, [load, selectedDate]);

  return (
    <div className="grid grid-cols-1 gap-5 py-5 xl:grid-cols-[1fr_340px]">
      {/* Main column */}
      <div className="flex min-w-0 flex-col gap-5">
        <HeroBanner />

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
          >
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.sports.map((stat) => (
            <SportStatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <RevenueOverviewChart trend={data.trend} />
          <RevenueShareChart share={data.share} />
        </div>

        <TodaysBookingsTable bookings={data.todaysBookings} loading={loading} />
      </div>

      {/* Right rail */}
      <div className="flex min-w-0 flex-col gap-5">
        <DashboardDateCard value={selectedDate} onChange={setSelectedDate} />
        <QuickActions />
        <TodaysSummary summary={data.summary} />
        <RecentActivity activity={data.activity} />
        <PromoCard />
      </div>
    </div>
  );
};

export default Dashboard;
