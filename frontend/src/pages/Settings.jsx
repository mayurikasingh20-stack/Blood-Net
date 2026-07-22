import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import useAuth from "../context/useAuth";
import api from "../services/api";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function Settings({ role = "donor" }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    city: "",
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
        });
      } catch {
        if (user) {
          setProfile({
            first_name: user?.name?.split(" ")[0] || "",
            last_name: user?.name?.split(" ").slice(1).join(" ") || "",
            email: user?.email || "",
            phone: user?.phone || "",
            city: user?.city || "",
          });
        }
      }
    })();
  }, []);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: true,
    emergency_alerts: true,
    donation_reminders: true,
    marketing_emails: false,
  });

  function updateProfile(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function updatePassword(field, value) {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleNotification(key) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
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

  async function handleSaveNotifications() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      setSuccess("Preferences saved locally.");
    } catch {
      setError("Could not save preferences.");
    } finally {
      setSaving(false);
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
        <div className="flex items-center gap-2 text-sm text-red bg-red-50 px-4 py-3 rounded-xl border border-red-200">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Tabs */}
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

      {/* Profile Tab */}
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
                  onChange={(e) => updateProfile("phone", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
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
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-4 py-3 rounded-xl">
              <Shield size={14} />
              Your data is encrypted and never shared without your consent.
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2"
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
        </motion.div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <motion.div className="bg-white rounded-2xl p-4 md:p-8 border border-slate-100 shadow-sm" {...fadeUp}>
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
              className="px-6 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2"
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
          </form>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <motion.div className="bg-white rounded-2xl p-4 md:p-8 border border-slate-100 shadow-sm" {...fadeUp}>
          <div className="space-y-4">
            {[
              { key: "email_notifications", label: "Email Notifications", desc: "Receive updates via email" },
              { key: "sms_notifications", label: "SMS Notifications", desc: "Receive updates via text message" },
              { key: "emergency_alerts", label: "Emergency Alerts", desc: "Get notified about urgent blood needs in your area" },
              { key: "donation_reminders", label: "Donation Reminders", desc: "Reminders when you are eligible to donate again" },
              { key: "marketing_emails", label: "Marketing Emails", desc: "Updates about camps, events, and news" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleNotification(item.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    notifications[item.key] ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      notifications[item.key] ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleSaveNotifications}
            disabled={saving}
            className="mt-6 px-6 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Preferences
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
