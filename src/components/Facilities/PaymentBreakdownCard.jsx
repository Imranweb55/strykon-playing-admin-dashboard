import { LayoutGrid, CreditCard, Smartphone, Banknote } from "lucide-react";
import { paymentBreakdown } from "../../data/facilitiesData";

const iconMap = { CreditCard, Smartphone, Banknote };

const PaymentBreakdownCard = () => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <LayoutGrid size={18} className="text-slate-600" />
        <h3 className="text-base font-bold text-slate-800">
          Payment Breakdown
        </h3>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {paymentBreakdown.map((item) => {
          const Icon = iconMap[item.icon] || CreditCard;
          return (
            <div key={item.id} className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
                >
                  <Icon size={16} />
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {item.name}
                </span>
              </span>
              <span className="text-sm font-bold text-slate-800">
                ₹{item.amount.toLocaleString("en-IN")}{" "}
                <span className="font-medium text-slate-400">
                  ({item.percent}%)
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentBreakdownCard;
