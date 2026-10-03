import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  Users,
  UserCheck,
  Clock3,
  UserX,
  Wallet,
  Search,
  Phone,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import CheckInCard from "../../components/members/CheckInCard";
import PlansPanel from "../../components/members/PlansPanel";
import PlanEditorModal from "../../components/members/PlanEditorModal";
import AdmitMemberModal from "../../components/members/AdmitMemberModal";
import { rupees } from "../../utils/pricingUtils";
import {
  STATUS,
  fmtDate,
  fmtTime,
  getInitials,
  todayKey,
} from "../../utils/memberUtils";

const REFRESH_MS = 30 * 1000;

const emptyData = {
  members: [],
  stats: { total: 0, active: 0, expiring: 0, expired: 0, balanceDue: 0 },
  todayCheckIns: [],
};

const FILTERS = [
  { v: "all", label: "All" },
  { v: "active", label: "Active" },
  { v: "expiring", label: "Expiring" },
  { v: "expired", label: "Expired" },
  { v: "balance", label: "Balance due" },
];

const StatTile = ({ Icon, bg, color, label, value }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>
      <Icon size={20} />
    </span>
    <div className="min-w-0">
      <p className="truncate text-xs text-slate-400">{label}</p>
      <p className="truncate text-xl font-extrabold text-slate-800">{value}</p>
    </div>
  </div>
);

const Members = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(emptyData);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [admitOpen, setAdmitOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/members", {
        params: { today: todayKey() },
      });
      setData(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load members.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPlans = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/members/plans");
      setPlans(res.data.plans);
    } catch {
      /* the members list still works without plans */
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(() => {
      loadMembers();
      loadPlans();
    }, 0);
    const id = setInterval(loadMembers, REFRESH_MS);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [loadMembers, loadPlans]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.members.filter((m) => {
      if (filter === "active" && !["active", "expiring"].includes(m.status)) return false;
      if (filter === "expiring" && m.status !== "expiring") return false;
      if (filter === "expired" && m.status !== "expired") return false;
      if (filter === "balance" && m.balance <= 0) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        m.memberId.toLowerCase().includes(q)
      );
    });
  }, [data.members, query, filter]);

  const { stats } = data;

  return (
    <div className="flex flex-col gap-5 py-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Membership</h1>
            <p className="mt-1 text-sm text-slate-200">
              Admit members, track their plan, balance and attendance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdmitOpen(true)}
            disabled={plans.length === 0}
            className="flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-amber-300 disabled:opacity-60"
          >
            <UserPlus size={17} />
            Admit New Member
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatTile Icon={Users} bg="bg-blue-50" color="text-blue-600" label="Total members" value={stats.total} />
        <StatTile Icon={UserCheck} bg="bg-emerald-50" color="text-emerald-600" label="Active" value={stats.active} />
        <StatTile Icon={Clock3} bg="bg-amber-50" color="text-amber-600" label="Expiring (7 days)" value={stats.expiring} />
        <StatTile Icon={UserX} bg="bg-red-50" color="text-red-600" label="Expired" value={stats.expired} />
        <div className="col-span-2 lg:col-span-1">
          <StatTile Icon={Wallet} bg="bg-violet-50" color="text-violet-600" label="Balance due" value={rupees(stats.balanceDue)} />
        </div>
      </div>

      {/* Check-in + today's attendance */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CheckInCard todayCount={data.todayCheckIns.length} onCheckedIn={loadMembers} />
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Today's Attendance</h3>
          <div className="mt-3 flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
            {data.todayCheckIns.length === 0 && (
              <p className="text-sm text-slate-400">No one has checked in yet today.</p>
            )}
            {data.todayCheckIns.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="min-w-0 truncate font-semibold text-slate-700">
                  {c.name} <span className="font-medium text-slate-400">({c.memberId})</span>
                </span>
                <span className="ml-2 shrink-0 text-xs text-slate-500">
                  {fmtTime(c.at)}
                  {c.outAt ? ` → ${fmtTime(c.outAt)}` : " · inside"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PlansPanel plans={plans} onManage={() => setPlansOpen(true)} />

      {/* Members list */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-800">
            All Members <span className="text-sm font-medium text-slate-400">({shown.length})</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, mobile or ID"
              aria-label="Search members"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-base text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.v}
              type="button"
              onClick={() => setFilter(f.v)}
              aria-pressed={filter === f.v}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                filter === f.v
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {loading && <p className="col-span-full py-8 text-center text-sm text-slate-400">Loading members...</p>}
          {!loading && shown.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-slate-400">
              {data.members.length === 0 ? "No members yet. Click \"Admit New Member\"." : "No members match."}
            </p>
          )}
          {shown.map((m) => {
            const st = STATUS[m.status];
            return (
              <Link
                key={m._id}
                to={`/dashboard/members/${m._id}`}
                className="group flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {m.thumb ? (
                      <img src={m.thumb} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {getInitials(m.name)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{m.name}</p>
                      <p className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">{m.memberId}</span>
                        <Phone size={11} /> {m.mobile}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {m.activePlans.length === 0 && <span className="text-xs text-slate-400">No active plan</span>}
                  {m.activePlans.map((p) => (
                    <span key={p} className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">{p}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {m.endDate ? `Ends ${fmtDate(m.endDate)}` : "-"}
                    {m.status === "active" || m.status === "expiring" ? ` · ${m.daysLeft} days left` : ""}
                  </span>
                  <span className="flex items-center gap-2">
                    {m.balance > 0 && (
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-600">Balance {rupees(m.balance)}</span>
                    )}
                    <ChevronRight size={15} className="text-slate-300 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {admitOpen && (
        <AdmitMemberModal
          plans={plans}
          onClose={() => setAdmitOpen(false)}
          onDone={(id) => {
            setAdmitOpen(false);
            navigate(`/dashboard/members/${id}`);
          }}
        />
      )}
      {plansOpen && (
        <PlanEditorModal
          key={plans.map((p) => `${p._id}${p.offerPrice}${p.originalPrice}${p.active}`).join()}
          plans={plans}
          onClose={() => setPlansOpen(false)}
          onChanged={loadPlans}
        />
      )}
    </div>
  );
};

export default Members;
