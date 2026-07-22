import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, User, Lock, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/forms/Input";
import PasswordInput from "../components/forms/PasswordInput";
import Select from "../components/forms/Select";
import TextArea from "../components/forms/TextArea";
import Checkbox from "../components/forms/Checkbox";
import ErrorMessage from "../components/feedback/ErrorMessage";
import SuccessMessage from "../components/feedback/SuccessMessage";
import { getAuthErrorMessage, registerUser } from "../services/authService";
import { BLOOD_GROUPS } from "../utils/constants";

function calculateAge(dobString) {
  if (!dobString) return null;
  const parts = dobString.split("-");
  if (parts.length !== 3) return null;
  const birth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const roles = [
  { value: "donor", label: "Donor" },
  { value: "patient", label: "Patient" },
  { value: "bloodbank", label: "Blood Bank" },
];

const genders = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const steps = [
  { title: "Account", icon: User },
  { title: "Security", icon: Lock },
  { title: "Confirm", icon: ShieldCheck },
];

export default function Register() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "",
    role: searchParams.get("role") || "donor",
    gender: "", dob: "", city: "", address: "",
    bloodGroup: "", weight: "", lastDonationDate: "",
    hasChronicCondition: false, onMedication: false, available: true,
    acceptedTerms: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const donor = formData.role === "donor";

  const update = (name, value) => setFormData((current) => ({ ...current, [name]: value }));

  useEffect(() => {
    if (formData.role === "bloodbank") {
      navigate("/bloodbank-register", { replace: true });
    }
  }, [formData.role, navigate]);

  function validateStep(stepNum) {
    if (stepNum === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim())
        return "Please fill in all required fields.";
      if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email)) return "Please enter a valid email address.";
      if (!/^[+\d][\d\s-]{7,}$/.test(formData.phone)) return "Please enter a valid phone number.";
    }
    if (stepNum === 2) {
      if (!formData.password || !formData.confirmPassword || !formData.gender || !formData.dob || !formData.city.trim())
        return "Please fill in all required fields.";
      if (formData.password.length < 6) return "Password must be at least 6 characters.";
      if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
      if (formData.dob) {
        const dobDate = new Date(formData.dob + "T00:00:00");
        if (dobDate > new Date()) return "Date of birth cannot be in the future.";
        if (donor) {
          const age = calculateAge(formData.dob);
          if (age < 18) return "You must be at least 18 years old to register as a blood donor.";
          if (age > 65) return "People above 65 years of age are not eligible for blood donation. Please consult a medical professional if you have any questions.";
        }
      }
    }
    if (stepNum === 3) {
      if (donor && (!formData.bloodGroup || !formData.weight || Number(formData.weight) <= 0))
        return "Donors must provide a blood group and valid weight.";
      if (!formData.acceptedTerms) return "Please accept the terms before registering.";
    }
    return "";
  }

  function nextStep() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
  }

  function prevStep() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const validationError = validateStep(3);
    if (validationError) { setError(validationError); return; }
    if (donor && formData.dob) {
      const age = calculateAge(formData.dob);
      if (age < 18) { setError("You must be at least 18 years old to register as a blood donor."); return; }
      if (age > 65) { setError("People above 65 years of age are not eligible for blood donation. Please consult a medical professional if you have any questions."); return; }
    }
    setLoading(true);
    try {
      await registerUser(formData);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate(`/login?role=${formData.role}`, { replace: true }), 1500);
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Card padding="lg" className="shadow-xl border-red/10">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-red/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Droplets size={28} className="text-red" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Create an account</h1>
            <p className="text-sm text-slate-500 mt-1">Join Blood Net and help save lives</p>
          </div>

          {/* Role Selector at top */}
          <div className="mb-6">
            <Select label="Account type" value={formData.role}
              onChange={(e) => { update("role", e.target.value); setError(""); }}
              options={roles} required />
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => {
              const num = i + 1;
              const active = num === step;
              const done = num < step;
              return (
                <div key={s.title} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    active ? "bg-red text-white shadow-lg shadow-red/20" :
                    done ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    <s.icon size={14} />
                    {s.title}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${num < step ? "bg-emerald-400" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User size={18} className="text-red" /> Personal Information
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="First name" name="firstName" value={formData.firstName}
                    onChange={(e) => update("firstName", e.target.value)} required />
                  <Input label="Last name" name="lastName" value={formData.lastName}
                    onChange={(e) => update("lastName", e.target.value)} required />
                  <Input label="Email address" name="email" type="email" value={formData.email}
                    onChange={(e) => update("email", e.target.value)} placeholder="name@example.com" autoComplete="off" hint="Optional for donors & patients" />
                  <Input label="Phone number" name="phone" type="tel" value={formData.phone}
                    onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" required />
                  <Select label="Gender" value={formData.gender}
                    onChange={(e) => update("gender", e.target.value)} options={genders} required />
                </div>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <div className="flex justify-end pt-2">
                  <button type="button" onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red/20">
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Security & Location */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lock size={18} className="text-red" /> Security & Location
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <PasswordInput label="Password" name="password" value={formData.password}
                    onChange={(e) => update("password", e.target.value)} autoComplete="new-password" required />
                  <PasswordInput label="Confirm password" name="confirmPassword" value={formData.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)} autoComplete="new-password" required />
                  <Input label="Date of birth" name="dob" type="date" value={formData.dob}
                    onChange={(e) => update("dob", e.target.value)} required />
                  <Input label="City" name="city" value={formData.city}
                    onChange={(e) => update("city", e.target.value)} placeholder="e.g. Jodhpur" required />
                </div>
                <TextArea label="Address" name="address" value={formData.address}
                  onChange={(e) => update("address", e.target.value)} hint="Optional" />
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <div className="flex justify-between pt-2">
                  <button type="button" onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="button" onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red/20">
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Donor Details & Confirm */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-red" /> Final Details
                </h2>

                {donor && (
                  <div className="rounded-xl border border-red/10 bg-red/5 p-4 space-y-4">
                    <p className="text-sm font-bold text-red">Donor Information</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Select label="Blood group" value={formData.bloodGroup}
                        onChange={(e) => update("bloodGroup", e.target.value)}
                        options={BLOOD_GROUPS.map((v) => ({ value: v, label: v }))} required />
                      <Input label="Weight (kg)" name="weight" type="number" min="1" value={formData.weight}
                        onChange={(e) => update("weight", e.target.value)} required />
                      <Input label="Last donation date" name="lastDonationDate" type="date" value={formData.lastDonationDate}
                        onChange={(e) => update("lastDonationDate", e.target.value)} hint="Optional" />
                    </div>
                    <div className="space-y-2">
                      <Checkbox label="I have a chronic medical condition" checked={formData.hasChronicCondition}
                        onChange={(e) => update("hasChronicCondition", e.target.checked)} />
                      <Checkbox label="I am currently on medication" checked={formData.onMedication}
                        onChange={(e) => update("onMedication", e.target.checked)} />
                      <Checkbox label="I am available to donate" checked={formData.available}
                        onChange={(e) => update("available", e.target.checked)} />
                    </div>
                  </div>
                )}

                <Checkbox label="I confirm that all information provided is accurate and I agree to the terms of service."
                  checked={formData.acceptedTerms}
                  onChange={(e) => update("acceptedTerms", e.target.checked)} />

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <div className="flex justify-between pt-2">
                  <button type="button" onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <Button type="submit" className="flex-1 max-w-xs" loading={loading}>
                    {donor ? "Register as Donor" : "Create Account"}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-red hover:underline">Login</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
