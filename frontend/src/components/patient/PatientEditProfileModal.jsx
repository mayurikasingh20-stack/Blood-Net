import { useState } from "react";
import { X } from "lucide-react";

function PatientEditProfileModal({ patient, onClose, onSave }) {
  const [form, setForm] = useState({ ...patient });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 px-4">
      <div className="bg-paper rounded-[22px] p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-serif text-xl font-semibold">Edit Profile</h3>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>

        <form id="patient-edit-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Full Name</label>
            <input className="w-full px-4 py-2.5 rounded-xl border border-ink/15 focus:outline-none focus:ring-2 focus:ring-red-300" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Blood Group</label>
            <div className="w-full px-4 py-2.5 rounded-xl border border-ink/10 bg-ink/5 text-ink-soft font-mono font-semibold">
              {form.bloodGroup} <span className="text-xs font-sans font-normal">(locked)</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Phone</label>
            <input className="w-full px-4 py-2.5 rounded-xl border border-ink/15 focus:outline-none focus:ring-2 focus:ring-red-300" value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">City</label>
            <input className="w-full px-4 py-2.5 rounded-xl border border-ink/15 focus:outline-none focus:ring-2 focus:ring-red-300" value={form.city} onChange={(e) => update("city", e.target.value)} />
          </div>
        </form>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="w-1/3 border border-ink/15 font-semibold py-3 rounded-full hover:bg-ink/5 transition">Cancel</button>
          <button type="submit" form="patient-edit-form" className="w-2/3 bg-red-deep text-white font-semibold py-3 rounded-full hover:bg-red transition">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default PatientEditProfileModal;