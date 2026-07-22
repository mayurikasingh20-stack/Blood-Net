import { useState } from "react";
import { motion } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { BLOOD_GROUPS, URGENCY_LEVELS } from "../../utils/constants";

export default function RaiseRequestModal({ onClose, onSubmit, requesterName = "" }) {
  const [form, setForm] = useState({
    bloodGroup: "",
    unitsNeeded: "1",
    hospital: "",
    hospitalAddress: "",
    city: "",
    condition: "",
    urgency: "Moderate",
    requiredBefore: "",
    contactName: requesterName,
    contactPhone: "",
  });
  const [error, setError] = useState("");

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = () => {
    if (!form.bloodGroup || !form.unitsNeeded || !form.hospital || !form.city || !form.contactName) {
      setError("Please fill in blood group, units, hospital, city, and contact name.");
      return;
    }
    if (!form.requiredBefore) {
      setError("Please select the required-by date.");
      return;
    }
    const units = parseInt(form.unitsNeeded);
    if (isNaN(units) || units < 1) {
      setError("Units must be at least 1.");
      return;
    }
    onSubmit({
      ...form,
      unitsNeeded: units,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Raise a Blood Request</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Blood Group */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">
              Blood Group Needed <span className="text-red">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button key={bg} type="button"
                  onClick={() => update("bloodGroup", bg)}
                  className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    form.bloodGroup === bg ? "bg-red text-white border-red" : "border-slate-200 text-slate-700 hover:border-red/40"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Units + Urgency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Units Needed</label>
              <input type="number" min={1} value={form.unitsNeeded}
                onChange={(e) => update("unitsNeeded", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Urgency</label>
              <select value={form.urgency} onChange={(e) => update("urgency", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
              >
                {URGENCY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Required Before Date */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Required Before <span className="text-red">*</span></label>
            <input type="date" value={form.requiredBefore}
              onChange={(e) => update("requiredBefore", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
            />
          </div>

          {/* Hospital */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Hospital Name <span className="text-red">*</span></label>
            <input value={form.hospital} onChange={(e) => update("hospital", e.target.value)}
              placeholder="e.g. MDM Government Hospital"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
            />
          </div>

          {/* Hospital Address + City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Hospital Address</label>
              <input value={form.hospitalAddress} onChange={(e) => update("hospitalAddress", e.target.value)}
                placeholder="e.g. Basni, Jodhpur"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">City <span className="text-red">*</span></label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)}
                placeholder="e.g. Jodhpur"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
              />
            </div>
          </div>

          {/* Condition / Purpose */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Describe the Condition / Purpose</label>
            <textarea rows={3} value={form.condition} onChange={(e) => update("condition", e.target.value)}
              placeholder="Brief description - e.g. surgery, accident, ongoing treatment"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20 resize-none"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Contact Name <span className="text-red">*</span></label>
              <input value={form.contactName} onChange={(e) => update("contactName", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Contact Phone</label>
              <input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red bg-red/10 px-4 py-3 rounded-xl">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="w-1/3 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} className="w-2/3 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition">
            Submit Request
          </button>
        </div>
      </motion.div>
    </div>
  );
}
