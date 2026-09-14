import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Clock3,
  UserSquare2,
  Building2,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { sidebarLinks } from "./sidebarLinks";

// Maps the icon name stored in sidebarLinks.js to the actual lucide-react component
const iconMap = {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Clock3,
  UserSquare2,
  Building2,
  BarChart3,
  Settings,
};

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop - only visible when the drawer is open on small screens */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-72 flex-col border-r border-gray-100 bg-white transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-6 py-6">
          <div className="flex items-center gap-3">
            {/* Place your official logo at public/logo.png - shows up automatically */}
            <img
              src="/logo.png"
              alt="Strykon Sports Academy"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-lg font-extrabold leading-tight tracking-wide text-slate-800">
                STRYKON
              </p>
              <p className="text-[10px] font-semibold tracking-[2px] text-slate-400">
                SPORTS ACADEMY
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 lg:hidden"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-2">
          <ul className="flex flex-col gap-1">
            {sidebarLinks.map((link) => {
              const Icon = iconMap[link.icon];
              return (
                <li key={link.id}>
                  <NavLink
                    to={link.path}
                    end={link.path === "/dashboard"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-amber-50 text-slate-800"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon size={17} />
                        </span>
                        <span className={isActive ? "font-semibold" : ""}>
                          {link.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom decorative tagline */}
        <div className="px-6 pb-8 pt-4">
          <p className="text-xl font-extrabold leading-snug text-slate-800">
            Play
            <br />
            Train
            <br />
            Grow
          </p>
          <span className="mt-3 block h-[3px] w-10 rounded bg-gradient-to-r from-amber-300 to-orange-500" />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
