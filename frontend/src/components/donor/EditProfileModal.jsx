import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

function EditProfileModal({ donor, onClose, onSave }) {
  const [form, setForm] = useState({ ...donor });
  const [newIllness, setNewIllness] = useState("");
  const [newMedication, setNewMedication] = useState({ name: "", dosage: "" });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const addIllness = () => {
    if (!newIllness.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    update("healthNotes", [...(form.healthNotes || []), { date: today, note: newIllness.trim() }]);
    setNewIllness("");
  };

  const addMedication = () => {
    if (!newMedication.name.trim()) return;
    update("medications", [...(form.medications || []), { ...newMedication }]);
    setNewMedication({ name: "", dosage: "" });
  };

  const removeMedication = (i) => {
    update("medications", form.medications.filter((_, idx) => idx !== i));
  };

  const handleSave = () => onSave(form);

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 px-4">
      <div className="bg-paper rounded-[22px] p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-serif text-xl font-semibold">Edit Profile</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Full Name</label>
            <input className="w-full px-4 py-2.5 rounded-xl border border-ink/15 focus:outline-none focus:ring-2 focus:ring-red-300" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Phone</label>
            <input className="w-full px-4 py-2.5 rounded-xl border border-ink/15 focus:outline-none focus:ring-2 focus:ring-red-300" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">City</label>
            <input className="w-full px-4 py-2.5 rounded-xl border border-ink/15 focus:outline-none focus:ring-2 focus:ring-red-300" value={form.city} onChange={(e) => update("city", e.target.value)} />
          </div>

          <div className="pt-3 border-t border-ink/10">
            <label className="text-sm font-medium block mb-2">Current Medications</label>
            {(form.medications || []).map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-ink/5 rounded-lg px-3 py-2 mb-2">
                <span className="text-sm">{m.name} {m.dosage && `— ${m.dosage}`}</span>
                <button onClick={() => removeMedication(i)}><Trash2 size={14} className="text-red-deep" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-lg border border-ink/15 text-sm"
                placeholder="Medication name"
                value={newMedication.name}
                onChange={(e) => setNewMedication((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                className="w-24 px-3 py-2 rounded-lg border border-ink/15 text-sm"
                placeholder="Dosage"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication((p) => ({ ...p, dosage: e.target.value }))}
              />
              <button onClick={addMedication} className="bg-ink text-white px-3 rounded-lg"><Plus size={16} /></button>
            </div>
          </div>

          <div className="pt-3 border-t border-ink/10">
            <label className="text-sm font-medium block mb-1">Report a Health Update</label>
            <p className="text-xs text-ink-soft mb-2">Recent illness, injury, or anything affecting your eligibility.</p>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-lg border border-ink/15 text-sm"
                value={newIllness}
                onChange={(e) => setNewIllness(e.target.value)}
                placeholder="e.g. Mild fever, fully recovered"
              />
              <button onClick={addIllness} className="bg-ink text-white px-3 rounded-lg"><Plus size={16} /></button>
            </div>
            {(form.healthNotes || []).length > 0 && (
              <div className="mt-2 space-y-1">
                {form.healthNotes.map((n, i) => (
                  <p key={i} className="text-xs text-ink-soft">{n.date} — {n.note}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="w-1/3 border border-ink/15 font-semibold py-3 rounded-full hover:bg-ink/5 transition">Cancel</button>
          <button onClick={handleSave} className="w-2/3 bg-red-deep text-white font-semibold py-3 rounded-full hover:bg-red transition">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;