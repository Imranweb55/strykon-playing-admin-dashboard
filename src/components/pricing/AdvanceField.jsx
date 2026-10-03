import { Smartphone } from "lucide-react";
import { rupees } from "../../utils/pricingUtils";

const SOURCE_NAME = { district: "District App", turftown: "Turf Town App" };

// Shown only when Entry through = District / Turf Town. The advance the
// customer already paid in that app is deducted from the total.
const AdvanceField = ({ source, value, onChange, total }) => (
  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-800">
        <Smartphone size={13} />
        How much advance was paid through {SOURCE_NAME[source]}?
      </span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">₹</span>
        <input
          value={value}
          inputMode="decimal"
          onChange={(e) =>
            onChange(e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1"))
          }
          placeholder="0"
          aria-label="Advance paid"
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-base font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </label>
    {Number(value) > total && total > 0 && (
      <p className="mt-1.5 text-[11px] font-medium text-amber-600">
        Advance is more than the total - only {rupees(total)} will be counted.
      </p>
    )}
  </div>
);

export default AdvanceField;
