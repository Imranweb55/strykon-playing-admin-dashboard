// Frontend copy of Backend/config/turfRules.js (the server always re-checks).
// Turf capacity = 6 units: pickleball court 2, half basketball 3,
// full basketball 6, cricket 6. A 30-min slot is free for an option while
// (units already booked + option units) <= 6.

export const CAPACITY = 6;
export const SLOT_MINUTES = 30;
export const OPEN_MIN = 0; // open 24/7
export const CLOSE_MIN = 24 * 60;

export const SPORTS = {
  pickleball: {
    id: "pickleball",
    name: "Pickleball",
    options: [
      { id: "pickle-1", label: "1 Court", weight: 2 },
      { id: "pickle-2", label: "2 Courts", weight: 4 },
      { id: "pickle-3", label: "3 Courts", weight: 6 },
    ],
  },
  basketball: {
    id: "basketball",
    name: "Basketball",
    options: [
      { id: "half-1", label: "1 Half Court", weight: 3 },
      { id: "half-2", label: "2 Half Courts", weight: 6 },
      { id: "full", label: "Full Court", weight: 6 },
    ],
  },
  cricket: {
    id: "cricket",
    name: "Cricket",
    options: [{ id: "cricket-full", label: "Full Turf", weight: 6 }],
  },
};

export const ENTRY_SOURCES = [
  { value: "district", label: "District App" },
  { value: "turftown", label: "Turf Town" },
  { value: "onspot", label: "On-spot" },
];

export const sourceLabel = (value) =>
  ENTRY_SOURCES.find((s) => s.value === value)?.label || value;

export const formatMinutes = (min) => {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
};

export const formatHours = (h) => `${h} ${h === 1 ? "hr" : "hrs"}`;

// All slot start times of a day: 360, 390, ... 1410
export const ALL_SLOTS = (() => {
  const out = [];
  for (let t = OPEN_MIN; t < CLOSE_MIN; t += SLOT_MINUTES) out.push(t);
  return out;
})();

// Local calendar date -> "YYYY-MM-DD" (never uses toISOString, which is UTC)
export const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const shiftDateKey = (key, days) => {
  const [y, m, d] = key.split("-").map(Number);
  return toDateKey(new Date(y, m - 1, d + days));
};

export const formatDateKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const minutesNow = (nowMs) => {
  const d = new Date(nowMs);
  return d.getHours() * 60 + d.getMinutes();
};

// bookings must be the ACTIVE bookings of a single date.
export const getUsage = (bookings) => {
  const usage = {};
  bookings.forEach((b) => {
    for (let t = b.startMin; t < b.endMin; t += SLOT_MINUTES) {
      usage[t] = (usage[t] || 0) + b.weight;
    }
  });
  return usage;
};

export const getBlockers = (bookings, slot) =>
  bookings.filter((b) => b.startMin <= slot && slot < b.endMin);

export const describeBooking = (b) =>
  `${SPORTS[b.sport]?.name || b.sport} - ${b.optionLabel}`;

// null when the range fits, otherwise a readable conflict message
export const findConflict = (bookings, weight, startMin, endMin) => {
  const usage = getUsage(bookings);
  for (let t = startMin; t < endMin; t += SLOT_MINUTES) {
    if ((usage[t] || 0) + weight > CAPACITY) {
      const names = [...new Set(getBlockers(bookings, t).map(describeBooking))];
      return `${formatMinutes(t)} - ${formatMinutes(t + SLOT_MINUTES)} is already booked for ${names.join(", ")}. Please choose another time.`;
    }
  }
  return null;
};

// ---- Admin turf closures (e.g. daily 4-6 PM skating coaching) --------------
// `closures` = the closures effective on the date being viewed, each
// { startMin, endMin, reason }.
export const closureAt = (closures, slot) =>
  closures.find((c) => c.startMin <= slot && slot < c.endMin) || null;

