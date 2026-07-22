import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import StepProgress from "./StepProgress";

import { BLOOD_GROUPS } from "../../utils/constants";

const labels = ["Basic Profile", "Health & Eligibility", "Preferences", "Verify Phone"];

function DonorRegister() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", countryCode: "+91", phone: "", password: "", confirmPassword: "",
    gender: "", dob: "",
    bloodGroup: "", weight: "", lastDonationDate: "",
    hasChronicCondition: false, onMedication: false,
    city: "", address: "", agreeTerms: false,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [mockOtp, setMockOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const update = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const passwordError = () => {
    if (!formData.password) return "";
    if (formData.password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(formData.password)) return "Password must include at least one uppercase letter.";
    if (!/[0-9]/.test(formData.password)) return "Password must include at least one number.";
    return "";
  };

  const isStep1Valid = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) return false;
    if (passwordError()) return false;
    if (formData.password !== formData.confirmPassword) return false;
    if (!formData.gender || !formData.dob) return false;
    return true;
  };
  const isStep2Valid = () => formData.bloodGroup && formData.weight;
  const isStep3Valid = () => formData.city && formData.address && formData.agreeTerms;

  const canGoNext = () => {
    if (step === 1) return isStep1Valid();
    if (step === 2) return isStep2Valid();
    if (step === 3) return isStep3Valid();
    return true;
  };

  const next = () => {
    if (!canGoNext()) {
      alert("Please fill in all required fields before continuing.");
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  // Live progress bar — fills as fields in the current step get filled in
  const getStepProgress = () => {
    if (step === 1) {
      const fields = [formData.firstName, formData.lastName, formData.email, formData.phone, formData.password, formData.confirmPassword, formData.gender, formData.dob];
      const filled = fields.filter((f) => f && f.length > 0).length;
      return ((step - 1) + filled / fields.length) / 4 * 100;
    }
    if (step === 2) {
      const fields = [formData.bloodGroup, formData.weight];
      const filled = fields.filter((f) => f && f.length > 0).length;
      return ((step - 1) + filled / fields.length) / 4 * 100;
    }
    if (step === 3) {
      const fields = [formData.city, formData.address, formData.agreeTerms ? "x" : ""];
      const filled = fields.filter((f) => f && f.length > 0).length;
      return ((step - 1) + filled / fields.length) / 4 * 100;
    }
    return (step - 1) / 4 * 100 + 25;
  };

  const sendOtp = () => {
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setMockOtp(generated);
    setOtpSent(true);
    alert("Demo OTP sent: " + generated);
  };
  const verifyOtp = () => {
    if (otpInput === mockOtp) setOtpVerified(true);
    else alert("Incorrect OTP. Please try again.");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.countryCode + formData.phone,
        password: formData.password,
        gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1),
        role: "donor",
        dob: formData.dob,
        blood_group: formData.bloodGroup,
        weight: formData.weight,
        last_donation_date: formData.lastDonationDate,
        has_chronic_condition: formData.hasChronicCondition,
        on_medication: formData.onMedication,
        city: formData.city,
        address: formData.address,
      };
      if (formData.email) payload.email = formData.email;
      await axios.post("http://127.0.0.1:5000/api/auth/register", payload);
      alert("Donor registered successfully! Please login.");
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full mt-1 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-300";
  const labelClass = "text-sm font-medium text-stone-700 block";
  const nextBtnClass = (valid, wide = "w-full") =>
    `${wide} mt-4 font-semibold py-3 rounded-full transition-all ${
      valid
        ? "bg-red-800 text-white hover:bg-red-900 hover:shadow-lg hover:scale-[1.02]"
        : "bg-stone-300 text-stone-500 cursor-not-allowed"
    }`;

  return (
    <div className="bg-white rounded-2xl p-8 border border-stone-200 w-full max-w-lg">
      <StepProgress step={step} totalSteps={4} labels={labels} percent={getStepProgress()} />

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input className={inputClass} value={formData.firstName} onChange={(e) => update("firstName", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input className={inputClass} value={formData.lastName} onChange={(e) => update("lastName", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" className={inputClass} value={formData.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" autoComplete="off" />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <div className="flex gap-2 mt-1">
              <select
                className="px-3 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                value={formData.countryCode}
                onChange={(e) => update("countryCode", e.target.value)}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+971">🇦🇪 +971</option>
              </select>
              <input
                className={inputClass + " mt-0"}
                value={formData.phone}
                onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                placeholder="98765 43210"
                maxLength={10}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative mt-1">
                <input type={showPassword ? "text" : "password"} className={inputClass + " pr-10"} value={formData.password} onChange={(e) => update("password", e.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative mt-1">
                <input type={showConfirmPassword ? "text" : "password"} className={inputClass + " pr-10"} value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          {passwordError() && <p className="text-xs text-red-600">{passwordError()}</p>}
          {!passwordError() && formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-xs text-red-600">Passwords do not match.</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Gender</label>
              <select className={inputClass} value={formData.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" className={inputClass} value={formData.dob} onChange={(e) => update("dob", e.target.value)} />
            </div>
          </div>
          <button onClick={next} className={nextBtnClass(isStep1Valid())}>Next Step →</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Blood Group (if known)</label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => update("bloodGroup", bg)}
                  className={`py-2 rounded-lg border font-semibold transition-all ${
                    formData.bloodGroup === bg ? "bg-red-800 text-white border-red-800" : "border-stone-200 hover:border-red-300"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Weight (kg)</label>
            <input type="number" className={inputClass} value={formData.weight} onChange={(e) => update("weight", e.target.value)} placeholder="e.g. 65" />
          </div>
          <div>
            <label className={labelClass}>Last Donation Date (if any)</label>
            <input type="date" className={inputClass} value={formData.lastDonationDate} onChange={(e) => update("lastDonationDate", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={formData.hasChronicCondition} onChange={(e) => update("hasChronicCondition", e.target.checked)} />
            I have a chronic medical condition
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={formData.onMedication} onChange={(e) => update("onMedication", e.target.checked)} />
            I'm currently on medication
          </label>
          <div className="flex gap-3 mt-4">
            <button onClick={back} className="w-1/3 border border-stone-300 text-stone-700 font-semibold py-3 rounded-full hover:bg-stone-50 transition">Back</button>
            <button onClick={next} className={nextBtnClass(isStep2Valid(), "w-2/3")}>Next Step →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>City</label>
            <input className={inputClass} value={formData.city} onChange={(e) => update("city", e.target.value)} placeholder="Jodhpur" />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input className={inputClass} value={formData.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, Area" />
          </div>
          <label className="flex items-start gap-2 text-sm text-stone-700 mt-2">
            <input type="checkbox" className="mt-1" checked={formData.agreeTerms} onChange={(e) => update("agreeTerms", e.target.checked)} />
            I confirm the information provided is accurate and I agree to the terms of service.
          </label>
          <div className="flex gap-3 mt-4">
            <button onClick={back} className="w-1/3 border border-stone-300 text-stone-700 font-semibold py-3 rounded-full hover:bg-stone-50 transition">Back</button>
            <button onClick={next} className={nextBtnClass(isStep3Valid(), "w-2/3")}>Next Step →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            We need to verify your phone number <strong>{formData.countryCode}{formData.phone}</strong> before creating your account.
          </p>

          <button onClick={sendOtp} className="w-full border border-red-800 text-red-800 font-semibold py-2.5 rounded-full hover:bg-red-50 transition">
            {otpSent ? "Resend OTP" : "Send OTP"}
          </button>

          <div>
            <label className={labelClass}>Enter OTP</label>
            <input
              className={inputClass}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="4-digit code"
              maxLength={4}
              disabled={otpVerified}
            />
          </div>

          <button
            onClick={verifyOtp}
            disabled={!otpSent || otpVerified}
            className="w-full bg-red-800 text-white font-semibold py-3 rounded-full hover:bg-red-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {otpVerified ? "✓ Verified" : "Verify OTP"}
          </button>

          <div className="flex gap-3 mt-4">
            <button onClick={back} className="w-1/3 border border-stone-300 text-stone-700 font-semibold py-3 rounded-full hover:bg-stone-50 transition">Back</button>
            <button
              onClick={handleSubmit}
              disabled={!otpVerified || submitting}
              className="w-2/3 bg-red-800 text-white font-semibold py-3 rounded-full hover:bg-red-900 hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Complete Registration"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorRegister;
