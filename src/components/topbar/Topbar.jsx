import { useState } from "react";
import { Search, Bell, ChevronDown, Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Topbar = ({ onMenuClick }) => {
  const { admin, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-slate-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-slate-500 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Search members, bookings, sessions..."
            className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          <span className="hidden shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400 sm:inline">
            Ctrl + K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button className="relative text-slate-500" aria-label="Notifications">
          <Bell size={22} />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-50" />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
              {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-tight text-slate-800">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs leading-tight text-slate-400">
                Super Admin
              </p>
            </div>
            <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 z-20 mt-3 w-44 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
