import { useEffect, useState } from "react";
import { BookOpen, Smartphone, IndianRupee, ReceiptText } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { rupees } from "../../utils/pricingUtils";
import { shiftDateKey, toDateKey } from "../../utils/turfRules";
import { fmtDate, fmtTime } from "../../utils/memberUtils";

const SOURCE = {
  district: { label: "District App", cls: "bg-violet-50 text-violet-600" },
  turftown: { label: "Turf Town", cls: "bg-orange-50 text-orange-600" },
};

const monthStart = (key) => `${key.slice(0, 8)}01`;

const presetRange = (id) => {
  const today = toDateKey(new Date());
  if (id === "yesterday") return { from: shiftDateKey(today, -1), to: shiftDateKey(today, -1) };
  if (id === "week") return { from: shiftDateKey(today, -6), to: today };
  if (id === "month") return { from: monthStart(today), to: today };
  return { from: today, to: today };
};

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "Last 7 days" },
  { id: "month", label: "This month" },
];

const dateInput =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const Ledger = () => {
  const [preset, setPreset] = useState("today");
  const [range, setRange] = useState(() => presetRange("today"));
  const [data, setData] = useState({ key: "", entries: [], totals: null, byGame: {} });
  const [error, setError] = useState("");

  const key = `${range.from}|${range.to}`;
  const loading = data.key !== key;

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/ledger", { params: { ...range, tz: new Date().getTimezoneOffset() } })
      .then(({ data: d }) => {
        if (cancelled) return;
        setData({ key, entries: d.entries, totals: d.totals, byGame: d.byGame });
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || "Could not load the ledger.");
        setData({ key, entries: [], totals: null, byGame: {} });
      });
    return () => {
      cancelled = true;
    };
  }, [range, key]);

  const choose = (id) => {
    setPreset(id);
    setRange(presetRange(id));
  };
  const custom = (part, value) => {
    setPreset("custom");
    setRange((r) => {
      const next = { ...r, [part]: value };
      if (next.from > next.to) next[part === "from" ? "to" : "from"] = value;
      return next;
    });
  };

  const t = data.totals;

  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-violet-900 p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-violet-500/20 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
            <BookOpen size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Advance Ledger</h1>
            <p className="mt-1 text-sm text-slate-300">
              Advance amounts received through the District and Turf Town apps.
            </p>
          </div>
        </div>
      </div>

      {/* Range */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => choose(p.id)}
            aria-pressed={preset === p.id}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              preset === p.id
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <label className="flex items-center gap-1.5">
            From
            <input type="date" className={dateInput} value={range.from} max={toDateKey(new Date())} onChange={(e) => e.target.value && custom("from", e.target.value)} />
          </label>
          <label className="flex items-center gap-1.5">
            To
            <input type="date" className={dateInput} value={range.to} max={toDateKey(new Date())} onChange={(e) => e.target.value && custom("to", e.target.value)} />
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}

      {/* Totals */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { l: "District App advance", v: t?.district.advance, sub: `${t?.district.count ?? 0} bookings`, Icon: Smartphone, bg: "bg-violet-50", c: "text-violet-600" },
          { l: "Turf Town advance", v: t?.turftown.advance, sub: `${t?.turftown.count ?? 0} bookings`, Icon: Smartphone, bg: "bg-orange-50", c: "text-orange-600" },
          { l: "Total advance received", v: t?.advance, sub: `${t?.count ?? 0} bookings`, Icon: IndianRupee, bg: "bg-emerald-50", c: "text-emerald-600" },
          { l: "Cancelled (not counted)", v: t?.cancelledAdvance, sub: "may need refund", Icon: ReceiptText, bg: "bg-red-50", c: "text-red-600" },
        ].map((x) => (
          <div key={x.l} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${x.bg} ${x.c}`}>
              <x.Icon size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-400">{x.l}</p>
              <p className="truncate text-xl font-extrabold text-slate-800">{loading ? "..." : rupees(x.v)}</p>
              <p className="text-[11px] text-slate-400">{x.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Entries */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-800">
          Entries <span className="text-sm font-medium text-slate-400">({data.entries.length})</span>
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-400">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Date &amp; time</th>
                <th className="py-2 pr-4 font-medium">Customer</th>
                <th className="py-2 pr-4 font-medium">Game</th>
                <th className="py-2 pr-4 font-medium">Source</th>
                <th className="py-2 pr-4 text-right font-medium">Total</th>
                <th className="py-2 pr-4 text-right font-medium">Advance</th>
                <th className="py-2 text-right font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {!loading && data.entries.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-400">
                    No advance payments in this period.
                  </td>
                </tr>
              )}
              {data.entries.map((e, i) => (
                <tr key={e.id} className={`border-t border-slate-100 ${e.status === "cancelled" ? "opacity-50" : ""}`}>
                  <td className="py-3 pr-4 text-slate-500">{i + 1}</td>
                  <td className="py-3 pr-4 text-slate-600">
                    {fmtDate(toDateKey(new Date(e.at)))}
                    <span className="block text-xs text-slate-400">{fmtTime(e.at)}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-slate-700">{e.name}</span>
                    <span className="block text-xs text-slate-400">{e.mobile}</span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{e.gameName}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${SOURCE[e.source].cls}`}>
                      {SOURCE[e.source].label}
                    </span>
                    {e.status === "cancelled" && (
                      <span className="ml-1.5 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-500">cancelled</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-600">{rupees(e.total)}</td>
                  <td className="py-3 pr-4 text-right font-bold text-emerald-600">{rupees(e.advance)}</td>
                  <td className="py-3 text-right font-semibold text-slate-700">{rupees(e.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Ledger;
