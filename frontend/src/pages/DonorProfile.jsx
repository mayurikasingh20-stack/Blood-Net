import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Droplets, Weight, Calendar, MapPin, ToggleLeft, ToggleRight, Loader, Save } from "lucide-react";
import api from "../services/api";

export default function DonorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    weight: "",
    available: true,
    has_chronic_condition: false,
    on_medication: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/donor/profile");
        const data = res.data;
        setProfile(data);
        setForm({
          weight: data.donor?.weight || "",
          available: data.donor?.available !== false,
          has_chronic_condition: data.donor?.has_chronic_condition || false,
          on_medication: data.donor?.on_medication || false,
        });
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.put("/donor/profile", {
        weight: parseFloat(form.weight) || 0,
        available: form.available,
        has_chronic_condition: form.has_chronic_condition,
        on_medication: form.on_medication,
      });
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader className="animate-spin text-red" size={32} /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
        <p className="text-sm text-slate-500 mt-1">View and update your donor information.</p>
      </div>

      {profile?.user && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center">
              <User size={28} className="text-red" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{profile.user.first_name} {profile.user.last_name}</h3>
              <p className="text-sm text-slate-500">{profile.user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600"><MapPin size={16} className="text-slate-400" /> {profile.user.city}</div>
            <div className="flex items-center gap-2 text-slate-600"><Droplets size={16} className="text-red" /> {profile.donor?.blood_group}</div>
            <div className="flex items-center gap-2 text-slate-600"><Weight size={16} className="text-slate-400" /> {profile.donor?.weight} kg</div>
            <div className="flex items-center gap-2 text-slate-600"><Calendar size={16} className="text-slate-400" /> Last donation: {profile.donor?.last_donation_date || "Never"}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Donor Info</h3>
        {error && <div className="mb-4 text-sm text-red bg-red/10 px-4 py-3 rounded-xl">{error}</div>}
        {success && <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl">{success}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Weight (kg)</label>
            <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Available to donate</span>
            <button type="button" onClick={() => setForm((p) => ({ ...p, available: !p.available }))} className="text-red">
              {form.available ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-400" />}
            </button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.has_chronic_condition} onChange={(e) => setForm((p) => ({ ...p, has_chronic_condition: e.target.checked }))} className="rounded border-slate-300 text-red focus:ring-red" />
            <span className="text-sm text-slate-700">I have a chronic medical condition</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.on_medication} onChange={(e) => setForm((p) => ({ ...p, on_medication: e.target.checked }))} className="rounded border-slate-300 text-red focus:ring-red" />
            <span className="text-sm text-slate-700">I am currently on medication</span>
          </label>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-60">
            <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}