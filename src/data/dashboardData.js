// Mock data for the Dashboard page.
// Later, replace these constants with data fetched from the backend
// (e.g. inside a useEffect + axiosInstance.get("/dashboard/...")) —
// the components below only care about the shape of this data, not where it comes from.

export const sportStats = [
  {
    id: "swimming",
    name: "Swimming",
    subtitle: "Pool",
    period: "Today",
    color: "#2563EB", // blue
    bookings: 12,
    completed: 10,
    revenue: 8500,
    completionRate: 83,
  },
  {
    id: "basketball",
    name: "Basketball",
    subtitle: "Court",
    period: "Today",
    color: "#F97316", // orange
    bookings: 8,
    completed: 7,
    revenue: 6800,
    completionRate: 88,
  },
  {
    id: "pickleball",
    name: "Pickleball",
    subtitle: "Court",
    period: "Today",
    color: "#16A34A", // green
    bookings: 15,
    completed: 13,
    revenue: 7800,
    completionRate: 87,
  },
  {
    id: "cricket",
    name: "Cricket",
    subtitle: "Ground",
    period: "Today",
    color: "#DC2626", // red
    bookings: 10,
    completed: 8,
    revenue: 7200,
    completionRate: 80,
  },
];

export const revenueOverview = {
  days: ["Aug 20", "Aug 21", "Aug 22", "Aug 23", "Aug 24", "Aug 25", "Aug 26"],
  series: [
    {
      key: "swimming",
      name: "Swimming",
      color: "#2563EB",
      values: [8500, 9200, 8800, 9500, 10200, 11000, 12500],
    },
    {
      key: "basketball",
      name: "Basketball",
      color: "#F97316",
      values: [4200, 4500, 4800, 5200, 5000, 5600, 6800],
    },
    {
      key: "pickleball",
      name: "Pickleball",
      color: "#16A34A",
      values: [6800, 7000, 7200, 7500, 7800, 8200, 8600],
    },
    {
      key: "cricket",
      name: "Cricket",
      color: "#DC2626",
      values: [5200, 5500, 5800, 6000, 6300, 6800, 7200],
    },
  ],
};

export const revenueShare = {
  total: 30500,
  label: "Today",
  segments: [
    { name: "Swimming", value: 28, color: "#2563EB" },
    { name: "Basketball", value: 22, color: "#F97316" },
    { name: "Pickleball", value: 26, color: "#16A34A" },
    { name: "Cricket", value: 24, color: "#DC2626" },
  ],
};

export const todaysBookings = [
  {
    id: 1,
    game: "Swimming",
    color: "#2563EB",
    member: "Aarav Patel",
    time: "06:00 AM - 07:00 AM",
    duration: "1 hr",
    amount: 850,
    status: "Completed",
  },
  {
    id: 2,
    game: "Basketball",
    color: "#F97316",
    member: "Sneha Reddy",
    time: "05:00 PM - 06:00 PM",
    duration: "1 hr",
    amount: 700,
    status: "Completed",
  },
  {
    id: 3,
    game: "Pickleball",
    color: "#16A34A",
    member: "Rohan Verma",
    time: "06:30 PM - 07:30 PM",
    duration: "1 hr",
    amount: 600,
    status: "Completed",
  },
  {
    id: 4,
    game: "Cricket",
    color: "#DC2626",
    member: "Diya Singh",
    time: "07:00 PM - 08:00 PM",
    duration: "1 hr",
    amount: 750,
    status: "Completed",
  },
];

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

export const todaysOverallSummary = [
  {
    id: "total-bookings",
    label: "Total Bookings",
    value: 45,
    icon: "CalendarCheck2",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "completed",
    label: "Completed",
    value: 38,
    icon: "CheckCircle2",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "total-revenue",
    label: "Total Revenue",
    value: "₹30,500",
    icon: "IndianRupee",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export const recentActivity = [
  {
    id: 1,
    icon: "UserPlus",
    color: "bg-emerald-500",
    title: "New member registered",
    subtitle: "Rahul Sharma - Swimming",
    time: "10:24 AM",
  },
  {
    id: 2,
    icon: "CalendarCheck2",
    color: "bg-blue-500",
    title: "Booking confirmed",
    subtitle: "Pickle Ball - 5:00 PM",
    time: "09:56 AM",
  },
  {
    id: 3,
    icon: "Repeat2",
    color: "bg-violet-500",
    title: "Session completed",
    subtitle: "Basketball - Batch A",
    time: "08:32 AM",
  },
  {
    id: 4,
    icon: "IndianRupee",
    color: "bg-emerald-500",
    title: "Payment received",
    subtitle: "₹2,500 - Membership",
    time: "Yesterday",
  },
  {
    id: 5,
    icon: "Mail",
    color: "bg-amber-500",
    title: "New inquiry",
    subtitle: "Cricket - Weekend Batch",
    time: "Yesterday",
  },
];
