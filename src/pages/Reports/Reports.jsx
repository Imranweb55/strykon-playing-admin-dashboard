import { FileText, Waves, Dribbble, CircleDot, Zap, LayoutGrid } from "lucide-react";
import ReportCard from "../../components/reports/ReportCard";

const GAME_CARDS = [
  { gameId: "swimming", title: "Swimming Pool", Icon: Waves, color: "text-blue-600", bg: "bg-blue-50" },
  { gameId: "basketball", title: "Basketball", Icon: Dribbble, color: "text-orange-600", bg: "bg-orange-50" },
  { gameId: "pickleball", title: "Pickleball", Icon: CircleDot, color: "text-emerald-600", bg: "bg-emerald-50" },
  { gameId: "cricket", title: "Cricket", Icon: Zap, color: "text-red-600", bg: "bg-red-50" },
];

const Reports = () => (
  <div className="flex flex-col gap-5 py-5">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 sm:p-8">
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-blue-500/20 blur-2xl" />
      <div className="relative flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
          <FileText size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Reports</h1>
          <p className="mt-1 text-sm text-slate-300">
            Download a PDF ledger - daily, weekly or monthly - for each game or for
            everything combined.
          </p>
        </div>
      </div>
    </div>

    {/* Overall - all games combined */}
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          <LayoutGrid size={18} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Overall Ledger</h2>
          <p className="text-xs text-slate-400">All four games combined in one PDF.</p>
        </div>
      </div>
      <div className="max-w-sm">
        <ReportCard
          gameId={null}
          title="All Games (Overall)"
          Icon={LayoutGrid}
          color="text-violet-600"
          bg="bg-violet-50"
        />
      </div>
    </section>

    {/* Per game */}
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Per-Game Ledgers</h2>
        <p className="text-xs text-slate-400">
          A separate PDF for each sport - pick the period and date on its card.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {GAME_CARDS.map((g) => (
          <ReportCard key={g.gameId} {...g} />
        ))}
      </div>
    </section>

    <p className="text-xs text-slate-400">
      Every PDF lists the total bookings, customer &amp; booking details, District
      App and Turf Town advances, and the payments collected on-spot, through
      District and through Turf Town for the chosen period.
    </p>
  </div>
);

export default Reports;
