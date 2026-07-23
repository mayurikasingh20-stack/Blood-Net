import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, Eye, EyeOff, Mail, Phone } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/forms/Input";
import ErrorMessage from "../components/feedback/ErrorMessage";
import SuccessMessage from "../components/feedback/SuccessMessage";
import useAuth from "../context/useAuth";
import { getAuthErrorMessage, loginUser } from "../services/authService";
import { dashboardPathForRole } from "../utils/roleHelpers";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isEmail = identifier.includes("@");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!identifier.trim() || !password) {
      setError("Please enter your email or phone number and password.");
      return;
    }

    setLoading(true);
    try {
      const authData = await loginUser({ identifier, password });
      login(authData, true);
      setSuccess("Sign in successful. Redirecting you now...");
      window.setTimeout(() => navigate(dashboardPathForRole(authData.user.role), { replace: true }), 500);
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card padding="lg" className="shadow-xl border-red/10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-red rounded-xl flex items-center justify-center">
              <Droplets size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-wide">BLOOD NET</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-2">
            Welcome Back
          </h1>

          {/* Description */}
          <p className="text-sm text-slate-500 text-center mb-8">
            Sign in with your registered email address or phone number.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label="EMAIL OR PHONE NUMBER"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or +91 98765 43210"
                autoComplete="off" required
              />
              <div className="absolute right-3 top-9 text-slate-400">
                {isEmail ? <Mail size={16} /> : <Phone size={16} />}
              </div>
            </div>

            <div>
              <label className="block" htmlFor="password">
                <span className="mb-1.5 block text-sm font-semibold text-ink">PASSWORD <span className="text-red">*</span></span>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="new-password" required
                    className="w-full rounded-lg border border-ink/20 bg-paper px-3 py-2.5 text-sm transition placeholder:text-ink-soft/60 hover:border-ink/40 focus:border-red focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            </div>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/register" className="font-semibold text-red hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
