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
  Settings2,
  BookOpen,
  Wallet2,
  Smartphone,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import CheckInCard from "../../components/members/CheckInCard";
import PlanEditorModal from "../../components/members/PlanEditorModal";
import AdmitMemberModal from "../../components/members/AdmitMemberModal";
import { rupees } from "../../utils/pricingUtils";
import { shiftDateKey, toDateKey } from "../../utils/turfRules";
import {
  STATUS,
  fmtDate,
  fmtTime,
  getInitials,
  todayKey,
} from "../../utils/memberUtils";

const REFRESH_MS = 30 * 1000;
const CATEGORY = "skating";

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

const monthStart = (key) => `${key.slice(0, 8)}01`;
const presetRange = (id) => {
  const today = toDateKey(new Date());
  if (id === "week") return { from: shiftDateKey(today, -6), to: today };
  if (id === "month") return { from: monthStart(today), to: today };
  return { from: today, to: today };
};
const LEDGER_PRESETS = [
  { id: "today", label: "Today" },
  { id: "week", label: "Last 7 days" },
  { id: "month", label: "This month" },
];
const dateInput =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

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

const Skating = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(emptyData);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [admitOpen, setAdmitOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);

  // Ledger
  const [ledgerPreset, setLedgerPreset] = useState("today");
  const [range, setRange] = useState(() => presetRange("today"));
  const [ledger, setLedger] = useState({ key: "", entries: [], totals: null });
  const [ledgerError, setLedgerError] = useState("");

  const plans = useMemo(() => allPlans.filter((p) => p.category === CATEGORY), [allPlans]);

  const loadMembers = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/members", {
        params: { today: todayKey(), category: CATEGORY },
      });
      setData(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load skating members.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPlans = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/members/plans");
      setAllPlans(res.data.plans);
    } catch {
      /* the member list still works without plans */
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

  const ledgerKey = `${range.from}|${range.to}`;
  const ledgerLoading = ledger.key !== ledgerKey;

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/skating/ledger", { params: { ...range, tz: new Date().getTimezoneOffset() } })
      .then(({ data: d }) => {
        if (cancelled) return;
        setLedger({ key: ledgerKey, entries: d.entries, totals: d.totals });
        setLedgerError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setLedgerError(err.response?.data?.message || "Could not load the ledger.");
        setLedger({ key: ledgerKey, entries: [], totals: null });
      });
    return () => {
      cancelled = true;
    };
  }, [range, ledgerKey]);

  const chooseLedgerPreset = (id) => {
    setLedgerPreset(id);
    setRange(presetRange(id));
  };

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
  const lt = ledger.totals;

  return (
    <div className="flex flex-col gap-5 py-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-violet-900 to-violet-700 p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-violet-400/20 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Skating Coaching</h1>
            <p className="mt-1 text-sm text-slate-200">
              Members-only coaching, daily 4:00-6:00 PM. Admit skaters, check
              them in and track the ledger.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdmitOpen(true)}
            disabled={plans.length === 0}
            className="flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-amber-300 disabled:opacity-60"
          >
            <UserPlus size={17} />
            Admit Skater
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
        <StatTile Icon={Users} bg="bg-violet-50" color="text-violet-600" label="Total skaters" value={stats.total} />
        <StatTile Icon={UserCheck} bg="bg-emerald-50" color="text-emerald-600" label="Active" value={stats.active} />
        <StatTile Icon={Clock3} bg="bg-amber-50" color="text-amber-600" label="Expiring soon" value={stats.expiring} />
        <StatTile Icon={UserX} bg="bg-red-50" color="text-red-600" label="Expired" value={stats.expired} />
        <div className="col-span-2 lg:col-span-1">
          <StatTile Icon={Wallet} bg="bg-blue-50" color="text-blue-600" label="Balance due" value={rupees(stats.balanceDue)} />
        </div>
      </div>

      {/* Check-in + today's attendance */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CheckInCard todayCount={data.todayCheckIns.length} onCheckedIn={loadMembers} />
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Today's Attendance</h3>
          <div className="mt-3 flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
            {data.todayCheckIns.length === 0 && (
              <p className="text-sm text-slate-400">No skater has checked in yet today.</p>
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

      {/* Plans */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Skating Plans</h2>
            <p className="text-xs text-slate-400">
              Price and access days are fully customizable per plan - 0 days means every day of the month.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPlansOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Settings2 size={14} />
            Manage plans
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {plans.length === 0 && (
            <p className="text-sm text-slate-400">No skating plans yet - add one from Manage plans.</p>
          )}
          {plans.map((p) => (
            <div key={p._id} className={`rounded-2xl border p-4 ${p.active ? "border-violet-100" : "border-gray-100 opacity-60"}`}>
              <p className="text-sm font-bold text-slate-800">{p.name}</p>
              <p className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-violet-700">{rupees(p.offerPrice)}</span>
                {p.originalPrice > p.offerPrice && (
                  <span className="text-xs text-slate-400 line-through">{rupees(p.originalPrice)}</span>
                )}
                <span className="text-xs font-medium text-slate-400">/ {p.months} {p.months === 1 ? "month" : "months"}</span>
              </p>
              <p className="mt-1 text-xs font-semibold text-violet-600">
                {p.sessionLimit > 0 ? `${p.sessionLimit} days access` : "Every day access"}
              </p>
              {!p.active && <p className="mt-1 text-xs font-semibold text-slate-400">Inactive</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Members list */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-800">
            Skaters <span className="text-sm font-medium text-slate-400">({shown.length})</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, mobile or ID"
              aria-label="Search skaters"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-base text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
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
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {loading && <p className="col-span-full py-8 text-center text-sm text-slate-400">Loading skaters...</p>}
          {!loading && shown.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-slate-400">
              {data.members.length === 0 ? "No skaters yet. Click \"Admit Skater\"." : "No skaters match."}
            </p>
          )}
          {shown.map((m) => {
            const st = STATUS[m.status];
            return (
              <Link
                key={m._id}
                to={`/dashboard/members/${m._id}`}
                className="group flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 transition hover:border-violet-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {m.thumb ? (
                      <img src={m.thumb} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
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
                    <span key={p} className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">{p}</span>
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

      {/* Ledger */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <BookOpen size={18} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Skating Ledger</h2>
            <p className="text-xs text-slate-400">Every payment collected on skating plans.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {LEDGER_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => chooseLedgerPreset(p.id)}
              aria-pressed={ledgerPreset === p.id}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                ledgerPreset === p.id
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="ml-auto flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <label className="flex items-center gap-1.5">
              From
              <input
                type="date"
                className={dateInput}
                value={range.from}
                max={toDateKey(new Date())}
                onChange={(e) => {
                  if (!e.target.value) return;
                  setLedgerPreset("custom");
                  setRange((r) => ({ ...r, from: e.target.value }));
                }}
              />
            </label>
            <label className="flex items-center gap-1.5">
              To
              <input
                type="date"
                className={dateInput}
                value={range.to}
                max={toDateKey(new Date())}
                onChange={(e) => {
                  if (!e.target.value) return;
                  setLedgerPreset("custom");
                  setRange((r) => ({ ...r, to: e.target.value }));
                }}
              />
            </label>
          </div>
        </div>

        {ledgerError && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{ledgerError}</p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet2 size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-400">Cash collected</p>
              <p className="truncate text-xl font-extrabold text-slate-800">{ledgerLoading ? "..." : rupees(lt?.cash)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Smartphone size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-400">Online collected</p>
              <p className="truncate text-xl font-extrabold text-slate-800">{ledgerLoading ? "..." : rupees(lt?.online)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BookOpen size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-400">Total collected</p>
              <p className="truncate text-xl font-extrabold text-slate-800">{ledgerLoading ? "..." : rupees(lt?.total)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-400">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Date &amp; time</th>
                <th className="py-2 pr-4 font-medium">Skater</th>
                <th className="py-2 pr-4 font-medium">Plan</th>
                <th className="py-2 pr-4 font-medium">Mode</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {!ledgerLoading && ledger.entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                    No payments in this period.
                  </td>
                </tr>
              )}
              {ledger.entries.map((e, i) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="py-3 pr-4 text-slate-500">{i + 1}</td>
                  <td className="py-3 pr-4 text-slate-600">
                    {fmtDate(toDateKey(new Date(e.at)))}
                    <span className="block text-xs text-slate-400">{fmtTime(e.at)}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-slate-700">{e.memberName}</span>
                    <span className="block text-xs text-slate-400">{e.memberCode}</span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{e.planName}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600">
                      {e.mode}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-slate-800">{rupees(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
          key={allPlans.map((p) => `${p._id}${p.offerPrice}${p.originalPrice}${p.sessionLimit}${p.active}`).join()}
          plans={allPlans}
          onClose={() => setPlansOpen(false)}
          onChanged={loadPlans}
        />
      )}
    </div>
  );
};

export default Skating;
