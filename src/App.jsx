import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Facilities from "./pages/Facilities/Facilities";

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
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
