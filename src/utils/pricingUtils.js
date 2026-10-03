// Same rule as Backend/utils/pricing.js (the server always re-calculates).
//  type "percent": value 0-100, type "amount": rupees. Never above subtotal.
export const calcDiscount = (subtotal, type, value) => {
  const v = Number(value);
  if (!["percent", "amount"].includes(type) || !Number.isFinite(v) || v <= 0)
    return 0;
  const raw = type === "percent" ? (subtotal * Math.min(v, 100)) / 100 : v;
  return Math.min(Math.round(raw), subtotal);
};

export const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
