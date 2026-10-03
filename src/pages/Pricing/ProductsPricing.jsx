import { useEffect, useState } from "react";
import {
  Waves,
  CircleDot,
  Dribbble,
  Zap,
  Tags,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Save,
  Loader2,
  Info,
  Package,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { rupees } from "../../utils/pricingUtils";

const FEES = [
  {
    key: "swimmingPerPerson",
    name: "Swimming Pool",
    unit: "per person",
    hint: "Flat price for each person. Not charged per hour.",
    Icon: Waves,
    color: "#2563EB",
  },
  {
    key: "pickleballPerHour",
    name: "Pickleball",
    unit: "per hour",
    hint: "One price per hour for any number of players.",
    Icon: CircleDot,
    color: "#16A34A",
  },
  {
    key: "basketballPerHour",
    name: "Basketball - Full Court",
    unit: "per hour",
    hint: "Price per hour for the full court, any number of players.",
    Icon: Dribbble,
    color: "#F97316",
  },
  {
    key: "basketballHalfPerHour",
    name: "Basketball - Half Court",
    unit: "per hour",
    hint: "Price per hour for ONE half court. Booking 2 half courts = 2 x this price.",
    Icon: Dribbble,
    color: "#EA580C",
  },
  {
    key: "cricketPerHour",
    name: "Cricket",
    unit: "per hour",
    hint: "One price per hour for any number of players.",
    Icon: Zap,
    color: "#DC2626",
  },
];

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const digits = (v) => v.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

const TypeToggle = ({ value, onChange }) => (
  <div className="flex shrink-0 overflow-hidden rounded-lg border border-gray-200">
    {[
      { v: "rent", label: "Rent" },
      { v: "buy", label: "Buy" },
    ].map((o) => (
      <button
        key={o.v}
        type="button"
        onClick={() => onChange(o.v)}
        aria-pressed={value === o.v}
        className={`px-4 py-2 text-sm font-semibold transition ${
          value === o.v
            ? "bg-blue-600 text-white"
            : "bg-white text-slate-500 hover:bg-slate-50"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const ProductsPricing = () => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saved, setSaved] = useState({}); // rates as stored in the database
  const [rates, setRates] = useState({}); // editable copy (strings)
  const [products, setProducts] = useState([]);
  const [savingRates, setSavingRates] = useState(false);
  const [rateMsg, setRateMsg] = useState({ type: "", text: "" });

  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState({ name: "", type: "rent", price: "" });
  const [adding, setAdding] = useState(false);
  const [productError, setProductError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({ name: "", type: "rent", price: "" });
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/pricing")
      .then(({ data }) => {
        if (cancelled) return;
        setSaved(data.rates);
        setRates(
          Object.fromEntries(FEES.map((f) => [f.key, String(data.rates[f.key] ?? 0)]))
        );
        setProducts(data.products);
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError(err.response?.data?.message || "Could not load prices.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = FEES.some((f) => Number(rates[f.key]) !== (saved[f.key] ?? 0));

  const saveRates = async () => {
    setSavingRates(true);
    setRateMsg({ type: "", text: "" });
    try {
      const body = Object.fromEntries(
        FEES.map((f) => [f.key, Number(rates[f.key]) || 0])
      );
      const { data } = await axiosInstance.put("/pricing/rates", body);
      setSaved(data.rates);
      setRateMsg({ type: "ok", text: "Prices saved. New bookings use them now." });
    } catch (err) {
      setRateMsg({
        type: "err",
        text: err.response?.data?.message || "Could not save prices.",
      });
    } finally {
      setSavingRates(false);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return setProductError("Enter the product name");
    if (draft.price === "") return setProductError("Enter the price");
    setProductError("");
    setAdding(true);
    try {
      const { data } = await axiosInstance.post("/pricing/products", {
        ...draft,
        price: Number(draft.price),
      });
      setProducts((p) => [...p, data.product]);
      setDraft((d) => ({ ...d, name: "", price: "" }));
    } catch (err) {
      setProductError(err.response?.data?.message || "Could not add product.");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setEdit({ name: p.name, type: p.type, price: String(p.price) });
  };

  const saveEdit = async (p) => {
    if (!edit.name.trim() || edit.price === "") return;
    setBusyId(p._id);
    try {
      const { data } = await axiosInstance.put(`/pricing/products/${p._id}`, {
        ...edit,
        price: Number(edit.price),
      });
      setProducts((list) => list.map((x) => (x._id === p._id ? data.product : x)));
      setEditingId(null);
    } catch (err) {
      window.alert(err.response?.data?.message || "Could not update product.");
    } finally {
      setBusyId(null);
    }
  };

  const removeProduct = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? Old bookings keep their saved price.`))
      return;
    setBusyId(p._id);
    try {
      await axiosInstance.delete(`/pricing/products/${p._id}`);
      setProducts((list) => list.filter((x) => x._id !== p._id));
    } catch (err) {
      window.alert(err.response?.data?.message || "Could not delete product.");
    } finally {
      setBusyId(null);
    }
  };

  const shown = products.filter((p) => filter === "all" || p.type === filter);
  const counts = {
    all: products.length,
    rent: products.filter((p) => p.type === "rent").length,
    buy: products.filter((p) => p.type === "buy").length,
  };

  return (
    <div className="flex flex-col gap-5 py-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
            <Tags size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Products &amp; Pricing
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Set game fees and pool products. Bookings calculate the price
              automatically from here.
            </p>
          </div>
        </div>
      </div>

      {loadError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {loadError}
        </p>
      )}

      {/* Game fees */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Game Fees</h2>
            <p className="text-xs text-slate-400">
              Offers are added by the admin while making a booking.
            </p>
          </div>
          <button
            type="button"
            onClick={saveRates}
            disabled={!dirty || savingRates || loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
          >
            {savingRates ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save prices
          </button>
        </div>

        {rateMsg.text && (
          <p
            role="status"
            className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${
              rateMsg.type === "ok"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {rateMsg.text}
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {FEES.map((f) => (
            <div
              key={f.key}
              className="rounded-2xl border border-gray-100 p-4 transition hover:shadow-md"
              style={{ borderTop: `3px solid ${f.color}` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${f.color}1A`, color: f.color }}
                >
                  <f.Icon size={19} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">{f.name}</p>
                  <p className="text-xs font-semibold" style={{ color: f.color }}>
                    {f.unit}
                  </p>
                </div>
              </div>

              <div className="relative mt-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                  ₹
                </span>
                <input
                  value={rates[f.key] ?? ""}
                  disabled={loading}
                  inputMode="decimal"
                  aria-label={`${f.name} price ${f.unit}`}
                  onChange={(e) =>
                    setRates((r) => ({ ...r, [f.key]: digits(e.target.value) }))
                  }
                  className={`${inputClass} pl-8 text-lg font-bold`}
                />
              </div>
              <p className="mt-2 text-[11px] leading-snug text-slate-400">
                {f.hint}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Package size={18} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Swimming Pool Products
              </h2>
              <p className="text-xs text-slate-400">
                Items customers can rent or buy at the pool.
              </p>
            </div>
          </div>
          <div className="flex rounded-full bg-slate-100 p-1">
            {[
              { v: "all", label: "All" },
              { v: "rent", label: "Rent" },
              { v: "buy", label: "Buy" },
            ].map((t) => (
              <button
                key={t.v}
                type="button"
                onClick={() => setFilter(t.v)}
                aria-pressed={filter === t.v}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  filter === t.v
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label} ({counts[t.v]})
              </button>
            ))}
          </div>
        </div>

        {/* Add product */}
        <form
          onSubmit={addProduct}
          className="mt-5 flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-4"
        >
          <label className="flex min-w-[180px] flex-1 flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">
              Product name
            </span>
            <input
              className={inputClass}
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Swimsuit, Goggles, Towel"
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Type</span>
            <TypeToggle
              value={draft.type}
              onChange={(v) => setDraft((d) => ({ ...d, type: v }))}
            />
          </div>
          <label className="flex w-36 flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Price (₹)</span>
            <input
              className={inputClass}
              value={draft.price}
              inputMode="decimal"
              onChange={(e) =>
                setDraft((d) => ({ ...d, price: digits(e.target.value) }))
              }
              placeholder="0"
            />
          </label>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={16} />}
            Add product
          </button>
          {productError && (
            <p role="alert" className="w-full text-sm font-medium text-red-600">
              {productError}
            </p>
          )}
        </form>

        {/* List */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-400">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Product</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Price</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                    No products yet. Add the first one above.
                  </td>
                </tr>
              )}
              {shown.map((p, i) =>
                editingId === p._id ? (
                  <tr key={p._id} className="border-t border-slate-100 bg-blue-50/40">
                    <td className="py-2 pr-4 text-slate-500">{i + 1}</td>
                    <td className="py-2 pr-4">
                      <input
                        className={inputClass}
                        value={edit.name}
                        onChange={(e) => setEdit((d) => ({ ...d, name: e.target.value }))}
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <TypeToggle
                        value={edit.type}
                        onChange={(v) => setEdit((d) => ({ ...d, type: v }))}
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        className={`${inputClass} w-28`}
                        value={edit.price}
                        inputMode="decimal"
                        onChange={(e) =>
                          setEdit((d) => ({ ...d, price: digits(e.target.value) }))
                        }
                      />
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => saveEdit(p)}
                        disabled={busyId === p._id}
                        aria-label="Save"
                        className="mr-1 rounded-lg bg-emerald-500 p-2 text-white hover:bg-emerald-600 disabled:opacity-50"
                      >
                        <Check size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancel edit"
                        className="rounded-lg border border-gray-200 p-2 text-slate-500 hover:bg-slate-50"
                      >
                        <X size={15} />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={p._id} className="border-t border-slate-100">
                    <td className="py-3 pr-4 text-slate-500">{i + 1}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-700">{p.name}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          p.type === "rent"
                            ? "bg-violet-50 text-violet-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {p.type === "rent" ? "Rent" : "Buy"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-bold text-slate-800">{rupees(p.price)}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        aria-label={`Edit ${p.name}`}
                        className="mr-1 rounded-lg border border-gray-200 p-2 text-slate-500 hover:bg-slate-50"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(p)}
                        disabled={busyId === p._id}
                        aria-label={`Delete ${p.name}`}
                        className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* How it works */}
      <section className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-slate-600">
        <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
        <ul className="flex list-disc flex-col gap-1 pl-4">
          <li>
            <b>Swimming pool:</b> total = persons × price per person + chosen
            products.
          </li>
          <li>
            <b>Pickleball, Basketball, Cricket:</b> total = hours × price per
            hour (same for any number of players).
          </li>
          <li>
            <b>Offer:</b> while booking, enter ₹ or % and it is subtracted
            from the total automatically.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default ProductsPricing;
