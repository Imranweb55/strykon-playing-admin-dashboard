import { useState } from "react";
import { BellRing, Mail, Loader2, CheckCircle2, Info } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

// Where cancellation emails are sent. The in-app bell always works;
// this only controls the email copy.
const NotificationEmailCard = ({ settings, onSaved }) => {
  const [email, setEmail] = useState(settings.notifyEmail || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const dirty = email.trim() !== (settings.notifyEmail || "");

  const save = async (e) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const { data } = await axiosInstance.put("/settings", { notifyEmail: email.trim() });
      onSaved(data.settings);
      setMsg({ type: "ok", text: "Notification email saved." });
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
          <BellRing size={18} />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-800">Notifications</h2>
          <p className="text-xs text-slate-400">Get an email whenever an admin cancels a booking.</p>
        </div>
      </div>

      <label className="mt-4 flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Mail size={12} /> Alert email address
        </span>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-slate-400">
        <Info size={12} className="mt-0.5 shrink-0" />
        The bell icon in the topbar shows every cancellation and pending-payment
        alert regardless of this setting. This address only controls the
        cancellation email copy.
      </p>

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
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 sm:w-auto"
      >
        {saving && <Loader2 size={15} className="animate-spin" />}
        Save Notification Email
      </button>
    </form>
  );
};

export default NotificationEmailCard;
