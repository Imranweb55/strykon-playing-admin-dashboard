import { useState } from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { toDateKey } from "../../utils/turfRules";

const PERIODS = [
  { v: "daily", label: "Daily" },
  { v: "weekly", label: "Weekly" },
  { v: "monthly", label: "Monthly" },
];

// pulls the filename the server chose (Content-Disposition) instead of
// guessing one client-side - keeps it in sync if the backend ever changes it
const filenameFrom = (response, fallback) => {
  const header = response.headers?.["content-disposition"] || "";
  const match = header.match(/filename="([^"]+)"/);
  return match ? match[1] : fallback;
};

// One game's report card: period toggle, date picker, Download PDF.
// gameId = null means the overall (all games) report.
const ReportCard = ({ gameId, title, Icon, color, bg }) => {
  const [period, setPeriod] = useState("daily");
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await axiosInstance.get("/reports/pdf", {
        params: {
          period,
          date,
          game: gameId || "all",
          tz: new Date().getTimezoneOffset(),
        },
        responseType: "blob",
      });
      const blobUrl = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filenameFrom(response, `strykon-${gameId || "overall"}-${period}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      // release the object URL once the download has had time to start
      setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
    } catch (err) {
      // the blob response on error is JSON text - read it back out
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          setError(JSON.parse(text)?.message || "Could not build the report.");
        } catch {
          setError("Could not build the report.");
        }
      } else {
        setError(err.response?.data?.message || "Could not build the report.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>
          <Icon size={19} />
        </span>
        <p className="text-sm font-bold text-slate-800">{title}</p>
      </div>

      <div className="flex overflow-hidden rounded-lg border border-gray-200">
        {PERIODS.map((p) => (
          <button
            key={p.v}
            type="button"
            onClick={() => setPeriod(p.v)}
            aria-pressed={period === p.v}
            className={`flex-1 px-2 py-1.5 text-xs font-semibold transition ${
              period === p.v ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold text-slate-500">
          {period === "monthly" ? "Any date in the month" : period === "weekly" ? "Week ending" : "Date"}
        </span>
        <input
          type="date"
          value={date}
          max={toDateKey(new Date())}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
        Download PDF
      </button>

      {error && (
        <p role="alert" className="flex items-start gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default ReportCard;
