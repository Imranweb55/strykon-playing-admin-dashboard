import { useState } from "react";
import { ChevronDown, Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";
import GlobalSearch from "./GlobalSearch";

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

        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <NotificationBell />

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
