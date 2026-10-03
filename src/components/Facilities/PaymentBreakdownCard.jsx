import { LayoutGrid, Smartphone, Banknote, Gift, BadgeCheck } from "lucide-react";

const rows = [
  { id: "online", name: "Online", Icon: Smartphone, color: "text-violet-600", bg: "bg-violet-50" },
  { id: "cash", name: "Cash", Icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "free", name: "Free (Familiar)", Icon: Gift, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "membership", name: "Membership visits", Icon: BadgeCheck, color: "text-blue-600", bg: "bg-blue-50" },
];

// breakdown = { online: { amount, count }, cash: {...}, free: {...} }
const PaymentBreakdownCard = ({ breakdown }) => {
  const totalAmount = breakdown.online.amount + breakdown.cash.amount;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <LayoutGrid size={18} className="text-slate-600" />
        <h3 className="text-base font-bold text-slate-800">
          Payment Breakdown
        </h3>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {rows.map(({ id, name, Icon, color, bg }) => {
          const item = breakdown[id] || { amount: 0, count: 0 };
          const percent =
            totalAmount > 0 && id !== "free" && id !== "membership"
              ? Math.round((item.amount / totalAmount) * 100)
              : 0;
          return (
            <div key={id} className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${color}`}
                >
                  <Icon size={16} />
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {name}
                </span>
              </span>
              <span className="text-sm font-bold text-slate-800">
                {id === "free" || id === "membership" ? (
                  <span className="font-medium text-slate-500">
                    {item.count} {item.count === 1 ? "booking" : "bookings"}
                  </span>
                ) : (
                  <>
                    ₹{item.amount.toLocaleString("en-IN")}{" "}
                    <span className="font-medium text-slate-400">
                      ({percent}%)
                    </span>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentBreakdownCard;
