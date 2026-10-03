import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import OfferField from "../pricing/OfferField";
import AdvanceField from "../pricing/AdvanceField";
import MembershipEntry from "./MembershipEntry";
import { calcDiscount, rupees } from "../../utils/pricingUtils";
import {
  ENTRY_SOURCES,
  PAYMENT_MODES,
  formatDateTime,
} from "../../utils/poolBookingUtils";

const PRODUCT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "rent", label: "Rent" },
  { value: "buy", label: "Buy" },
  { value: "own", label: "Own" },
];

const initialForm = {
  name: "",
  age: "",
  entrySource: "",
  persons: "1",
  mobile: "",
  hours: "1",
  productType: "none",
  productId: "",
  productQty: "1",
  productName: "",
  paymentMode: "",
  discountType: "amount",
  discountValue: "",
  advancePaid: "",
};

// text-base (16px) stops iOS Safari from zooming into focused inputs
const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    {children}
  </label>
);

const ChoiceGroup = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        aria-pressed={value === opt.value}
        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
          value === opt.value
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-gray-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const digitsOnly = (v) => v.replace(/\D/g, "");
const decimal = (v) => v.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

const NewBookingModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [now, setNow] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pricing, setPricing] = useState(null); // { rates, products }

  // Price list comes from Products & Pricing (saved in the database)
  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/pricing")
      .then(({ data }) => {
        if (!cancelled) setPricing(data);
      })
      .catch(() => {
        if (!cancelled) setPricing({ rates: {}, products: [], failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Live "current date & time" (captured automatically, read-only)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Esc to close + lock background scroll while open
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, saving]);

  const isFree = form.paymentMode === "free";
  const needsProductDetails =
    form.productType === "rent" || form.productType === "buy";

  // Auto price: swimming is charged PER PERSON (flat), products from the list
  const perPerson = pricing?.rates?.swimmingPerPerson || 0;
  const persons = Number(form.persons) || 0;
  const fee = isFree ? 0 : persons * perPerson;
  const chosenProduct = needsProductDetails
    ? pricing?.products.find((p) => p._id === form.productId)
    : null;
  const qty = Math.max(1, Number(form.productQty) || 1);
  const productTotal = isFree || !chosenProduct ? 0 : chosenProduct.price * qty;
  const subtotal = fee + productTotal;
  const discount = isFree
    ? 0
    : calcDiscount(subtotal, form.discountType, form.discountValue);
  const total = subtotal - discount;

  // Advance already paid in the District / Turf Town app is deducted
  const viaApp = ["district", "turftown"].includes(form.entrySource) && !isFree;
  const advance = viaApp ? Math.min(Number(form.advancePaid) || 0, total) : 0;
  const toCollect = total - advance;
  const productChoices = (pricing?.products || []).filter(
    (p) => p.type === form.productType && p.active
  );

  const validate = () => {
    if (!form.name.trim()) return "Enter the customer name";
    if (!form.age || Number(form.age) < 1) return "Enter a valid age";
    if (!form.entrySource) return "Select the entry source";
    if (!form.persons || Number(form.persons) < 1)
      return "Enter number of persons";
    if (!/^[0-9+\-\s]{10,15}$/.test(form.mobile.trim()))
      return "Enter a valid mobile number";
    const hours = Number(form.hours);
    if (!hours || hours < 0.5 || hours > 12)
      return "Hours must be between 0.5 and 12";
    if (needsProductDetails && !form.productId)
      return "Select a product from the list";
    if (pricing?.failed) return "Could not load prices. Try again.";
    if (!form.paymentMode) return "Select a payment option";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.paymentMode === "membership") return; // handled by MembershipEntry
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setSaving(true);
    try {
      const { data } = await axiosInstance.post("/pool-bookings", {
        ...form,
        name: form.name.trim(),
        mobile: form.mobile.trim(),
      });
      onCreated(data.booking, data.serverTime);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not save booking. Try again."
      );
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-booking-title"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-h-[90vh] max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="sticky top-0 z-10 -mx-5 -mt-5 flex items-start justify-between gap-3 rounded-t-2xl bg-white px-5 pb-3 pt-5 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6">
          <div>
            <h2
              id="new-booking-title"
              className="text-lg font-bold text-slate-800"
            >
              New Swimming Pool Booking
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Booking time: {formatDateTime(now)} (auto)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-2 rounded-2xl border border-gray-100 bg-slate-50 p-4">
          <span className="text-xs font-semibold text-slate-500">
            How is the customer paying?
          </span>
          <div className="mt-2">
            <ChoiceGroup
              options={PAYMENT_MODES}
              value={form.paymentMode}
              onChange={(v) => set("paymentMode", v)}
            />
          </div>
        </div>

        {form.paymentMode === "membership" && (
          <MembershipEntry onCreated={onCreated} onClose={onClose} />
        )}

        {form.paymentMode && form.paymentMode !== "membership" && (
        <>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Customer name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              autoComplete="off"
              placeholder="Full name"
            />
          </Field>
          <Field label="Age">
            <input
              className={inputClass}
              value={form.age}
              inputMode="numeric"
              maxLength={3}
              onChange={(e) => set("age", digitsOnly(e.target.value))}
              placeholder="Age"
            />
          </Field>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-semibold text-slate-500">
              Entry through
            </span>
            <ChoiceGroup
              options={ENTRY_SOURCES}
              value={form.entrySource}
              onChange={(v) => set("entrySource", v)}
            />
          </div>

          <Field label="Number of persons">
            <input
              className={inputClass}
              value={form.persons}
              inputMode="numeric"
              maxLength={3}
              onChange={(e) => set("persons", digitsOnly(e.target.value))}
            />
          </Field>
          <Field label="Mobile number">
            <input
              className={inputClass}
              type="tel"
              value={form.mobile}
              maxLength={15}
              onChange={(e) =>
                set("mobile", e.target.value.replace(/[^\d+\-\s]/g, ""))
              }
              placeholder="10-digit mobile"
            />
          </Field>

          <Field label="Hours booked (0.5 - 12)">
            <input
              className={inputClass}
              value={form.hours}
              inputMode="decimal"
              maxLength={4}
              onChange={(e) => set("hours", decimal(e.target.value))}
            />
          </Field>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">
              Pool product
            </span>
            <ChoiceGroup
              options={PRODUCT_OPTIONS}
              value={form.productType}
              onChange={(v) => set("productType", v)}
            />
          </div>

          {form.productType === "own" && (
            <div className="sm:col-span-2">
              <Field label="What are they bringing? (optional)">
                <input
                  className={inputClass}
                  value={form.productName}
                  onChange={(e) => set("productName", e.target.value)}
                  placeholder="e.g. Swimsuit, goggles"
                />
              </Field>
            </div>
          )}

          {needsProductDetails && (
            <>
              <Field
                label={`Product (${form.productType === "rent" ? "rent" : "buy"})`}
              >
                <select
                  className={inputClass}
                  value={form.productId}
                  onChange={(e) => set("productId", e.target.value)}
                >
                  <option value="">
                    {productChoices.length
                      ? "Select product"
                      : "No products - add in Products & Pricing"}
                  </option>
                  {productChoices.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} - {rupees(p.price)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Quantity">
                <input
                  className={inputClass}
                  value={form.productQty}
                  inputMode="numeric"
                  maxLength={3}
                  onChange={(e) => set("productQty", digitsOnly(e.target.value))}
                />
              </Field>
            </>
          )}

          {!isFree && form.paymentMode && (
            <div className="sm:col-span-2">
              <OfferField
                type={form.discountType}
                value={form.discountValue}
                onType={(v) => set("discountType", v)}
                onValue={(v) => set("discountValue", v)}
              />
            </div>
          )}
        </div>

        {/* Auto price breakdown */}
        <div className="mt-5 rounded-xl border border-gray-100 p-4 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>
              Pool fee ({persons || 0} {persons === 1 ? "person" : "persons"} ×{" "}
              {rupees(perPerson)})
            </span>
            <span className="font-semibold">{rupees(fee)}</span>
          </div>
          {chosenProduct && (
            <div className="mt-1.5 flex items-center justify-between text-slate-600">
              <span>
                {chosenProduct.name} ({qty} × {rupees(chosenProduct.price)})
              </span>
              <span className="font-semibold">{rupees(productTotal)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="mt-1.5 flex items-center justify-between text-emerald-600">
              <span>
                Offer{" "}
                {form.discountType === "percent"
                  ? `(${form.discountValue}%)`
                  : ""}
              </span>
              <span className="font-semibold">- {rupees(discount)}</span>
            </div>
          )}
          {!isFree && perPerson === 0 && pricing && !pricing.failed && (
            <p className="mt-2 text-[11px] font-medium text-amber-600">
              Pool price is not set yet - set it in Products &amp; Pricing.
            </p>
          )}
        </div>

        {viaApp && (
          <div className="mt-5">
            <AdvanceField
              source={form.entrySource}
              value={form.advancePaid}
              onChange={(v) => set("advancePaid", v)}
              total={total}
            />
          </div>
        )}

        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm">
          {advance > 0 && (
            <>
              <div className="flex items-center justify-between text-slate-600">
                <span>Total</span>
                <span className="font-semibold">{rupees(total)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-blue-600">
                <span>Advance paid (app)</span>
                <span className="font-semibold">- {rupees(advance)}</span>
              </div>
            </>
          )}
          <div className={`flex items-center justify-between ${advance > 0 ? "mt-2 border-t border-gray-200 pt-2" : ""}`}>
            <span className="font-semibold text-slate-500">Balance to collect</span>
            <span className="text-lg font-extrabold text-slate-800">
              {isFree ? "Free" : rupees(toCollect)}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          The booked hours start counting 5 minutes after booking (fresh-up
          time).
        </p>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
          >
            {error}
          </p>
        )}

        <div className="sticky bottom-0 -mx-5 -mb-5 mt-5 flex justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-white px-5 py-3 sm:-mx-6 sm:-mb-6 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            Confirm Booking
          </button>
        </div>
        </>
        )}
      </form>
    </div>
  );
};

export default NewBookingModal;
