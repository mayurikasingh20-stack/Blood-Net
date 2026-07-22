import { useState, useEffect } from "react";
import useAuth from "../context/useAuth";
import api from "../services/api";
import { BLOOD_GROUPS } from "../utils/constants";

const urgencyLevels = [
  { value: "Critical", label: "Critical - Immediate need" },
  { value: "High", label: "High - Within 24 hours" },
  { value: "Moderate", label: "Moderate - Within 3 days" },
  { value: "Low", label: "Low - Within a week" },
];

export default function EmergencyRequest() {
  const { user } = useAuth();
  const isDonor = user?.role === "donor";
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    blood_group: "",
    units: 1,
    hospital: "",
    hospital_address: "",
    city: "",
    required_before: "",
    contact_name: "",
    contact_phone: "",
    urgency_level: "Moderate",
    purpose: "",
  });

  useEffect(() => {
    if (isDonor) {
      api.get("/blood-request/open")
        .then((res) => setRequests(res.data?.blood_requests || []))
        .catch(() => {});
    }
  }, [isDonor]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (!form.blood_group) return "Select a blood group";
    if (!form.hospital.trim()) return "Hospital name is required";
    if (!form.hospital_address.trim()) return "Hospital address is required";
    if (!form.city.trim()) return "City is required";
    if (!form.required_before) return "Required by date is required";
    if (!form.contact_name.trim()) return "Contact name is required";
    if (!form.contact_phone.trim()) return "Contact phone is required";
    if (form.units < 1) return "Units must be at least 1";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await api.post("/blood-request/create", form);
      setSuccess("Emergency request created successfully! Donors in your area will be notified.");
      setTimeout(() => {
        setStep(1);
        setForm({
          blood_group: "", units: 1, hospital: "", hospital_address: "",
          city: "", required_before: "", contact_name: "", contact_phone: "",
          urgency_level: "Moderate", purpose: "",
        });
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20";

  if (isDonor) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Emergency Blood Requests</h2>
          <p className="text-sm text-slate-500 mt-1">View and accept urgent blood requests in your area.</p>
        </div>
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
            <p className="text-slate-500">No emergency requests at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.filter((r) => r.status === "pending").map((req) => (
              <div key={req.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-red">{req.blood_group}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                    {req.urgency_level || "Urgent"}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{req.hospital} - {req.city}</p>
                <p className="text-xs text-slate-400 mt-1">{req.units} unit(s) needed</p>
                <button
                  onClick={async () => {
                    try {
                      await api.post(`/donations/accept/${req.id}`);
                      setRequests((prev) => prev.filter((r) => r.id !== req.id));
                    } catch (err) {
                      alert(err.response?.data?.message || "Failed to accept");
                    }
                  }}
                  className="mt-3 px-4 py-2 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition"
                >
                  Accept & Donate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Emergency Blood Request</h2>
        <p className="text-sm text-slate-500 mt-1">Create a high-priority blood request for urgent needs.</p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red bg-red/10 px-4 py-3 rounded-xl border border-red/20">{error}</div>
      )}
      {success && (
        <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">{success}</div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-red" : "bg-slate-200"}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Step 1: Blood Details</h3>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Blood Group *</label>
                <select value={form.blood_group} onChange={(e) => update("blood_group", e.target.value)} className={inputClass}>
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Units Needed *</label>
                <input type="number" min="1" value={form.units} onChange={(e) => update("units", parseInt(e.target.value) || 1)} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Urgency Level</label>
                <select value={form.urgency_level} onChange={(e) => update("urgency_level", e.target.value)} className={inputClass}>
                  {urgencyLevels.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Required By *</label>
                <input type="date" value={form.required_before} onChange={(e) => update("required_before", e.target.value)} className={inputClass} />
              </div>
              <button type="button" onClick={() => { setError(""); setStep(2); }} className="w-full py-3 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition">
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Step 2: Hospital Details</h3>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Hospital Name *</label>
                <input value={form.hospital} onChange={(e) => update("hospital", e.target.value)} placeholder="e.g. City Hospital" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Hospital Address *</label>
                <textarea rows={2} value={form.hospital_address} onChange={(e) => update("hospital_address", e.target.value)} placeholder="Full address" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">City *</label>
                <input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g. Mumbai" className={inputClass} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Back</button>
                <button type="button" onClick={() => { setError(""); setStep(3); }} className="flex-[2] py-3 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Step 3: Contact Info</h3>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Contact Person *</label>
                <input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="Full name" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Contact Phone *</label>
                <input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Purpose (Optional)</label>
                <textarea rows={2} value={form.purpose} onChange={(e) => update("purpose", e.target.value)} placeholder="e.g. Surgery, accident, etc." className={inputClass} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Back</button>
                <button type="submit" disabled={loading} className="flex-[2] py-3 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-60">
                  {loading ? "Submitting..." : "Submit Emergency Request"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}