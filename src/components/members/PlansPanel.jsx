import { Waves, Dribbble, Timer, Star, Settings2 } from "lucide-react";
import { rupees } from "../../utils/pricingUtils";

const Price = ({ plan, light }) => (
  <span className="flex items-baseline gap-2">
    {plan.originalPrice > plan.offerPrice && (
      <span
        className={`text-xs line-through ${light ? "text-white/60" : "text-slate-400"}`}
      >
        {rupees(plan.originalPrice)}
      </span>
    )}
    <span className="font-extrabold">{rupees(plan.offerPrice)}</span>
  </span>
);

// Plan cards styled like the academy price poster.
const PlansPanel = ({ plans, onManage }) => {
  const active = plans.filter((p) => p.active);
  const swim = active.filter((p) => p.category === "swimming");
  const basketball = active.filter((p) => p.category === "basketball");
  const skating = active.filter((p) => p.category === "skating");
  const coaching = active.filter((p) => p.category === "swimming-coaching");

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Membership Plans</h2>
          <p className="text-xs text-slate-400">
            Choose a plan while admitting a member or renewing.
          </p>
        </div>
        <button
          type="button"
          onClick={onManage}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <Settings2 size={14} />
          Manage plans
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_2fr]">
        {/* Swimming membership table */}
        <div className="overflow-hidden rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 bg-blue-700 px-4 py-2.5 text-xs font-bold tracking-wide text-white">
            <Waves size={14} />
            SWIMMING MEMBERSHIP PLANS
          </div>
          <div className="grid grid-cols-3 bg-blue-50 px-4 py-2 text-[11px] font-bold text-blue-800">
            <span>PLAN</span>
            <span>ORIGINAL</span>
            <span>OFFER PRICE</span>
          </div>
          {swim.length === 0 && (
            <p className="px-4 py-4 text-xs text-slate-400">No plans.</p>
          )}
          {swim.map((p) => (
            <div
              key={p._id}
              className="grid grid-cols-3 items-center border-t border-blue-50 px-4 py-2.5 text-sm"
            >
              <span className="font-semibold text-slate-700">{p.name}</span>
              <span className="text-slate-400 line-through">
                {rupees(p.originalPrice)}
              </span>
              <span className="font-extrabold text-blue-700">
                {rupees(p.offerPrice)}
              </span>
            </div>
          ))}
        </div>

        {/* Coaching cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 p-4 text-white">
            <span className="flex items-center gap-2 text-xs font-bold tracking-wide">
              <Dribbble size={15} /> BASKETBALL COACHING
            </span>
            <p className="mt-1 text-[11px] text-white/80">Monthly program</p>
            {basketball.map((p) => (
              <div key={p._id} className="mt-3">
                <p className="text-2xl">
                  <Price plan={p} light />
                  <span className="ml-1 text-xs font-medium text-white/80">/month</span>
                </p>
                {p.note && (
                  <p className="mt-2 text-[11px] leading-snug text-white/85">{p.note}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-violet-600 to-violet-700 p-4 text-white">
            <span className="flex items-center gap-2 text-xs font-bold tracking-wide">
              <Timer size={15} /> SKATING COACHING
            </span>
            <p className="mt-1 text-[11px] text-white/80">Monthly program</p>
            {skating.map((p) => (
              <div key={p._id} className="mt-3">
                <p className="text-2xl">
                  <Price plan={p} light />
                  <span className="ml-1 text-xs font-medium text-white/80">/month</span>
                </p>
                {p.note && (
                  <p className="mt-2 text-[11px] leading-snug text-white/85">{p.note}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-cyan-600 to-blue-700 p-4 text-white">
            <span className="flex items-center gap-2 text-xs font-bold tracking-wide">
              <Star size={15} /> SWIMMING COACHING
            </span>
            <p className="mt-1 text-[11px] text-white/80">Beginner class</p>
            {coaching.map((p) => (
              <div key={p._id} className="mt-3 rounded-xl bg-white/10 px-3 py-2">
                <p className="text-[11px] font-semibold text-white/90">
                  {p.name.replace("Swimming Coaching - ", "")}
                </p>
                <p className="text-lg">
                  <Price plan={p} light />
                  <span className="ml-1 text-xs font-medium text-white/80">/month</span>
                </p>
              </div>
            ))}
            {coaching[0]?.note && (
              <p className="mt-2 text-[11px] text-white/85">{coaching[0].note}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlansPanel;
