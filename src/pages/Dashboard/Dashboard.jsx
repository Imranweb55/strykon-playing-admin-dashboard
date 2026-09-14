import HeroBanner from "../../components/dashboard/HeroBanner";
import SportStatCard from "../../components/dashboard/SportStatCard";
import RevenueOverviewChart from "../../components/dashboard/RevenueOverviewChart";
import RevenueShareChart from "../../components/dashboard/RevenueShareChart";
import TodaysBookingsTable from "../../components/dashboard/TodaysBookingsTable";
import DateCard from "../../components/dashboard/DateCard";
import QuickActions from "../../components/dashboard/QuickActions";
import TodaysSummary from "../../components/dashboard/TodaysSummary";
import RecentActivity from "../../components/dashboard/RecentActivity";
import PromoCard from "../../components/dashboard/PromoCard";
import { sportStats } from "../../data/dashboardData";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 gap-5 py-5 xl:grid-cols-[1fr_340px]">
      {/* Main column */}
      <div className="flex flex-col gap-5">
        <HeroBanner />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {sportStats.map((stat) => (
            <SportStatCard key={stat.id} stat={stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <RevenueOverviewChart />
          <RevenueShareChart />
        </div>

        <TodaysBookingsTable />
      </div>

      {/* Right rail */}
      <div className="flex flex-col gap-5">
        <DateCard />
        <QuickActions />
        <TodaysSummary />
        <RecentActivity />
        <PromoCard />
      </div>
    </div>
  );
};

export default Dashboard;
