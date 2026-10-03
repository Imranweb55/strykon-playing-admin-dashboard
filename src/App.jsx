import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Facilities from "./pages/Facilities/Facilities";
import Basketball from "./pages/Basketball/Basketball";
import Pickleball from "./pages/Pickleball/Pickleball";
import Cricket from "./pages/Cricket/Cricket";
import Skating from "./pages/Skating/Skating";
import CalendarBooking from "./pages/CalendarBooking/CalendarBooking";
import ProductsPricing from "./pages/Pricing/ProductsPricing";
import Members from "./pages/Members/Members";
import MemberDetail from "./pages/Members/MemberDetail";
import Ledger from "./pages/Ledger/Ledger";
import Reports from "./pages/Reports/Reports";
import Settings from "./pages/Settings/Settings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/*
            DashboardLayout renders the fixed Sidebar + Topbar once.
            Every dashboard page becomes a nested <Route> here and only
            that page's content re-renders inside the scrollable area -
            Sidebar/Topbar never re-mount or scroll away.
            e.g. to add "Members" later:
              <Route path="members" element={<Members />} />
          */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="swimming-pool" element={<Facilities />} />
            <Route path="basketball" element={<Basketball />} />
            <Route path="pickleball" element={<Pickleball />} />
            <Route path="cricket" element={<Cricket />} />
            <Route path="skating" element={<Skating />} />
            <Route path="calendar" element={<CalendarBooking />} />
            <Route path="pricing" element={<ProductsPricing />} />
            <Route path="members" element={<Members />} />
            <Route path="members/:id" element={<MemberDetail />} />
            <Route path="ledger" element={<Ledger />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
