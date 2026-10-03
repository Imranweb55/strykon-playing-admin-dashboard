import { useEffect, useState } from "react";
import { X, Plus, Trash2, Check, Loader2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { CATEGORIES } from "../../utils/memberUtils";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const digits = (v) => v.replace(/\D/g, "");

const emptyDraft = {
  category: "swimming",
  name: "",
  months: "1",
  originalPrice: "",
  offerPrice: "",
  note: "",
  sessionLimit: "",
};

// Edit prices of the existing plans or add a new plan.
const PlanEditorModal = ({ plans, onClose, onChanged }) => {
  const [rows, setRows] = useState(() =>
    Object.fromEntries(
      plans.map((p) => [
        p._id,
        {
          originalPrice: String(p.originalPrice),
          offerPrice: String(p.offerPrice),
          sessionLimit: String(p.sessionLimit || 0),
          active: p.active,
        },
      ])
    )
  );
  const [draft, setDraft] = useState(emptyDraft);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const save = async (plan) => {
    const r = rows[plan._id];
    setBusy(plan._id);
    setError("");
    try {
      await axiosInstance.put(`/members/plans/${plan._id}`, {
        category: plan.category,
        name: plan.name,
        months: plan.months,
        note: plan.note,
        originalPrice: Number(r.originalPrice),
        offerPrice: Number(r.offerPrice),
        sessionLimit: Number(r.sessionLimit) || 0,
        active: r.active,
      });
      onChanged();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save plan.");
    } finally {
      setBusy("");
    }
  };

  const remove = async (plan) => {
    if (!window.confirm(`Delete plan "${plan.name}"? Existing members keep it.`))
      return;
    setBusy(plan._id);
    try {
      await axiosInstance.delete(`/members/plans/${plan._id}`);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete plan.");
    } finally {
      setBusy("");
    }
  };

  const add = async (e) => {
    e.preventDefault();
    setBusy("new");
    setError("");
    try {
      await axiosInstance.post("/members/plans", {
        ...draft,
        months: Number(draft.months),
        originalPrice: Number(draft.originalPrice),
        offerPrice: Number(draft.offerPrice),
        sessionLimit: Number(draft.sessionLimit) || 0,
      });
      setDraft(emptyDraft);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add plan.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Manage plans"
    >
      <div className="flex max-h-[90vh] max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-800">Manage Plans</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain p-5 sm:p-6">

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-3">
          {plans.map((p) => {
            const r = rows[p._id] || {};
            return (
              <div key={p._id} className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 p-3">
                <div className="min-w-[180px] flex-1">
                  <p className="text-sm font-bold text-slate-800">{p.name}</p>
                  <p className="text-xs" style={{ color: CATEGORIES[p.category]?.color }}>
                    {CATEGORIES[p.category]?.label} · {p.months} {p.months === 1 ? "month" : "months"}
                  </p>
                </div>
                <label className="flex w-28 flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-500">Original ₹</span>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={r.originalPrice ?? ""}
                    onChange={(e) =>
                      setRows((s) => ({ ...s, [p._id]: { ...s[p._id], originalPrice: digits(e.target.value) } }))
                    }
                  />
                </label>
                <label className="flex w-28 flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-500">Offer ₹</span>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={r.offerPrice ?? ""}
                    onChange={(e) =>
                      setRows((s) => ({ ...s, [p._id]: { ...s[p._id], offerPrice: digits(e.target.value) } }))
                    }
                  />
                </label>
                {p.category === "skating" && (
                  <label className="flex w-32 flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-500">Days / month</span>
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      placeholder="0 = every day"
                      value={r.sessionLimit ?? ""}
                      onChange={(e) =>
                        setRows((s) => ({ ...s, [p._id]: { ...s[p._id], sessionLimit: digits(e.target.value) } }))
                      }
                    />
                  </label>
                )}
                <label className="flex items-center gap-1.5 pb-2 text-xs font-semibold text-slate-500">
                  <input
                    type="checkbox"
                    checked={r.active ?? true}
                    onChange={(e) =>
                      setRows((s) => ({ ...s, [p._id]: { ...s[p._id], active: e.target.checked } }))
                    }
                  />
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => save(p)}
                  disabled={busy === p._id}
                  aria-label={`Save ${p.name}`}
                  className="rounded-lg bg-emerald-500 p-2.5 text-white hover:bg-emerald-600 disabled:opacity-50"
                >
                  <Check size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(p)}
                  disabled={busy === p._id}
                  aria-label={`Delete ${p.name}`}
                  className="rounded-lg border border-red-200 p-2.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>

        <form onSubmit={add} className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="mb-3 text-sm font-bold text-slate-700">Add a new plan</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              className={inputClass}
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            >
              {Object.entries(CATEGORIES).map(([k, c]) => (
                <option key={k} value={k}>{c.label}</option>
              ))}
            </select>
            <input
              className={inputClass}
              placeholder="Plan name (e.g. 2 Months)"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder="Duration in months"
              inputMode="numeric"
              value={draft.months}
              onChange={(e) => setDraft((d) => ({ ...d, months: digits(e.target.value) }))}
            />
            <input
              className={inputClass}
              placeholder="Original price ₹"
              inputMode="numeric"
              value={draft.originalPrice}
              onChange={(e) => setDraft((d) => ({ ...d, originalPrice: digits(e.target.value) }))}
            />
            <input
              className={inputClass}
              placeholder="Offer price ₹"
              inputMode="numeric"
              value={draft.offerPrice}
              onChange={(e) => setDraft((d) => ({ ...d, offerPrice: digits(e.target.value) }))}
            />
            <input
              className={inputClass}
              placeholder="Note (optional)"
              value={draft.note}
              onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
            />
            {draft.category === "skating" && (
              <input
                className={inputClass}
                placeholder="Days per month (0 = every day)"
                inputMode="numeric"
                value={draft.sessionLimit}
                onChange={(e) => setDraft((d) => ({ ...d, sessionLimit: digits(e.target.value) }))}
              />
            )}
          </div>
          <button
            type="submit"
            disabled={busy === "new"}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy === "new" ? <Loader2 size={15} className="animate-spin" /> : <Plus size={16} />}
            Add plan
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default PlanEditorModal;
