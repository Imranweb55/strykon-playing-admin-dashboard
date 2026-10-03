import { useEffect, useState } from "react";
import { Lock, Unlock, Trash2, Plus, Loader2, CheckCircle2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { ALL_SLOTS, formatMinutes, toDateKey } from "../../utils/turfRules";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const digits = (v) => v.replace(/\D/g, "");

const emptyDraft = {
  startMin: String(16 * 60), // 4:00 PM - the skating slot, as a sensible default
  endMin: String(18 * 60), // 6:00 PM
  reason: "",
  startDate: "",
  permanent: true,
  days: "30",
};

const statusOf = (c, todayKey) => {
  if (!c.active) return { label: "Open (booking allowed)", cls: "bg-slate-100 text-slate-500" };
  if (c.endDate && c.endDate < todayKey) return { label: "Expired", cls: "bg-slate-100 text-slate-400" };
  if (c.startDate > todayKey) return { label: "Scheduled", cls: "bg-blue-50 text-blue-600" };
  return { label: "Closed now", cls: "bg-red-50 text-red-600" };
};

// Settings card: block a daily time range on the shared turf (Pickleball,
// Basketball, Cricket) - e.g. 4-6 PM every day for skating coaching - and
// open it again early whenever a session is cancelled.
const TurfClosuresCard = () => {
  const todayKey = toDateKey(new Date());
  const [closures, setClosures] = useState(null);
  const [draft, setDraft] = useState({ ...emptyDraft, startDate: todayKey });
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(null);

  const load = () => {
    axiosInstance
      .get("/turf-closures")
      .then(({ data }) => setClosures(data.closures))
      .catch((err) => setError(err.response?.data?.message || "Could not load closures."));
  };

  useEffect(load, []);

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const create = async (e) => {
    e.preventDefault();
    if (!draft.reason.trim()) return setError("Enter a reason for the closure");
    if (Number(draft.endMin) <= Number(draft.startMin))
      return setError("End time must be after the start time");
    if (!draft.permanent && (!draft.days || Number(draft.days) < 1))
      return setError("Enter how many days, or mark it permanent");
    setError("");
    setSaving(true);
    try {
      await axiosInstance.post("/turf-closures", {
        startMin: Number(draft.startMin),
        endMin: Number(draft.endMin),
        reason: draft.reason.trim(),
        startDate: draft.startDate,
        permanent: draft.permanent,
        days: draft.permanent ? undefined : Number(draft.days),
      });
      setDraft({ ...emptyDraft, startDate: todayKey });
      setMsg({ type: "ok", text: "Turf closure added." });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add closure.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c) => {
    setBusyId(c._id);
    try {
      await axiosInstance.patch(`/turf-closures/${c._id}/toggle`);
      load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Could not update the closure.");
    } finally {
      setBusyId("");
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete the closure "${c.reason}"? This cannot be undone.`)) return;
    setBusyId(c._id);
    try {
      await axiosInstance.delete(`/turf-closures/${c._id}`);
      load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Could not delete the closure.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
          <Lock size={18} />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-800">Turf Closures</h2>
          <p className="text-xs text-slate-400">
            Block a daily time range on the shared turf - Pickleball, Basketball
            and Cricket can't be booked during it. Used for the daily skating
            coaching slot, maintenance, etc.
          </p>
        </div>
      </div>

      {/* Add new closure */}
      <form onSubmit={create} className="mt-4 rounded-xl bg-slate-50 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">From</span>
            <select className={inputClass} value={draft.startMin} onChange={(e) => set("startMin", e.target.value)}>
              {ALL_SLOTS.map((m) => (
                <option key={m} value={m}>{formatMinutes(m)}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">To</span>
            <select className={inputClass} value={draft.endMin} onChange={(e) => set("endMin", e.target.value)}>
              {ALL_SLOTS.map((m) => (
                <option key={m} value={m + 30}>{formatMinutes(m + 30)}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-semibold text-slate-500">Reason</span>
            <input
              className={inputClass}
              value={draft.reason}
              onChange={(e) => set("reason", e.target.value)}
              placeholder="e.g. Skating coaching"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Starting from</span>
            <input
              type="date"
              className={inputClass}
              value={draft.startDate}
              min={todayKey}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">How long</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => set("permanent", true)}
                aria-pressed={draft.permanent}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  draft.permanent ? "border-red-500 bg-red-500 text-white" : "border-gray-200 bg-white text-slate-600"
                }`}
              >
                Until reopened
              </button>
              <button
                type="button"
                onClick={() => set("permanent", false)}
                aria-pressed={!draft.permanent}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  !draft.permanent ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-slate-600"
                }`}
              >
                Number of days
              </button>
            </div>
          </div>
          {!draft.permanent && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Days</span>
              <input
                className={inputClass}
                value={draft.days}
                inputMode="numeric"
                maxLength={3}
                onChange={(e) => set("days", digits(e.target.value))}
              />
            </label>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>
        )}
        {msg && (
          <p role="status" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={14} /> {msg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={16} />}
          Add closure
        </button>
      </form>

      {/* List */}
      <div className="mt-4 flex flex-col gap-2">
        {closures === null && <p className="py-4 text-center text-sm text-slate-400">Loading...</p>}
        {closures?.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">No turf closures set up yet.</p>
        )}
        {closures?.map((c) => {
          const st = statusOf(c, todayKey);
          return (
            <div
              key={c._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
                  {formatMinutes(c.startMin)} - {formatMinutes(c.endMin)}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{c.reason}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  From {c.startDate}{c.endDate ? ` to ${c.endDate}` : " - until reopened"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => toggle(c)}
                  disabled={busyId === c._id}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                    c.active
                      ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      : "border-red-200 text-red-500 hover:bg-red-50"
                  }`}
                >
                  {c.active ? <Unlock size={13} /> : <Lock size={13} />}
                  {c.active ? "Open now" : "Close again"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  disabled={busyId === c._id}
                  aria-label={`Delete closure ${c.reason}`}
                  className="rounded-lg border border-gray-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TurfClosuresCard;
