import { useState } from "react";
import {
  UserCircle2,
  Mail,
  Lock,
  KeyRound,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { fmtDate } from "../../utils/memberUtils";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";

const PasswordInput = ({ value, onChange, placeholder, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

const ProfileSecurityCard = () => {
  const { admin, updateAdmin } = useAuth();

  const [name, setName] = useState(admin?.name || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [profilePassword, setProfilePassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const profileDirty = name.trim() !== admin?.name || email.trim().toLowerCase() !== admin?.email;

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!profilePassword) {
      setProfileMsg({ type: "err", text: "Enter your current password to confirm the change." });
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await axiosInstance.put("/auth/profile", {
        name: name.trim(),
        email: email.trim(),
        currentPassword: profilePassword,
      });
      updateAdmin({ name: data.admin.name, email: data.admin.email });
      setProfilePassword("");
      setProfileMsg({ type: "ok", text: "Profile updated." });
    } catch (err) {
      setProfileMsg({ type: "err", text: err.response?.data?.message || "Could not update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "err", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "err", text: "New password and confirmation do not match." });
      return;
    }
    setSavingPassword(true);
    try {
      await axiosInstance.put("/auth/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg({ type: "ok", text: "Password changed." });
    } catch (err) {
      setPasswordMsg({ type: "err", text: err.response?.data?.message || "Could not change password." });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* Profile */}
      <form onSubmit={saveProfile} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <UserCircle2 size={18} />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-800">Profile</h2>
            {admin?.createdAt && (
              <p className="text-xs text-slate-400">Admin since {fmtDate(admin.createdAt.slice(0, 10))}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Full name</span>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Mail size={12} /> Email address
            </span>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          {profileDirty && (
            <label className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <Lock size={12} /> Confirm with current password
              </span>
              <PasswordInput
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
              />
            </label>
          )}
        </div>

        {profileMsg && (
          <p
            role="status"
            className={`mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${
              profileMsg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            }`}
          >
            {profileMsg.type === "ok" && <CheckCircle2 size={14} />}
            {profileMsg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={savingProfile || !profileDirty}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {savingProfile && <Loader2 size={15} className="animate-spin" />}
          Save Profile
        </button>
      </form>

      {/* Password */}
      <form onSubmit={savePassword} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <KeyRound size={18} />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-800">Change Password</h2>
            <p className="text-xs text-slate-400">Use at least 6 characters.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Current password</span>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">New password</span>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500">Confirm new password</span>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </label>
        </div>

        {passwordMsg && (
          <p
            role="status"
            className={`mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${
              passwordMsg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            }`}
          >
            {passwordMsg.type === "ok" && <CheckCircle2 size={14} />}
            {passwordMsg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
        >
          {savingPassword && <Loader2 size={15} className="animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ProfileSecurityCard;
