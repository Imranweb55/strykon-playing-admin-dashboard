import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  CalendarCheck2,
  RefreshCw,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import AdmitMemberModal from "../../components/members/AdmitMemberModal";
import PhotoCapture from "../../components/members/PhotoCapture";
import { rupees } from "../../utils/pricingUtils";
import { shiftDateKey } from "../../utils/turfRules";
import {
  CATEGORIES,
  STATUS,
  daysText,
  fmtDate,
  fmtTime,
  getInitials,
  todayKey,
  durationText,
} from "../../utils/memberUtils";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const digits = (v) => v.replace(/\D/g, "");
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ---- attendance calendar (present days are highlighted) ----------------------
const AttendanceCalendar = ({ dates }) => {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const present = new Set(dates);
  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const dim = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  const key = (d) =>
    `${view.y}-${String(view.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const monthCount = dates.filter((d) =>
    d.startsWith(`${view.y}-${String(view.m + 1).padStart(2, "0")}`)
  ).length;
  const shift = (delta) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-slate-800">
          {first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}{" "}
          <span className="font-medium text-emerald-600">· {monthCount} days present</span>
        </span>
        <button type="button" onClick={() => shift(1)} aria-label="Next month" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK.map((w) => (
          <span key={w} className="py-1 text-[10px] font-semibold text-slate-400">{w}</span>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <span key={`e${i}`} />
          ) : (
            <span
              key={d}
              className={`flex h-9 items-center justify-center rounded-lg text-sm font-semibold ${
                present.has(key(d))
                  ? "bg-emerald-500 text-white"
                  : key(d) === todayKey()
                    ? "border border-blue-300 text-blue-700"
                    : "text-slate-500"
              }`}
            >
              {d}
            </span>
          )
        )}
      </div>
    </div>
  );
};

// ---- collect balance form -------------------------------------------------------
const PayForm = ({ memberId, sub, onDone, onCancel }) => {
  const [amount, setAmount] = useState(String(sub.balance));
  const [mode, setMode] = useState("cash");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await axiosInstance.post(`/members/${memberId}/subscriptions/${sub._id}/payments`, {
        amount: Number(amount),
        mode,
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save payment.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 flex flex-wrap items-end gap-2 rounded-xl bg-amber-50/60 p-3">
      <label className="flex w-32 flex-col gap-1">
        <span className="text-[11px] font-semibold text-slate-500">Received (₹)</span>
        <input className={inputClass} inputMode="numeric" value={amount} onChange={(e) => setAmount(digits(e.target.value))} />
      </label>
      <div className="flex overflow-hidden rounded-lg border border-gray-200">
        {["cash", "online"].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setMode(v)}
            aria-pressed={mode === v}
            className={`px-3.5 py-2.5 text-sm font-semibold capitalize ${mode === v ? "bg-blue-600 text-white" : "bg-white text-slate-500"}`}
          >
            {v}
          </button>
        ))}
      </div>
      <button type="submit" disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
        {busy && <Loader2 size={14} className="animate-spin" />}
        Save payment
      </button>
      <button type="button" onClick={onCancel} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-white">
        Cancel
      </button>
      {error && <p role="alert" className="w-full text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
};

// ---- edit profile modal ---------------------------------------------------------
const EditProfileModal = ({ member, onClose, onDone }) => {
  const [form, setForm] = useState({
    name: member.name,
    age: String(member.age),
    mobile: member.mobile,
    notes: member.notes || "",
  });
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await axiosInstance.put(`/members/${member._id}`, { ...form, age: Number(form.age), ...(photo || {}) });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:items-center" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Edit member</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <PhotoCapture value={photo || (member.photo ? { photo: member.photo } : null)} onChange={setPhoto} />
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
          <input className={inputClass} value={form.age} inputMode="numeric" maxLength={3} onChange={(e) => setForm({ ...form, age: digits(e.target.value) })} placeholder="Age" />
          <input className={inputClass} type="tel" value={form.mobile} maxLength={15} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/[^\d+\-\s]/g, "") })} placeholder="Mobile" />
          <input className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" />
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">Save</button>
        </div>
      </form>
    </div>
  );
};

// ---- page -----------------------------------------------------------------------
const MemberDetail = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [renewOpen, setRenewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [checkMsg, setCheckMsg] = useState(null);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/members/${id}`, {
        params: { today: todayKey() },
      });
      setMember(data.member);
      setAttendance(data.attendance);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load member.");
    }
  }, [id]);

  useEffect(() => {
    const first = setTimeout(() => {
      load();
      axiosInstance
        .get("/members/plans")
        .then(({ data }) => setPlans(data.plans))
        .catch(() => {});
    }, 0);
    return () => clearTimeout(first);
  }, [load]);

  const openSession = attendance.find((a) => a.date === todayKey() && !a.outAt);

  const checkIn = async () => {
    setChecking(true);
    setCheckMsg(null);
    try {
      if (openSession) {
        const { data } = await axiosInstance.post("/members/check-out", {
          sessionId: openSession.id,
        });
        setCheckMsg({ ok: true, text: `Checked out at ${fmtTime(data.outAt)}` });
      } else {
        const { data } = await axiosInstance.post("/members/check-in", {
          code: member.memberId,
          date: todayKey(),
        });
        setCheckMsg(
          data.ok
            ? { ok: true, text: `Checked in at ${fmtTime(data.at)}` }
            : { ok: false, text: "Membership is not active - renew to continue." }
        );
      }
      load();
    } catch (err) {
      setCheckMsg({ ok: false, text: err.response?.data?.message || "Could not check in." });
    } finally {
      setChecking(false);
    }
  };

  if (error)
    return (
      <div className="py-5">
        <Link to="/dashboard/members" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
          <ArrowLeft size={16} /> Back to members
        </Link>
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      </div>
    );
  if (!member) return <p className="py-10 text-center text-sm text-slate-400">Loading member...</p>;

  const st = STATUS[member.status];
  const visitDays = [...new Set(attendance.map((a) => a.date))];
  const daySessions = visitDays.map((d) => ({
    date: d,
    sessions: attendance.filter((a) => a.date === d),
  }));
  const latestEnd = member.subscriptions.map((s) => s.endDate).sort().pop();
  const renewStart =
    latestEnd && latestEnd >= todayKey() ? shiftDateKey(latestEnd, 1) : todayKey();

  return (
    <div className="flex flex-col gap-5 py-5">
      <Link to="/dashboard/members" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
        <ArrowLeft size={16} /> Back to members
      </Link>

      {/* Profile */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            {member.photo ? (
              <img src={member.photo} alt={member.name} className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-sm" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-extrabold text-blue-700">
                {getInitials(member.name)}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold text-slate-800 sm:text-2xl">{member.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700">{member.memberId}</span>
                <span className="flex items-center gap-1"><Phone size={13} /> {member.mobile}</span>
                <span>Age {member.age}</span>
                <span>Joined {fmtDate(member.createdAt.slice(0, 10))}</span>
              </p>
              {member.notes && <p className="mt-1 text-xs text-slate-400">{member.notes}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
            <button type="button" onClick={() => setEditOpen(true)} aria-label="Edit member" className="rounded-lg border border-gray-200 p-2.5 text-slate-500 hover:bg-slate-50">
              <Pencil size={15} />
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={checkIn}
            disabled={checking}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${openSession ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {checking ? <Loader2 size={15} className="animate-spin" /> : <CalendarCheck2 size={16} />}
            {openSession ? `Check out (in since ${fmtTime(openSession.at)})` : "Check in now"}
          </button>
          <button
            type="button"
            onClick={() => setRenewOpen(true)}
            disabled={plans.length === 0}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <RefreshCw size={15} />
            Renew / Add plan
          </button>
        </div>

        {checkMsg && (
          <p
            role="status"
            className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${checkMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
          >
            {checkMsg.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {checkMsg.text}
          </p>
        )}

        {(member.status === "expired" || member.status === "expiring") && (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
            <AlertTriangle size={16} />
            {member.status === "expired"
              ? `Membership ended on ${fmtDate(member.endDate)}. Renew to allow entry again.`
              : `Membership ends on ${fmtDate(member.endDate)} - ask for renewal.`}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Valid till", v: fmtDate(member.endDate) },
            { l: "Days left", v: member.status === "expired" ? "0" : member.daysLeft },
            { l: "Balance due", v: rupees(member.balance), warn: member.balance > 0 },
            { l: "Days / visits", v: `${visitDays.length} / ${attendance.length}` },
          ].map((t) => (
            <div key={t.l} className="rounded-xl border border-gray-100 p-3.5">
              <p className="text-xs text-slate-400">{t.l}</p>
              <p className={`text-lg font-extrabold ${t.warn ? "text-amber-600" : "text-slate-800"}`}>{t.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* Subscriptions */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-800">Subscriptions</h2>
          <div className="mt-4 flex flex-col gap-4">
            {member.subscriptions.map((s) => {
              const cat = CATEGORIES[s.category];
              const used = Math.min(100, Math.max(0, Math.round(((s.totalDays - s.daysLeft) / s.totalDays) * 100)));
              const sst = STATUS[s.status];
              return (
                <div key={s._id} className="rounded-2xl border border-gray-100 p-4" style={{ borderLeft: `4px solid ${cat?.color || "#94A3B8"}` }}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{s.planName}</p>
                      <p className="text-xs text-slate-400">{cat?.label}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${sst.cls}`}>{sst.label}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {fmtDate(s.startDate)} → {fmtDate(s.endDate)} · <b className="text-slate-700">{daysText(s)}</b>
                  </p>
                  {s.sessionLimit > 0 && (
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="rounded-md bg-cyan-50 px-2 py-0.5 font-semibold text-cyan-700">
                        {s.daysUsed} / {s.sessionLimit} days attended
                      </span>
                      {s.batchTime && <span className="text-slate-500">Slot: {s.batchTime}</span>}
                      {s.exhausted && <span className="font-semibold text-red-500">All {s.sessionLimit} days used</span>}
                    </p>
                  )}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${s.status === "expired" ? 100 : used}%`, backgroundColor: cat?.color }} />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-slate-50 py-2"><p className="text-slate-400">Price</p><p className="font-bold text-slate-800">{rupees(s.price)}</p></div>
                    <div className="rounded-lg bg-emerald-50 py-2"><p className="text-emerald-600">Paid</p><p className="font-bold text-emerald-700">{rupees(s.amountPaid)}</p></div>
                    <div className={`rounded-lg py-2 ${s.balance ? "bg-amber-50" : "bg-slate-50"}`}><p className={s.balance ? "text-amber-600" : "text-slate-400"}>Balance</p><p className={`font-bold ${s.balance ? "text-amber-700" : "text-slate-800"}`}>{rupees(s.balance)}</p></div>
                  </div>

                  {s.payments.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1 text-xs text-slate-500">
                      {s.payments.map((p) => (
                        <li key={p._id} className="flex justify-between">
                          <span>{fmtDate(new Date(p.at).toISOString().slice(0, 10))} · <span className="capitalize">{p.mode}</span></span>
                          <span className="font-semibold text-slate-700">{rupees(p.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {s.balance > 0 &&
                    (payingId === s._id ? (
                      <PayForm memberId={member._id} sub={s} onCancel={() => setPayingId(null)} onDone={() => { setPayingId(null); load(); }} />
                    ) : (
                      <button type="button" onClick={() => setPayingId(s._id)} className="mt-3 rounded-lg border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                        Collect balance
                      </button>
                    ))}
                </div>
              );
            })}
          </div>
        </section>

        {/* Attendance */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Attendance</h2>
          <AttendanceCalendar dates={visitDays} />
          <h3 className="mb-2 mt-5 text-sm font-bold text-slate-700">Check-in / check-out history</h3>
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
            {attendance.length === 0 && <p className="text-sm text-slate-400">No visits recorded yet.</p>}
            {daySessions.slice(0, 40).map((d) => (
              <div key={d.date} className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-700">
                  {fmtDate(d.date)}{" "}
                  <span className="font-medium text-slate-400">· {d.sessions.length} {d.sessions.length === 1 ? "visit" : "visits"}</span>
                </p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {d.sessions.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-x-3 text-xs text-slate-600">
                      <span>
                        In <b>{fmtTime(a.at)}</b> → Out{" "}
                        <b className={a.outAt ? "" : "text-orange-500"}>{a.outAt ? fmtTime(a.outAt) : "not yet"}</b>
                      </span>
                      <span className="text-slate-400">
                        {a.outAt ? durationText(a.at, a.outAt) : "inside"}
                        {a.source === "pool" ? " · pool" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      {renewOpen && (
        <AdmitMemberModal
          plans={plans}
          member={member}
          defaultStart={renewStart}
          onClose={() => setRenewOpen(false)}
          onDone={() => { setRenewOpen(false); load(); }}
        />
      )}
      {editOpen && <EditProfileModal member={member} onClose={() => setEditOpen(false)} onDone={() => { setEditOpen(false); load(); }} />}
    </div>
  );
};

export default MemberDetail;
