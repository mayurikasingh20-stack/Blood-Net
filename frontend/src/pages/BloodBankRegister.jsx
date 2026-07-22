import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, CheckCircle, ArrowLeft, ArrowRight, Loader, Shield } from "lucide-react";
import api from "../services/api";
import { saveAuth } from "../utils/authStorage";

const genders = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

export default function BloodBankRegister() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "", gender: "", dob: "",
    city: "", address: "",
    facilityName: "", contactPerson: "",
    facilityAddress: "", operatingHours: "", website: "",
    available24x7: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const validateStep1 = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password || !form.gender || !form.dob || !form.city)
      return "Please complete all required fields.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email address.";
    if (!/^[+\d][\d\s-]{7,}$/.test(form.phone)) return "Invalid phone number.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  };

  const validateStep2 = () => {
    if (!form.facilityName || !form.contactPerson || !form.facilityAddress)
      return "Please complete all facility details.";
    return "";
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  const handlePrev = () => { setError(""); setStep(1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);

    try {
      const regPayload = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: "blood_bank",
        gender: form.gender,
        dob: form.dob,
        city: form.city.trim(),
      };
      if (form.address.trim()) regPayload.address = form.address.trim();

      const regRes = await api.post("/auth/register", regPayload);
      if (regRes.status !== 201) throw new Error(regRes.data?.message || "Registration failed");

      const loginRes = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "blood_bank",
      });
      const token = loginRes.data.access_token;

      saveAuth({ token, user: loginRes.data.user });

      const profilePayload = {
        facility_name: form.facilityName,
        contact_person: form.contactPerson,
        address: form.facilityAddress,
        available_24x7: form.available24x7,
      };
      if (form.operatingHours) profilePayload.operating_hours = form.operatingHours;
      if (form.website) profilePayload.website = form.website;

      await api.post("/blood-bank/register", profilePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Registration submitted! Your blood bank is pending admin approval. You'll be notified once approved.");
      setTimeout(() => navigate("/bloodbank-login"), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-red" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Register Your Blood Bank</h1>
          <p className="text-sm text-slate-500 mt-1">Join the Blood Net network</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step >= s ? "bg-red text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
              <span className={`text-xs font-semibold ${step >= s ? "text-red" : "text-slate-400"}`}>
                {s === 1 ? "Account" : "Facility"}
              </span>
              {s < 2 && <div className={`w-8 h-0.5 ${step > s ? "bg-red" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
          <Shield size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>Admin Approval Required:</strong> After registration, your blood bank must be verified by an admin before you can log in. You will receive a notification once approved.
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
          {error && (
            <div className="mb-4 text-sm text-red bg-red/10 px-4 py-3 rounded-xl border border-red/20">{error}</div>
          )}
          {success && (
            <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle size={16} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">First Name *</label>
                    <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Last Name *</label>
                    <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                      placeholder="admin@bloodbank.org"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Phone *</label>
                    <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Password *</label>
                    <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Confirm Password *</label>
                    <input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Gender *</label>
                    <select value={form.gender} onChange={(e) => update("gender", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20">
                      <option value="">Select</option>
                      {genders.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Date of Birth *</label>
                    <input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">City *</label>
                  <input value={form.city} onChange={(e) => update("city", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Address</label>
                  <textarea rows={2} value={form.address} onChange={(e) => update("address", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20 resize-none" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Facility Details</h3>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Facility Name *</label>
                  <input value={form.facilityName} onChange={(e) => update("facilityName", e.target.value)}
                    placeholder="e.g. City Central Blood Bank"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Contact Person Name *</label>
                  <input value={form.contactPerson} onChange={(e) => update("contactPerson", e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Facility Address *</label>
                  <textarea rows={2} value={form.facilityAddress} onChange={(e) => update("facilityAddress", e.target.value)}
                    placeholder="Full address"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Operating Hours</label>
                    <input value={form.operatingHours} onChange={(e) => update("operatingHours", e.target.value)}
                      placeholder="e.g. 9:00 AM - 6:00 PM"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">Website</label>
                    <input value={form.website} onChange={(e) => update("website", e.target.value)}
                      placeholder="https://"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.available24x7} onChange={(e) => update("available24x7", e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-red focus:ring-red" />
                  <span className="text-sm text-slate-700 font-medium">Available 24x7</span>
                </label>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step === 2 && (
                <button type="button" onClick={handlePrev}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {step === 1 ? (
                <button type="button" onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition">
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-60">
                  {loading ? <Loader size={16} className="animate-spin" /> : <Building2 size={16} />}
                  {loading ? "Registering..." : "Submit for Approval"}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link to="/bloodbank-login" className="font-semibold text-red hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
