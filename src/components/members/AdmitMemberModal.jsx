import { useEffect, useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import DateStrip from "../turf/DateStrip";
import PhotoCapture from "./PhotoCapture";
import { rupees } from "../../utils/pricingUtils";
import {
  CATEGORIES,
  earliestStart,
  fmtDate,
  membershipEnd,
  todayKey,
} from "../../utils/memberUtils";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const digits = (v) => v.replace(/\D/g, "");

// hourly coaching slots, 5 AM - 9 PM
const fmtHour = (h) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h >= 12 ? "PM" : "AM"}`;
const BATCH_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 5;
  return `${fmtHour(h)} - ${fmtHour(h + 1)}`;
});

// Admission (member = null) or renewal / extra plan (member given).
const AdmitMemberModal = ({ plans, member, defaultStart, onClose, onDone }) => {
  const isRenew = Boolean(member);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [mobile, setMobile] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null); // { photo, thumb }
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(defaultStart || todayKey());
  const [paid, setPaid] = useState("");
  const [batchTime, setBatchTime] = useState("");
  const [mode, setMode] = useState("cash");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const plan = plans.find((p) => p._id === planId);
  const price = plan?.offerPrice || 0;
  const paidNum = Number(paid) || 0;
  const balance = Math.max(0, price - paidNum);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, saving]);

  const validate = () => {
    if (!isRenew) {
      if (!name.trim()) return "Enter the member name";
      if (!age || Number(age) < 1) return "Enter a valid age";
      if (!/^[0-9+\-\s]{10,15}$/.test(mobile.trim()))
        return "Enter a valid mobile number";
    }
    if (!plan) return "Select a plan";
    if (plan.sessionLimit > 0 && !batchTime) return "Select the coaching time slot";
    if (paidNum > price) return "Paid amount is more than the plan price";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setError("");
    setSaving(true);
    const body = {
      planId,
      startDate,
      batchTime: plan?.sessionLimit > 0 ? batchTime : "",
      payment: { amount: paidNum, mode },
    };
    try {
      if (isRenew) {
        await axiosInstance.post(`/members/${member._id}/subscriptions`, body);
        onDone(member._id);
      } else {
        const { data } = await axiosInstance.post("/members", {
          ...body,
          name: name.trim(),
          age: Number(age),
          mobile: mobile.trim(),
          notes: notes.trim(),
          ...(photo || {}),
        });
        onDone(data.member._id, data.member);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not save. Try again.");
      setSaving(false);
    }
  };

  const byCategory = Object.keys(CATEGORIES)
    .map((k) => ({ key: k, plans: plans.filter((p) => p.active && p.category === k) }))
    .filter((g) => g.plans.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isRenew ? "Renew subscription" : "Admit member"}
    >
      <form
        onSubmit={submit}
        noValidate
        className="flex max-h-[90vh] max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isRenew ? `Renew / add plan - ${member.name}` : "Admit New Member"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {isRenew
                ? "A new subscription is added. Old history stays."
                : "A member ID is created automatically."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain p-5 sm:p-6">

        {!isRenew && (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-semibold text-slate-500">Member name</span>
              <input className={inputClass} value={name} autoComplete="off" onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500">Age</span>
              <input className={inputClass} value={age} inputMode="numeric" maxLength={3} onChange={(e) => setAge(digits(e.target.value))} />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-3">
              <span className="text-xs font-semibold text-slate-500">Mobile number</span>
              <input
                className={inputClass}
                type="tel"
                value={mobile}
                maxLength={15}
                onChange={(e) => setMobile(e.target.value.replace(/[^\d+\-\s]/g, ""))}
                placeholder="10-digit mobile"
              />
            </label>
            <div className="sm:col-span-3">
              <PhotoCapture value={photo} onChange={setPhoto} />
            </div>
            <label className="flex flex-col gap-1 sm:col-span-3">
              <span className="text-xs font-semibold text-slate-500">Notes (optional)</span>
              <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Parent name, medical note..." />
            </label>
          </div>
        )}

        {/* Plan picker */}
        <div className="mt-5">
          <span className="text-xs font-semibold text-slate-500">Choose plan</span>
          <div className="mt-2 flex flex-col gap-3">
            {byCategory.map((g) => (
              <div key={g.key}>
                <p className="mb-1.5 text-[11px] font-bold tracking-wide" style={{ color: CATEGORIES[g.key].color }}>
                  {CATEGORIES[g.key].label.toUpperCase()}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {g.plans.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => setPlanId(p._id)}
                      aria-pressed={planId === p._id}
                      className={`rounded-xl border p-3 text-left transition ${
                        planId === p._id
                          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <p className="text-xs font-semibold leading-snug text-slate-700">
                        {p.name.replace(/^(Swimming|Basketball|Skating) Coaching - /, "")}
                      </p>
                      <p className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-slate-800">{rupees(p.offerPrice)}</span>
                        {p.originalPrice > p.offerPrice && (
                          <span className="text-[11px] text-slate-400 line-through">{rupees(p.originalPrice)}</span>
                        )}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start date */}
        <div className="mt-5">
          <DateStrip value={startDate} onChange={setStartDate} minDate={earliestStart()} />
          {plan && (
            <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
              {plan.name}: {fmtDate(startDate)} to {fmtDate(membershipEnd(startDate, plan.months))}
            </p>
          )}
        </div>

        {plan?.sessionLimit > 0 && (
          <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
            <p className="text-xs font-semibold text-cyan-800">
              Coaching time slot (fixed for all {plan.sessionLimit} days)
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {BATCH_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setBatchTime(s)}
                  aria-pressed={batchTime === s}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                    batchTime === s
                      ? "border-cyan-600 bg-cyan-600 text-white"
                      : "border-gray-200 bg-white text-slate-600 hover:border-cyan-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-snug text-cyan-900">
              Only {plan.sessionLimit} attendance days are allowed inside the
              month. The plan expires when {plan.sessionLimit} different days
              are attended <b>or</b> the month ends - whichever comes first.
            </p>
          </div>
        )}

        {/* Payment */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="flex items-center justify-between text-xs font-semibold text-slate-500">
              Amount paid now (₹)
              {plan && (
                <button type="button" onClick={() => setPaid(String(price))} className="text-blue-600">
                  Full {rupees(price)}
                </button>
              )}
            </span>
            <input className={inputClass} value={paid} inputMode="numeric" onChange={(e) => setPaid(digits(e.target.value))} placeholder="0" />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Paid by</span>
            <div className="flex gap-2">
              {[{ v: "cash", l: "Cash" }, { v: "online", l: "Online" }].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setMode(o.v)}
                  aria-pressed={mode === o.v}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    mode === o.v ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {plan && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">
              Plan {rupees(price)} · Paid {rupees(paidNum)}
            </span>
            <span className={`font-extrabold ${balance ? "text-amber-600" : "text-emerald-600"}`}>
              {balance ? `Balance ${rupees(balance)}` : "Fully paid"}
            </span>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 p-5 sm:p-6">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving && <Loader2 size={15} className="animate-spin" />}
            {isRenew ? "Confirm Renewal" : "Admit Member"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmitMemberModal;
