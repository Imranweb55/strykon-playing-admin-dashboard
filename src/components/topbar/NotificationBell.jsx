import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, XCircle, Wallet2, CheckCheck } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const POLL_MS = 20 * 1000;

const ICONS = {
  cancellation: { Icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  payment_due: { Icon: Wallet2, color: "text-amber-500", bg: "bg-amber-50" },
};

const timeAgo = (value) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

// Topbar bell: unread-count badge, polls the backend so new cancellations /
// pending-payment alerts show up without a page refresh.
const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/notifications", { params: { limit: 20 } });
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      /* keep showing the last known list on a transient failure */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const id = setInterval(load, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [load]);

  const openItem = async (n) => {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      axiosInstance.patch(`/notifications/${n._id}/read`).catch(() => {});
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnreadCount(0);
    try {
      await axiosInstance.patch("/notifications/read-all");
    } catch {
      load(); // fall back to the server's real state if this failed
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative text-slate-500"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-slate-50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-3 max-h-[70vh] w-[min(360px,92vw)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-bold text-slate-800">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[55vh] overflow-y-auto overscroll-contain">
              {loading && (
                <p className="px-4 py-8 text-center text-sm text-slate-400">Loading...</p>
              )}
              {!loading && items.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  Nothing yet. Cancellations and pending payments will show up here.
                </p>
              )}
              {items.map((n) => {
                const meta = ICONS[n.type] || ICONS.payment_due;
                return (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => openItem(n)}
                    className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      n.read ? "" : "bg-blue-50/40"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}>
                      <meta.Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm leading-tight ${n.read ? "font-medium text-slate-600" : "font-bold text-slate-800"}`}>
                        {n.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">{n.message}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                    </span>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
