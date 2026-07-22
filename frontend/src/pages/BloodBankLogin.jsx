import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Loader, Shield, XCircle, Clock } from "lucide-react";
import useAuth from "../context/useAuth";
import { getAuthErrorMessage, loginUser } from "../services/authService";
import { dashboardPathForRole } from "../utils/roleHelpers";

export default function BloodBankLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setPendingStatus(null);

    if (!email.trim() || !password) {
      setError("Please enter your email address and password.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const authData = await loginUser({ identifier: email, password, role: "bloodbank" });
      login(authData, rememberMe);
      setSuccess("Login successful. Redirecting to dashboard...");
      setTimeout(() => navigate(dashboardPathForRole(authData.user.role), { replace: true }), 500);
    } catch (err) {
      const msg = getAuthErrorMessage(err);
      setError(msg);
      if (msg.toLowerCase().includes("pending")) {
        setPendingStatus("pending");
      } else if (msg.toLowerCase().includes("rejected")) {
        setPendingStatus("rejected");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building2 size={28} className="text-red" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Blood Bank Login</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your blood bank dashboard</p>
          </div>

          {pendingStatus === "pending" && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200 flex items-start gap-2">
              <Clock size={16} className="mt-0.5 shrink-0" />
              <span>Your registration is pending admin approval. You will be notified once your account is verified.</span>
            </div>
          )}

          {pendingStatus === "rejected" && (
            <div className="mb-4 text-sm text-red bg-red/10 px-4 py-3 rounded-xl border border-red/20 flex items-start gap-2">
              <XCircle size={16} className="mt-0.5 shrink-0" />
              <span>Your registration has been rejected. Please contact support for more information.</span>
            </div>
          )}

          {error && !pendingStatus && (
            <div className="mb-4 text-sm text-red bg-red/10 px-4 py-3 rounded-xl border border-red/20">{error}</div>
          )}
          {success && (
            <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bloodbank.org"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-red focus:ring-red" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-60">
              {loading ? <Loader size={16} className="animate-spin" /> : <Building2 size={16} />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-500">
              Don't have a blood bank account?{" "}
              <Link to="/bloodbank-register" className="font-semibold text-red hover:underline">Register here</Link>
            </p>
            <p className="text-sm text-slate-500">
              <Link to="/login" className="text-slate-400 hover:text-red transition text-xs">Other account types →</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
