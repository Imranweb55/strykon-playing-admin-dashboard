// Static UI config for the Dashboard (colours, labels, quick-action buttons).
// All numbers, bookings and activity come from the API: GET /api/dashboard.

export const sportMeta = {
  swimming: { name: "Swimming", subtitle: "Pool", color: "#2563EB" },
  basketball: { name: "Basketball", subtitle: "Court", color: "#F97316" },
  pickleball: { name: "Pickleball", subtitle: "Court", color: "#16A34A" },
  cricket: { name: "Cricket", subtitle: "Ground", color: "#DC2626" },
};

export const sportOrder = ["swimming", "basketball", "pickleball", "cricket"];

export const quickActions = [
  {
    id: "add-member",
    label: "Add Member",
    color: "bg-blue-500",
    icon: "UserPlus",
  },
  {
    id: "new-booking",
    label: "New Booking",
    color: "bg-emerald-500",
    icon: "CalendarPlus",
  },
  {
    id: "view-reports",
    label: "View Reports",
    color: "bg-violet-500",
    icon: "BarChart3",
  },
  {
    id: "manage-coaches",
    label: "Manage Coaches",
    color: "bg-amber-500",
    icon: "Users",
  },
];
