import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Waves, Dribbble, CircleDot, Zap, Loader2, X } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { sportMeta } from "../../data/dashboardData";
import { formatDateKey, minutesNow, toDateKey } from "../../utils/turfRules";

const REFRESH_MS = 20 * 1000;
const DEBOUNCE_MS = 250;

const GAME_ICON = { swimming: Waves, basketball: Dribbble, pickleball: CircleDot, cricket: Zap };
const GAME_PATH = {
  swimming: "swimming-pool",
  basketball: "basketball",
  pickleball: "pickleball",
  cricket: "cricket",
};

const PHASE = {
  live: { label: "Live", cls: "bg-emerald-50 text-emerald-600" },
  upcoming: { label: "Upcoming", cls: "bg-blue-50 text-blue-600" },
};

// Topbar search: type a name or mobile and see who has a LIVE or UPCOMING
// booking in any game. Picking a result opens that game's page (not a
// specific card) with the name + date in the link, so the page can show that
// day and filter to the person.
const GlobalSearch = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [tick, setTick] = useState(0);
  const [found, setFound] = useState({ q: "", results: [], error: "" });

  const q = query.trim();
  const enabled = q.length >= 2;

  // Debounced lookup; re-runs every few seconds while the list is open so a
  // booking made or finished elsewhere shows up without retyping.
  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const now = new Date();
        const { data } = await axiosInstance.get("/search", {
          params: {
            q,
            date: toDateKey(now),
            nowMin: minutesNow(now.getTime()),
            tz: now.getTimezoneOffset(),
          },
        });
        if (!cancelled) setFound({ q, results: data.results, error: "" });
      } catch (err) {
        if (!cancelled)
          setFound({ q, results: [], error: err.response?.data?.message || "Could not search." });
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, enabled, tick]);

  useEffect(() => {
    if (!open || !enabled) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, [open, enabled]);

  // Ctrl/Cmd + K focuses the bar; click outside closes the dropdown.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  const loading = enabled && found.q !== q;
  const results = enabled && found.q === q ? found.results : [];
  const activeIndex = Math.min(active, results.length - 1);
  const todayKey = toDateKey(new Date());

  const pick = (r) => {
    // `t` makes every pick a new URL, so searching the same person again
    // still re-applies the date/filter on a page that is already open.
    const params = new URLSearchParams({ q: r.name, date: r.date, t: String(Date.now()) });
    setOpen(false);
    setQuery("");
    setActive(-1);
    inputRef.current?.blur();
    navigate(`/dashboard/${GAME_PATH[r.game]}?${params.toString()}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (Math.min(i, results.length - 1) + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : Math.min(i, results.length - 1) - 1));
    } else if (e.key === "Enter" && results.length) {
      e.preventDefault();
      pick(results[activeIndex >= 0 ? activeIndex : 0]);
    }
  };

  const showPanel = open && enabled;

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search a name or mobile with a live / upcoming booking..."
          aria-label="Search live and upcoming bookings"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="global-search-results"
          aria-activedescendant={activeIndex >= 0 ? `gs-opt-${activeIndex}` : undefined}
          autoComplete="off"
          className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        {loading && <Loader2 size={15} className="shrink-0 animate-spin text-slate-400" />}
        {query && !loading && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActive(-1);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        )}
        <span className="hidden shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400 sm:inline">
          Ctrl + K
        </span>
      </div>

      {showPanel && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute left-0 right-0 z-40 mt-2 max-h-[70vh] overflow-y-auto overscroll-contain rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl"
        >
          {loading && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-slate-400">Searching...</p>
          )}
          {!loading && found.error && (
            <p role="alert" className="px-3 py-4 text-center text-sm font-medium text-red-600">
              {found.error}
            </p>
          )}
          {!loading && !found.error && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-slate-400">
              No live or upcoming booking found for &ldquo;{q}&rdquo;.
            </p>
          )}
          {results.map((r, i) => {
            const meta = sportMeta[r.game];
            const Icon = GAME_ICON[r.game];
            const phase = PHASE[r.phase];
            return (
              <button
                key={`${r.game}-${r.id}`}
                id={`gs-opt-${i}`}
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                onClick={() => pick(r)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  i === activeIndex ? "bg-slate-50" : "hover:bg-slate-50"
                }`}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
                >
                  <Icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-800">
                    {r.name} <span className="font-medium text-slate-400">· {r.mobile}</span>
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {r.gameName} · {r.detail}
                  </span>
                  <span className="block truncate text-[11px] text-slate-400">
                    {r.date === todayKey ? "Today" : formatDateKey(r.date)} · {r.time}
                  </span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${phase.cls}`}>
                  {phase.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