// null when [startMin, endMin) is free of closures, otherwise a readable message.
export const findClosureConflict = (closures, startMin, endMin) => {
  const hit = closures.find((c) => c.startMin < endMin && startMin < c.endMin);
  if (!hit) return null;
  return `${formatMinutes(hit.startMin)} - ${formatMinutes(hit.endMin)} is closed: ${hit.reason}. Please choose another time.`;
};

export const formatClosureRange = (c) => `${formatMinutes(c.startMin)} - ${formatMinutes(c.endMin)}`;

export const getPhase = (booking, nowMs, todayKey) => {
  if (booking.status === "cancelled") return "cancelled";
  if (booking.date > todayKey) return "upcoming";
  if (booking.date < todayKey) return "completed";
  const n = minutesNow(nowMs);
  if (n < booking.startMin) return "upcoming";
  if (n >= booking.endMin) return "completed";
  return "live";
};

// ---- Structure of the turf for one 30-min slot ------------------------------
// Rows in the same order as the client's turf structure. Status per row:
//   booked    - someone booked it in this slot
//   available - still free to book
//   closed    - blocked because other bookings are using the turf
export const STRUCTURE_ROWS = [
  { id: "pickle-1", group: "Pickleball", label: "Pickleball Court 1" },
  { id: "pickle-2", group: "Pickleball", label: "Pickleball Court 2" },
  { id: "pickle-3", group: "Pickleball", label: "Pickleball Court 3" },
  { id: "half-1", group: "Basketball", label: "Basketball Half Court 1" },
  { id: "half-2", group: "Basketball", label: "Basketball Half Court 2" },
  { id: "full", group: "Basketball", label: "Basketball Full Court" },
  { id: "cricket", group: "Cricket", label: "Cricket (Full Turf)" },
];

export const getSlotStructure = (activeBookings, slot) => {
  const at = activeBookings
    .filter((b) => b.startMin <= slot && slot < b.endMin)
    .sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
    );
  const used = at.reduce((s, b) => s + b.weight, 0);
  const remaining = Math.max(0, CAPACITY - used);

  const pickleOwners = [];
  const halfOwners = [];
  let fullOwner = null;
  let cricketOwner = null;
  at.forEach((b) => {
    if (b.sport === "pickleball") {
      for (let i = 0; i < b.weight / 2; i++) pickleOwners.push(b);
    } else if (b.sport === "basketball") {
      if (b.optionId === "full") fullOwner = b;
      else {
        const n = b.optionId === "half-2" ? 2 : 1;
        for (let i = 0; i < n; i++) halfOwners.push(b);
      }
    } else if (b.sport === "cricket") cricketOwner = b;
  });

  const pickleFree = Math.floor(remaining / 2);
  const halfFree = Math.min(Math.floor(remaining / 3), 2 - halfOwners.length);
  const wholeFree = remaining === CAPACITY;

  const pick = (index, owners, free) => {
    if (index < owners.length)
      return { status: "booked", booking: owners[index] };
    if (index < owners.length + free) return { status: "available" };
    return { status: "closed" };
  };

  const rows = STRUCTURE_ROWS.map((row) => {
    if (row.id.startsWith("pickle-"))
      return { ...row, ...pick(Number(row.id.slice(-1)) - 1, pickleOwners, pickleFree) };
    if (row.id.startsWith("half-"))
      return { ...row, ...pick(Number(row.id.slice(-1)) - 1, halfOwners, halfFree) };
    if (row.id === "full")
      return fullOwner
        ? { ...row, status: "booked", booking: fullOwner }
        : { ...row, status: wholeFree ? "available" : "closed" };
    return cricketOwner
      ? { ...row, status: "booked", booking: cricketOwner }
      : { ...row, status: wholeFree ? "available" : "closed" };
  });

  return { rows, used, remaining, pickleFree, halfFree, wholeFree };
};

// How many of the chosen option can still be booked in this slot
export const optionsLeft = (activeBookings, slot, weight) => {
  const used = getUsage(activeBookings)[slot] || 0;
  return Math.max(0, Math.floor((CAPACITY - used) / weight));
};

export const monthKey = (dateKey) => dateKey.slice(0, 7);
