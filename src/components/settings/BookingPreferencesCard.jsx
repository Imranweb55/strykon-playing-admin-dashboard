import { useState } from "react";
import { SlidersHorizontal, Loader2, CheckCircle2, Timer, BellRing } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const inputClass =
  "w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-base font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const digits = (v) => v.replace(/\D/g, "");

const Row = ({ Icon, color, bg, title, hint, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-3.5">
    <div className="flex items-center gap-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
        <Icon size={17} />
      </span>
      <div>
        <p className="text-sm font-bold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400">{hint}</p>
      </div>
    </div>
    {children}
  </div>
);

// Two operational constants that used to be fixed in code, now live and
// admin-editable: the swimming pool fresh-up wait, and the membership
// "expiring soon" warning threshold.
const BookingPreferencesCard = ({ settings, onSaved }) => {
  const [freshUp, setFreshUp] = useState(String(settings.poolFreshUpMinutes));
  const [expiring, setExpiring] = useState(String(settings.membershipExpiringDays));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const dirty =
    Number(freshUp) !== settings.poolFreshUpMinutes || Number(expiring) !== settings.membershipExpiringDays;

  const save = async (e) => {
    e.preventDefault();
    setMsg(null);
    const freshUpN = Number(freshUp);
    const expiringN = Number(expiring);
    if (!Number.isFinite(freshUpN) || freshUpN < 0 || freshUpN > 60) {
      setMsg({ type: "err", text: "Fresh-up time must be 0-60 minutes." });
      return;
    }
    if (!Number.isInteger(expiringN) || expiringN < 1 || expiringN > 30) {
      setMsg({ type: "err", text: "Expiring threshold must be 1-30 days." });
      return;
    }
    setSaving(true);
    try {
      const { data } = await axiosInstance.put("/settings", {
        poolFreshUpMinutes: freshUpN,
        membershipExpiringDays: expiringN,
      });
      onSaved(data.settings);
      setMsg({ type: "ok", text: "Booking preferences saved." });
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <SlidersHorizontal size={18} />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-800">Booking Preferences</h2>
          <p className="text-xs text-slate-400">Live settings used across the app - no code changes needed.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <Row
          Icon={Timer}
          color="text-blue-600"
          bg="bg-blue-50"
          title="Swimming pool fresh-up time"
          hint="Minutes between a new booking and its timer starting"
        >
          <div className="flex items-center gap-2">
            <input className={inputClass} value={freshUp} inputMode="numeric" maxLength={2} onChange={(e) => setFreshUp(digits(e.target.value))} />
            <span className="text-xs font-semibold text-slate-400">min</span>
          </div>
        </Row>

        <Row
          Icon={BellRing}
          color="text-amber-600"
          bg="bg-amber-50"
          title="Membership expiring warning"
          hint={'Days before expiry a membership is flagged as "Expiring soon"'}
        >
          <div className="flex items-center gap-2">
            <input className={inputClass} value={expiring} inputMode="numeric" maxLength={2} onChange={(e) => setExpiring(digits(e.target.value))} />
            <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
        </Row>
      </div>

      {msg && (
        <p
          role="status"
          className={`mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${
            msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}
        >
          {msg.type === "ok" && <CheckCircle2 size={14} />}
          {msg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !dirty}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 sm:w-auto"
      >
        {saving && <Loader2 size={15} className="animate-spin" />}
        Save Preferences
      </button>
    </form>
  );
};

export default BookingPreferencesCard;
