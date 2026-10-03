import { useState } from "react";
import { Link } from "react-router-dom";
import { ScanLine, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { daysText, fmtDate, fmtTime, todayKey } from "../../utils/memberUtils";

// Member types the ID (STK-0001 or just 1) -> today's attendance is noted.
const CheckInCard = ({ todayCount, onCheckedIn }) => {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [outAt, setOutAt] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError("");
    setResult(null);
    setOutAt(null);
    try {
      const { data } = await axiosInstance.post("/members/check-in", {
        code,
        date: todayKey(),
      });
      setResult(data);
      if (data.ok) {
        setCode("");
        onCheckedIn();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not check in.");
    } finally {
      setBusy(false);
    }
  };

  const checkOut = async () => {
    setBusy(true);
    try {
      const { data } = await axiosInstance.post("/members/check-out", {
        sessionId: result.sessionId,
      });
      setOutAt(data.outAt);
      onCheckedIn();
    } catch (err) {
      setError(err.response?.data?.message || "Could not check out.");
    } finally {
      setBusy(false);
    }
  };

  const m = result?.member;
  const reasons = {
    expired: "Membership has expired.",
    upcoming: "Membership has not started yet.",
    none: "This member has no plan.",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ScanLine size={18} />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-800">Attendance Check-in</h3>
            <p className="text-xs text-slate-400">Enter the member ID</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          {todayCount} today
        </span>
      </div>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="6-digit member ID"
          autoComplete="off"
          aria-label="Member ID"
          className="w-full min-w-0 rounded-lg border border-gray-200 px-3 py-2.5 text-base font-semibold uppercase tracking-wide text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy && <Loader2 size={15} className="animate-spin" />}
          Check in
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {m && result.ok && (
        <div role="status" className="mt-3 flex items-start gap-3 rounded-xl bg-emerald-50 p-3">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
          <div className="min-w-0 text-sm">
            <p className="font-bold text-emerald-800">
              {m.name} ({m.memberId}){" "}
              {outAt ? "checked out" : result.alreadyCheckedIn ? "is already inside" : "checked in"}
            </p>
            <p className="text-xs text-emerald-700">
              {outAt ? `Out at ${fmtTime(outAt)} · ` : `In at ${fmtTime(result.at)} · `}valid till {fmtDate(m.endDate)} ·{" "}
              {daysText(m.subscriptions.find((s) => s.status === "active"))}
              {m.balance > 0 && ` · balance ₹${m.balance}`}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {!outAt && (
                <button type="button" onClick={checkOut} disabled={busy} className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm hover:bg-emerald-100 disabled:opacity-60">
                  Check out now
                </button>
              )}
              <Link to={`/dashboard/members/${m._id}`} className="text-xs font-semibold text-emerald-700 underline">
                Open profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {m && !result.ok && (
        <div role="alert" className="mt-3 flex items-start gap-3 rounded-xl bg-red-50 p-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" />
          <div className="text-sm">
            <p className="font-bold text-red-800">
              {m.name} ({m.memberId}) - not allowed
            </p>
            <p className="text-xs text-red-700">
              {reasons[result.reason]}
              {m.endDate && ` Ended on ${fmtDate(m.endDate)}.`} Renew the subscription to continue.
            </p>
            <Link to={`/dashboard/members/${m._id}`} className="text-xs font-semibold text-red-700 underline">
              Open profile &amp; renew
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInCard;
