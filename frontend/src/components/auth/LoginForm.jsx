import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../../context/useAuth";
import { loginUser } from "../../services/authService";
import { dashboardPathForRole } from "../../utils/roleHelpers";

function LoginForm({ config, role }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const usesPhone = role === "donor" || role === "patient";
    const label = usesPhone ? "phone number" : "email";

    if (!identifier || !password) {
      setError(`Please enter both your ${label} and password.`);
      return;
    }

    setLoading(true);
    try {
      const authData = await loginUser({ identifier, password, role });
      login(authData);
      navigate(dashboardPathForRole(authData.user.role));
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          setError(usesPhone ? "Incorrect phone number or password. Please try again." : "Incorrect email or password. Please try again.");
        } else if (status === 404) {
          setError(usesPhone ? "This phone number isn't registered. Please sign up first." : "This email isn't registered. Please sign up first.");
        } else {
          setError(err.response.data?.message || err.handledMessage || "Login failed. Please try again.");
        }
      } else {
        setError(err.handledMessage || "Could not reach the server. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-stone-200 w-full max-w-md">
      <h2 className="text-xl font-bold text-stone-900">{config.title}</h2>
      <p className="text-sm text-stone-500 mt-1">{config.subtitle}</p>

      <label className="text-sm font-medium text-stone-700 mt-6 block">{config.idLabel}</label>
      <input
        type={usesPhone ? "tel" : "email"}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder={config.idPlaceholder}
        autoComplete="off"
        className={`w-full mt-1 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 ${config.ringClass}`}
      />

      <label className="text-sm font-medium text-stone-700 mt-4 block">Password</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className={`w-full mt-1 px-4 py-3 pr-10 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 ${config.ringClass}`}
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full mt-6 ${config.buttonClass} text-white font-semibold py-3 rounded-full 
           transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100`}
      >
        {loading ? "Signing in..." : config.buttonText}
      </button>
    </form>
  );
}

export default LoginForm;
