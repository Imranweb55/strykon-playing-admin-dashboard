import { Tag } from "lucide-react";

// Manual offer: admin picks ₹ or % and types the value. Used in both booking
// forms; the discount itself is calculated by the parent (calcDiscount).
const OfferField = ({ type, value, onType, onValue, disabled }) => (
  <div className="flex flex-col gap-1">
    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
      <Tag size={12} className="text-amber-500" />
      Offer / discount (optional)
    </span>
    <div className="flex gap-2">
      <div className="flex shrink-0 overflow-hidden rounded-lg border border-gray-200">
        {[
          { v: "amount", label: "₹" },
          { v: "percent", label: "%" },
        ].map((o) => (
          <button
            key={o.v}
            type="button"
            disabled={disabled}
            onClick={() => onType(o.v)}
            aria-pressed={type === o.v}
            className={`px-3.5 py-2 text-sm font-bold transition ${
              type === o.v
                ? "bg-amber-500 text-white"
                : "bg-white text-slate-500 hover:bg-slate-50"
            } disabled:opacity-50`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <input
        value={value}
        disabled={disabled}
        inputMode="decimal"
        onChange={(e) =>
          onValue(e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1"))
        }
        placeholder={type === "percent" ? "e.g. 10 (%)" : "e.g. 100 (₹)"}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-slate-50"
      />
    </div>
  </div>
);

export default OfferField;
