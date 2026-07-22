import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Phone, Droplets, Loader, UserCheck } from "lucide-react";
import api from "../services/api";
import { BLOOD_GROUPS } from "../utils/constants";

export default function PatientNearbyDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchBg, setSearchBg] = useState("");

  useEffect(() => {
    if (searchBg) {
      searchDonors(searchBg);
    } else {
      loadAll();
    }
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const res = await api.get("/donor/all");
      setDonors(res.data?.donors || []);
    } catch {
      setError("Failed to load donors");
    } finally {
      setLoading(false);
    }
  }

  async function searchDonors(bg) {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/donor/search?blood_group=${bg}`);
      setDonors(res.data?.donors || []);
    } catch {
      setError("Failed to search donors");
    } finally {
      setLoading(false);
    }
  }

  function handleBgSearch(bg) {
    setSearchBg(bg);
    if (bg) searchDonors(bg);
    else loadAll();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Nearby Donors</h2>
        <p className="text-sm text-slate-500 mt-1">Find and connect with blood donors in your area.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => handleBgSearch("")} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${!searchBg ? "bg-red text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>All</button>
        {BLOOD_GROUPS.map((bg) => (
          <button key={bg} onClick={() => handleBgSearch(bg)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${searchBg === bg ? "bg-red text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{bg}</button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-12"><Loader className="animate-spin text-red" size={32} /></div>}
      {error && <div className="text-sm text-red bg-red/10 px-4 py-3 rounded-xl">{error}</div>}

      {!loading && donors.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <UserCheck size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No donors found{searchBg ? ` for ${searchBg}` : ""}.</p>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {donors.filter((d) => d.available !== false).map((donor) => (
          <motion.div key={donor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red/10 rounded-full flex items-center justify-center">
                  <Droplets size={18} className="text-red" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{donor.first_name} {donor.last_name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {donor.city || "Unknown"}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-red">{donor.blood_group}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{donor.weight ? `${donor.weight} kg` : ""}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${donor.available !== false ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                {donor.available !== false ? "Available" : "Unavailable"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}