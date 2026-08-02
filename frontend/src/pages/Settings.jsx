import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertCircle,
  Trash2,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import api from "../services/api";
import { getDonorProfile, updateDonorProfile } from "../services/dashboardService";
import OtpVerification from "../components/shared/OtpVerification";
import { resetForgottenPassword, deleteAccount } from "../services/authService";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
];

export default function Settings({ role: propRole }) {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const role = propRole || (hasRole("admin") ? "admin" : hasRole("bloodbank") || hasRole("blood_bank") ? "blood bank" : hasRole("donor") && hasRole("patient") ? "user" : hasRole("donor") ? "donor" : hasRole("patient") ? "patient" : "donor");
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resetData, setResetData] = useState({ new_password: "", confirm_password: "" });
  const [showResetNew, setShowResetNew] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isDonor = hasRole("donor");

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    city: "",
    weight: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/auth/profile");
        const data = res.data;
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          city: data.city || "",
          weight: "",
        });
        if (isDonor) {
          const donorRes = await getDonorProfile().catch(() => null);
          if (donorRes?.donor?.weight) {
            setProfile((prev) => ({ ...prev, weight: donorRes.donor.weight }));
          }
        }
      } catch {
        if (user) {
          setProfile({
            first_name: user?.name?.split(" ")[0] || "",
            last_name: user?.name?.split(" ").slice(1).join(" ") || "",
            email: user?.email || "",
            phone: user?.phone || "",
            city: user?.city || "",
            weight: "",
          });
        }
      }
    })();
  }, [isDonor, user]);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  function updateProfile(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function updatePassword(field, value) {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.patch("/auth/profile", {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        city: profile.city,
      });
      if (isDonor && profile.weight) {
        await updateDonorProfile({ weight: Number(profile.weight) }).catch(() => {});
      }
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (passwordData.new_password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setSuccess("Password changed successfully!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch {
      setError("Could not change password. Check your current password.");
    } finally {
      setSaving(false);
    }
  }

  function enterForgotMode() {
    setError("");
    setSuccess("");
    setOtpVerified(false);
    setResetData({ new_password: "", confirm_password: "" });
    setForgotMode(true);
  }

  function exitForgotMode() {
    setForgotMode(false);
    setOtpVerified(false);
    setResetData({ new_password: "", confirm_password: "" });
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (resetData.new_password !== resetData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (resetData.new_password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    try {
      await resetForgottenPassword(profile.phone, resetData.new_password);
      setSuccess("Password reset successfully!");
      exitForgotMode();
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Are you sure you want to delete your account? This will permanently remove your account and all your data. This cannot be undone.")) return;
    if (!window.confirm("This action is permanent. All your requests, donations, and history will be deleted. Continue?")) return;
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete account.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-red mb-1 block">Settings</span>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {role.charAt(0).toUpperCase() + role.slice(1)} Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account, security, and preferences.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">
          <CheckCircle size={16} />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red bg-red/10 px-4 py-3 rounded-xl border border-red/20">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-white text-red shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <motion.div className="bg-white rounded-2xl p-4 md:p-8 border border-slate-100 shadow-sm" {...fadeUp}>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  First Name
                </label>
                <input
                  value={profile.first_name}
                  onChange={(e) => updateProfile("first_name", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Last Name
                </label>
                <input
                  value={profile.last_name}
                  onChange={(e) => updateProfile("last_name", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateProfile("phone", e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
                  maxLength={10}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
              <input
                value={profile.city}
                onChange={(e) => updateProfile("city", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
              />
            </div>
            {isDonor && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => updateProfile("weight", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
                  min={1}
                />
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-4 py-3 rounded-xl">
              <Shield size={14} />
              Your data is encrypted and never shared without your consent.
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-500 transition disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trash2 size={16} className="text-red" /> Delete Account
            </h3>
            <p className="text-sm text-slate-500 mt-1">Permanently delete your account and all associated data. This cannot be undone.</p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="mt-4 px-6 py-2.5 bg-red/10 text-red border border-red/30 rounded-full text-sm font-bold hover:bg-red hover:text-white transition disabled:opacity-60 flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-red border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete Account
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === "password" && (
        <motion.div className="bg-white rounded-2xl p-4 md:p-8 border border-slate-100 shadow-sm" {...fadeUp}>
          {forgotMode ? (
            <div className="space-y-5 max-w-md">
              <button type="button" onClick={exitForgotMode}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition">
                &larr; Back to Change Password
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound size={18} className="text-red" /> Forgot Password
                </h3>
                <p className="text-sm text-slate-500 mt-1">Verify your phone number to reset your password.</p>
              </div>
              {!otpVerified ? (
                <OtpVerification
                  phone={profile.phone}
                  purpose="forgot_password"
                  onVerified={() => setOtpVerified(true)}
                  onError={(msg) => setError(msg)}
                />
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <input type={showResetNew ? "text" : "password"} value={resetData.new_password}
                        onChange={(e) => setResetData((prev) => ({ ...prev, new_password: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20 pr-10"
                        autoComplete="new-password" required minLength={6} />
                      <button type="button" onClick={() => setShowResetNew(!showResetNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showResetNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input type={showResetConfirm ? "text" : "password"} value={resetData.confirm_password}
                        onChange={(e) => setResetData((prev) => ({ ...prev, confirm_password: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20 pr-10"
                        autoComplete="new-password" required />
                      <button type="button" onClick={() => setShowResetConfirm(!showResetConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showResetConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={saving}
                    className="px-6 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-500 transition disabled:opacity-60 flex items-center gap-2">
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Reset Password
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
          <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.current_password}
                  onChange={(e) => updatePassword("current_password", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20 pr-10"
                  autoComplete="current-password" required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={passwordData.new_password}
                  onChange={(e) => updatePassword("new_password", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20 pr-10"
                  autoComplete="new-password" required minLength={6}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={passwordData.confirm_password}
                  onChange={(e) => updatePassword("confirm_password", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20 pr-10"
                  autoComplete="new-password" required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-500 transition disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Change Password
                </>
              )}
            </button>
            <button type="button" onClick={enterForgotMode}
              className="text-xs font-semibold text-red hover:underline">
              Forgot your password? Reset with OTP
            </button>
          </form>
          )}
        </motion.div>
      )}

    </div>
  );
}
