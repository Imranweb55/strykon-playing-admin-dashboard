import { toDateKey, shiftDateKey } from "./turfRules";

export const CATEGORIES = {
  swimming: { label: "Swimming Membership", color: "#2563EB" },
  basketball: { label: "Basketball Coaching", color: "#F97316" },
  skating: { label: "Skating Coaching", color: "#7C3AED" },
  "swimming-coaching": { label: "Swimming Coaching", color: "#0891B2" },
};

export const STATUS = {
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-600" },
  expiring: { label: "Expiring soon", cls: "bg-amber-50 text-amber-600" },
  expired: { label: "Expired", cls: "bg-red-50 text-red-600" },
  upcoming: { label: "Starts soon", cls: "bg-blue-50 text-blue-600" },
  none: { label: "No plan", cls: "bg-slate-100 text-slate-500" },
};

export const todayKey = () => toDateKey(new Date());

export const fmtDate = (key) => {
  if (!key) return "-";
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const fmtTime = (value) =>
  new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// Same rule as Backend/utils/dateKeys.js: N months from `key`, last valid day
export const membershipEnd = (key, months) => {
  const [y, m, d] = key.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1 + months, 1));
  const dim = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)
  ).getUTCDate();
  const same = Date.UTC(
    first.getUTCFullYear(),
    first.getUTCMonth(),
    Math.min(d, dim)
  );
  return new Date(same - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
};

export const earliestStart = () => shiftDateKey(todayKey(), -30);

export const daysText = (sub) => {
  if (sub.status === "expired") return "Ended";
  if (sub.status === "upcoming") return "Not started";
  if (sub.daysLeft === 1) return "Last day";
  return `${sub.daysLeft} days left`;
};

// "1h 25m" between two timestamps
export const durationText = (from, to) => {
  const mins = Math.max(0, Math.round((new Date(to) - new Date(from)) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

export const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
