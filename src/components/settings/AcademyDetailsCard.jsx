import { useRef, useState } from "react";
import { Building2, Upload, Trash2, Loader2, CheckCircle2, FileText } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

// Downscale to a small square PNG data URL so the saved document stays tiny.
const toLogoDataUrl = (img) =>
  new Promise((resolve) => {
    const size = 200;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    resolve(canvas.toDataURL("image/png"));
  });

// Academy branding + contact details, used on the Reports PDF header.
const AcademyDetailsCard = ({ settings, onSaved }) => {
  const [form, setForm] = useState({
    academyName: settings.academyName,
    contactPhone: settings.contactPhone,
    contactEmail: settings.contactEmail,
    address: settings.address,
  });
  const [logo, setLogo] = useState(settings.logo); // "" | data URL | undefined (unchanged)
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => setLogo(await toLogoDataUrl(img));
      img.onerror = () => setMsg({ type: "err", text: "That file is not a valid image." });
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.academyName.trim()) {
      setMsg({ type: "err", text: "Academy name is required." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const body = { ...form, academyName: form.academyName.trim() };
      if (logo !== settings.logo) body.logo = logo; // only send when changed
      const { data } = await axiosInstance.put("/settings", body);
      onSaved(data.settings);
      setMsg({ type: "ok", text: "Academy details saved." });
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          <Building2 size={18} />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-800">Academy Details</h2>
          <p className="text-xs text-slate-400">Name and logo shown on the Reports PDF header.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-slate-50">
          {logo ? (
            <img src={logo} alt="Academy logo" className="h-full w-full object-contain" />
          ) : (
            <Building2 size={28} className="text-slate-300" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Upload size={14} /> {logo ? "Change logo" : "Upload logo"}
          </button>
          {logo && (
            <button
              type="button"
              onClick={() => setLogo("")}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
            >
              <Trash2 size={14} /> Remove
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500">Academy name</span>
          <input className={inputClass} value={form.academyName} onChange={(e) => set("academyName", e.target.value)} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Contact phone</span>
            <input className={inputClass} value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="Optional" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Contact email</span>
            <input type="email" className={inputClass} value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="Optional" />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500">Address</span>
          <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Optional" />
        </label>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
        <FileText size={12} /> This name and logo replace "STRYKON SPORTS ACADEMY" on every PDF from now on.
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
        disabled={saving}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50 sm:w-auto"
      >
        {saving && <Loader2 size={15} className="animate-spin" />}
        Save Academy Details
      </button>
    </form>
  );
};

export default AcademyDetailsCard;
