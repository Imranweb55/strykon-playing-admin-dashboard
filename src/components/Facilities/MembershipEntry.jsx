import { useState } from "react";
import {
  Search,
  Loader2,
  UserCheck,
  AlertCircle,
  ShieldCheck,
  Phone,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { STATUS, fmtDate, fmtTime, getInitials, todayKey } from "../../utils/memberUtils";

// Pool entry with a membership: 6-digit ID -> member photo + plan are shown
// so the admin can confirm it is the same person standing at the counter ->
// check in. The card then appears in the swimming pool list.
const MembershipEntry = ({ onCreated, onClose }) => {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState(null); // lookup response
  const [error, setError] = useState("");

  const lookup = async () => {
    if (code.length < 6) return setError("Enter the 6-digit member ID");
    setBusy(true);
    setError("");
    setFound(null);
    try {
      const { data } = await axiosInstance.get("/members/lookup", {
        params: { code, today: todayKey() },
      });
      setFound(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find the member.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await axiosInstance.post("/pool-bookings/membership-checkin", {
        code: found.member.memberId,
        date: todayKey(),
      });
      onCreated(data.booking, data.serverTime);
    } catch (err) {
      setError(err.response?.data?.message || "Could not check in.");
      setBusy(false);
    }
  };

  const reset = () => {
    setFound(null);
    setCode("");
    setError("");
  };

  const m = found?.member;
  const st = m ? STATUS[m.status] : null;

  return (
    <div className="mt-5">
      {!found && (
        <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4 sm:p-5">
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <ShieldCheck size={16} className="text-blue-600" />
              Membership ID
            </span>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    lookup();
                  }
                }}
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                placeholder="6-digit ID"
                aria-label="Membership ID"
                className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-2xl font-extrabold tracking-[0.4em] text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={lookup}
                disabled={busy || code.length < 6}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Enter
              </button>
            </div>
          </label>
          <p className="mt-2 text-xs text-slate-400">
            Ask for the member ID given at admission. Their photo and plan will
            be shown to verify.
          </p>
        </div>
      )}

      {m && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
            {m.photo ? (
              <img
                src={m.photo}
                alt={m.name}
                className="mx-auto h-44 w-44 shrink-0 rounded-2xl object-cover shadow sm:mx-0"
              />
            ) : (
              <div className="mx-auto flex h-44 w-44 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-4xl font-extrabold text-blue-700 sm:mx-0">
                {getInitials(m.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-xl font-extrabold text-slate-800">{m.name}</h3>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700">ID {m.memberId}</span>
                <span>Age {m.age}</span>
                <span className="flex items-center gap-1"><Phone size={13} /> {m.mobile}</span>
              </p>

              <div className="mt-3 flex flex-col gap-1.5">
                {m.subscriptions.map((s) => (
                  <div key={s._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                    <span className="font-semibold text-slate-700">{s.planName}</span>
                    <span className={s.status === "active" ? "text-emerald-600" : "text-slate-400"}>
                      {fmtDate(s.startDate)} → {fmtDate(s.endDate)}
                      {s.status === "active" && ` · ${s.daysLeft} days left`}
                      {s.status === "expired" && " · expired"}
                    </span>
                  </div>
                ))}
              </div>
              {m.balance > 0 && (
                <p className="mt-2 text-xs font-semibold text-amber-600">Balance due ₹{m.balance}</p>
              )}
            </div>
          </div>

          {found.insideSince && (
            <p className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700">
              <AlertCircle size={16} /> Already inside since {fmtTime(found.insideSince)}. Finish that card first.
            </p>
          )}
          {!found.poolAllowed && (
            <p className="flex items-center gap-2 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
              <AlertCircle size={16} /> No active swimming plan - renew the membership to allow entry.
            </p>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} disabled={busy} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
        {found && (
          <>
            <button type="button" onClick={reset} disabled={busy} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Not this person
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy || !found.poolAllowed || Boolean(found.insideSince)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <UserCheck size={16} />}
              Same person - Check in
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MembershipEntry;
