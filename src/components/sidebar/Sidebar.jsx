import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  CalendarDays,
  Tags,
  BookOpen,
  Clock3,
  UserSquare2,
  Building2,
  BarChart3,
  Settings,
  Waves,
  Dribbble,
  CircleDot,
  Zap,
  Footprints,
  X,
} from "lucide-react";
import { sidebarLinks } from "./sidebarLinks";

// Panther artwork (public/assets/sidebar/sidebar-bg.png). It is nearly white,
// so it is multiplied over a tinted gradient: the colour shows through and
// the gold panther stays visible at the bottom.
const SIDEBAR_BG_PATH = "/assets/sidebar/sidebar-bg.png";
const SIDEBAR_STYLE = {
  backgroundImage: `url(${SIDEBAR_BG_PATH}), linear-gradient(180deg, #cfe0fb 0%, #bcd2f7 40%, #d6dcf8 72%, #fbe3bd 100%)`,
  backgroundBlendMode: "multiply",
  backgroundSize: "cover, cover",
  backgroundPosition: "center bottom, center",
  backgroundRepeat: "no-repeat",
};

// Maps the icon name stored in sidebarLinks.js to the actual lucide-react component
const iconMap = {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  CalendarDays,
  Tags,
  BookOpen,
  Clock3,
  UserSquare2,
  Building2,
  BarChart3,
  Settings,
  Waves,
  Dribbble,
  CircleDot,
  Zap,
  Footprints,
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
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-72 flex-col border-r border-blue-300/60 shadow-[6px_0_28px_rgba(37,99,235,0.14)] transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={SIDEBAR_STYLE}
      >
        {/* Logo */}
        <div className="mx-4 flex items-center justify-between gap-3 border-b border-blue-300/50 px-2 py-6">
          <div className="flex items-center gap-3">
            {/* Place your official logo at public/logo.png - shows up automatically */}
            <img
              src="/logo.png"
              alt="Strykon Sports Academy"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-lg font-extrabold leading-tight tracking-wide text-blue-950">
                STRYKON
              </p>
              <p className="text-[10px] font-semibold tracking-[2px] text-blue-800/70">
                SPORTS ACADEMY
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-900/60 lg:hidden"
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
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                          : "text-blue-950/75 hover:bg-white/60 hover:text-blue-950"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-white/70 text-blue-700 shadow-sm"
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
          <p className="text-xl font-extrabold leading-snug text-blue-950">
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
