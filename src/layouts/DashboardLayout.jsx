import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Reserve space for the fixed sidebar on large screens */}
      <div className="flex h-dvh flex-1 flex-col overflow-hidden lg:ml-72">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Only this area scrolls - sidebar and topbar never move */}
        <main className="flex-1 overflow-y-auto px-4 pb-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
