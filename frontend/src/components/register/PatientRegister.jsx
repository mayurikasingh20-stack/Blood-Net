import { useState } from "react";
import axios from "axios";
import StepProgress from "./StepProgress";

import { BLOOD_GROUPS } from "../../utils/constants";

const labels = ["Basic Profile", "Medical Details", "Verification Proof", "Verify Phone"];

function PatientRegister() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
    gender: "", dob: "",
    bloodGroupNeeded: "", hospitalName: "", city: "", conditionDescription: "", urgencyLevel: "Moderate",
    relationToPatient: "self", additionalNotes: "", agreeTerms: false,
  });
  const [doctorNoteFile, setDoctorNoteFile] = useState(null);

  const [otpSent, setOtpSent] = useState(false);
  const [mockOtp, setMockOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const update = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const isStep1Valid = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) return false;    if (formData.password.length < 6) return false;
    if (formData.password !== formData.confirmPassword) return false;
    if (!formData.gender || !formData.dob) return false;
    return true;
  };
  const isStep2Valid = () => {
    if (!formData.bloodGroupNeeded || !formData.hospitalName || !formData.city) return false;
    if (!formData.conditionDescription) return false;
    return true;
  };
  const isStep3Valid = () => formData.agreeTerms;

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
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1),
        dob: formData.dob,
        city: formData.city,
        role: "patient",
      };

      await axios.post("http://127.0.0.1:5000/api/auth/register", payload);
      alert("Patient registered successfully! Please login.");
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full mt-1 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-300";
  const labelClass = "text-sm font-medium text-stone-700 block";
  const nextBtnClass = (valid, wide = "w-full") =>
    `${wide} mt-4 font-semibold py-3 rounded-full transition-all ${
      valid
        ? "bg-rose-700 text-white hover:bg-rose-800 hover:shadow-lg hover:scale-[1.02]"
        : "bg-stone-300 text-stone-500 cursor-not-allowed"
    }`;

  return (
    <div className="bg-white rounded-2xl p-8 border border-stone-200 w-full max-w-lg">
      <StepProgress step={step} totalSteps={4} labels={labels} />

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
            <input type="email" className={inputClass} value={formData.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input className={inputClass} value={formData.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password</label>
              <input type="password" className={inputClass} value={formData.password} onChange={(e) => update("password", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input type="password" className={inputClass} value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
            </div>
          </div>
          {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
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
            <label className={labelClass}>Blood Group Needed</label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => update("bloodGroupNeeded", bg)}
                  className={`py-2 rounded-lg border font-semibold transition-all ${
                    formData.bloodGroupNeeded === bg ? "bg-rose-700 text-white border-rose-700" : "border-stone-200 hover:border-rose-300"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Hospital Name</label>
            <input className={inputClass} value={formData.hospitalName} onChange={(e) => update("hospitalName", e.target.value)} placeholder="City General Hospital" />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input className={inputClass} value={formData.city} onChange={(e) => update("city", e.target.value)} placeholder="Jodhpur" />
          </div>
          <div>
            <label className={labelClass}>Describe the Medical Condition</label>
            <textarea rows={3} className={inputClass} value={formData.conditionDescription} onChange={(e) => update("conditionDescription", e.target.value)} placeholder="Brief description of diagnosis / condition" />
          </div>
          <div>
            <label className={labelClass}>Urgency Level</label>
            <select className={inputClass} value={formData.urgencyLevel} onChange={(e) => update("urgencyLevel", e.target.value)}>
              <option value="Critical">Critical (Immediate)</option>
              <option value="High">High (2-4 hours)</option>
              <option value="Moderate">Moderate (Stable)</option>
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={back} className="w-1/3 border border-stone-300 text-stone-700 font-semibold py-3 rounded-full hover:bg-stone-50 transition">Back</button>
            <button onClick={next} className={nextBtnClass(isStep2Valid(), "w-2/3")}>Next Step →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Relation to Patient</label>
            <select className={inputClass} value={formData.relationToPatient} onChange={(e) => update("relationToPatient", e.target.value)}>
              <option value="self">Self</option>
              <option value="family">Family Member</option>
              <option value="friend">Friend / Guardian</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Upload Doctor's Note / Medical Proof</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDoctorNoteFile(e.target.files[0])}
              className="w-full mt-1 text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-rose-50 file:text-rose-700 file:font-semibold hover:file:bg-rose-100"
            />
            <p className="text-xs text-stone-500 mt-1">This proves the request is medically genuine, not fraudulent.</p>
          </div>
          <div>
            <label className={labelClass}>Additional Notes (optional)</label>
            <textarea rows={2} className={inputClass} value={formData.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)} />
          </div>
          <label className="flex items-start gap-2 text-sm text-stone-700 mt-2">
            <input type="checkbox" className="mt-1" checked={formData.agreeTerms} onChange={(e) => update("agreeTerms", e.target.checked)} />
            I confirm this information is accurate and the medical proof provided is genuine.
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
            We need to verify your phone number <strong>{formData.phone}</strong> before creating your account.
          </p>

          <button onClick={sendOtp} className="w-full border border-rose-700 text-rose-700 font-semibold py-2.5 rounded-full hover:bg-rose-50 transition">
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
            className="w-full bg-rose-700 text-white font-semibold py-3 rounded-full hover:bg-rose-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {otpVerified ? "✓ Verified" : "Verify OTP"}
          </button>

          <div className="flex gap-3 mt-4">
            <button onClick={back} className="w-1/3 border border-stone-300 text-stone-700 font-semibold py-3 rounded-full hover:bg-stone-50 transition">Back</button>
            <button
              onClick={handleSubmit}
              disabled={!otpVerified || submitting}
              className="w-2/3 bg-rose-700 text-white font-semibold py-3 rounded-full hover:bg-rose-800 hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Complete Registration"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientRegister;
