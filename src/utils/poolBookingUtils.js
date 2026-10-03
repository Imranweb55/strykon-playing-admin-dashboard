// Shared helpers for the swimming pool booking UI.
// Only uses ISO date strings + Date math (no locale-dependent parsing),
// so behaviour is identical in Chrome, Safari, Edge and Firefox.

export const FRESH_UP_MS = 5 * 60 * 1000;
export const HINT_WINDOW_MS = 10 * 60 * 1000;
export const POOL_CAPACITY = 20;

export const ENTRY_SOURCES = [
  { value: "district", label: "District App" },
  { value: "turftown", label: "Turf Town" },
  { value: "onspot", label: "On-spot" },
];

export const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
  { value: "free", label: "Free (Familiar)" },
  { value: "membership", label: "Membership" },
];

export const sourceLabel = (value) =>
  ENTRY_SOURCES.find((s) => s.value === value)?.label || value;

// phase: "waiting" (fresh-up 5 min) -> "live" -> "ending" (last 10 min) -> "finished"
export const getPhase = (booking, now) => {
  if (booking.status === "cancelled") return "cancelled";
  // membership visit: inside until the admin finishes it (check-out)
  if (booking.paymentMode === "membership")
    return booking.checkOutAt ? "finished" : "live";
  const start = new Date(booking.startsAt).getTime();
  const end = new Date(booking.endsAt).getTime();
  if (now < start) return "waiting";
  if (now >= end) return "finished";
  if (end - now <= HINT_WINDOW_MS) return "ending";
  return "live";
};

export const formatClock = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

export const formatTime = (value) =>
  new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export const formatHours = (hours) => `${hours} ${hours === 1 ? "hr" : "hrs"}`;

// Local-day range sent to the API so "today" follows the admin's timezone.
export const getTodayRange = () => {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from.getTime());
  to.setDate(to.getDate() + 1);
  return { from: from.toISOString(), to: to.toISOString() };
};

// Same as getTodayRange, but for any picked "YYYY-MM-DD" (local calendar day).
export const getDateRange = (dateKey) => {
  const [y, m, d] = dateKey.split("-").map(Number);
  const from = new Date(y, m - 1, d, 0, 0, 0, 0);
  const to = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  return { from: from.toISOString(), to: to.toISOString() };
};

export const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
