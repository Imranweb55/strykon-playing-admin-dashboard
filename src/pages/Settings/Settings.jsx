import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import ProfileSecurityCard from "../../components/settings/ProfileSecurityCard";
import AcademyDetailsCard from "../../components/settings/AcademyDetailsCard";
import BookingPreferencesCard from "../../components/settings/BookingPreferencesCard";
import NotificationEmailCard from "../../components/settings/NotificationEmailCard";
import TurfClosuresCard from "../../components/settings/TurfClosuresCard";

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/settings")
      .then(({ data }) => {
        if (!cancelled) setSettings(data.settings);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Could not load settings.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
            <SlidersHorizontal size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Settings</h1>
            <p className="mt-1 text-sm text-slate-300">
              Manage your login, academy branding, booking preferences and alerts.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <ProfileSecurityCard />
      <TurfClosuresCard />

      {!settings && !error && (
        <p className="py-6 text-center text-sm text-slate-400">Loading settings...</p>
      )}

      {settings && (
        <>
          <AcademyDetailsCard settings={settings} onSaved={setSettings} />
          <BookingPreferencesCard settings={settings} onSaved={setSettings} />
          <NotificationEmailCard settings={settings} onSaved={setSettings} />
        </>
      )}
    </div>
  );
};

export default Settings;
