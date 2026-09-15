// Mock data for the Facilities (Swimming Pool) page.
// Swap these for real API calls later - components only care about the shape.

export const facilityStats = [
  {
    id: "head-count",
    icon: "Users",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    titleLines: ["Swimming Pool", "Head Count"],
    titleColor: "text-slate-800",
    value: "12",
    note: "20 (Capacity)",
    noteColor: "text-blue-600",
  },
  {
    id: "todays-bookings",
    icon: "CalendarCheck2",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    titleLines: ["Today's Bookings"],
    titleColor: "text-slate-800",
    value: "10",
    note: "↑ 2 vs yesterday",
    noteColor: "text-emerald-600",
  },
  {
    id: "total-revenue",
    icon: "IndianRupee",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    titleLines: ["Total Revenue (Today)"],
    titleColor: "text-violet-600",
    value: "₹8,500",
    note: "↑ 12% vs yesterday",
    noteColor: "text-emerald-600",
  },
  {
    id: "gpay-collection",
    icon: "Wallet",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    titleLines: ["GPay Collection (Today)"],
    titleColor: "text-amber-600",
    value: "₹5,500",
    note: "65% of total revenue",
    noteColor: "text-slate-400",
  },
];

export const facilitySportTabs = [
  { id: "swimming-pool", label: "Swimming Pool", icon: "Waves", color: "#2563EB" },
  { id: "basketball", label: "Basketball", icon: "Dribbble", color: "#F97316" },
  { id: "pickleball", label: "Pickleball", icon: "CircleDot", color: "#16A34A" },
  { id: "cricket", label: "Cricket", icon: "Zap", color: "#DC2626" },
];

export const poolBookings = [
  {
    id: 1,
    name: "Rahul Sharma",
    status: "urgent",
    statusLabel: "10 min left",
    time: "05:00 PM - 06:00 PM",
    duration: "1 hr",
    headCount: 4,
    amount: 700,
    paymentMethod: "GPay",
    paymentStatus: "Paid",
  },
  {
    id: 2,
    name: "Sneha Reddy",
    status: "live",
    statusLabel: "Live",
    time: "06:00 PM - 07:00 PM",
    duration: "1 hr",
    headCount: 3,
    amount: 600,
    paymentMethod: "GPay",
    paymentStatus: "Paid",
  },
  {
    id: 3,
    name: "Aarav Patel",
    status: "live",
    statusLabel: "Live",
    time: "07:00 PM - 08:00 PM",
    duration: "1 hr",
    headCount: 5,
    amount: 850,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
  },
  {
    id: 4,
    name: "Vikram Joshi",
    status: "live",
    statusLabel: "Live",
    time: "08:00 PM - 09:00 PM",
    duration: "1 hr",
    headCount: 2,
    amount: 500,
    paymentMethod: "Cash",
    paymentStatus: "Received",
  },
  {
    id: 5,
    name: "Pooja Mehta",
    status: "ending-soon",
    statusLabel: "30 min left",
    time: "09:00 PM - 10:00 PM",
    duration: "1 hr",
    headCount: 4,
    amount: 700,
    paymentMethod: "GPay",
    paymentStatus: "Paid",
  },
  {
    id: 6,
    name: "Karan Desai",
    status: "live",
    statusLabel: "Live",
    time: "10:00 PM - 11:00 PM",
    duration: "1 hr",
    headCount: 3,
    amount: 600,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
  },
];

export const poolSummary = {
  totalBookings: 45,
  totalRevenue: 30500,
};

export const paymentBreakdown = [
  { id: "gpay", name: "GPay", icon: "CreditCard", color: "text-blue-600", bg: "bg-blue-50", amount: 18000, percent: 59 },
  { id: "upi", name: "UPI", icon: "Smartphone", color: "text-violet-600", bg: "bg-violet-50", amount: 9500, percent: 31 },
  { id: "cash", name: "Cash", icon: "Banknote", color: "text-emerald-600", bg: "bg-emerald-50", amount: 3000, percent: 10 },
];

export const facilityRecentActivity = [
  { id: 1, icon: "UserPlus", color: "bg-blue-500", title: "New booking registered", subtitle: "Rahul Sharma - 05:00 PM", time: "10:24 AM" },
  { id: 2, icon: "IndianRupee", color: "bg-blue-500", title: "Payment received", subtitle: "₹700 - GPay", time: "10:18 AM" },
  { id: 3, icon: "CheckCircle2", color: "bg-emerald-500", title: "Booking completed", subtitle: "Vikram Joshi - 08:00 PM", time: "09:32 AM" },
  { id: 4, icon: "UserPlus", color: "bg-blue-500", title: "New member registered", subtitle: "Sneha Reddy", time: "08:45 AM" },
];