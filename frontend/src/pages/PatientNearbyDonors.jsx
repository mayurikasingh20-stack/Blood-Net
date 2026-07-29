import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Phone, Droplets, Loader, UserCheck, X } from "lucide-react";
import api from "../services/api";
import { BLOOD_GROUPS } from "../utils/constants";

export default function PatientNearbyDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchBg, setSearchBg] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (searchBg) params.blood_group = searchBg;
      if (searchName.trim()) params.name = searchName.trim();
      if (searchCity.trim()) params.city = searchCity.trim();
      const hasFilters = Object.keys(params).length > 0;
      const res = hasFilters
        ? await api.get("/donor/search", { params })
        : await api.get("/donor/all");
      setDonors(res.data?.donors || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load donors");
    } finally {
      setLoading(false);
    }
  }, [searchBg, searchName, searchCity]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  function clearFilters() {
    setSearchBg("");
    setSearchName("");
    setSearchCity("");
  }

  const hasFilters = searchBg || searchName.trim() || searchCity.trim();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Nearby Donors</h2>
        <p className="text-sm text-slate-500 mt-1">Find and connect with blood donors in your area.</p>
      </div>

      {/* Search Fields */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
          />
        </div>
        <div className="relative flex-1 min-w-[160px]">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search by city..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
          />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red transition">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Blood Group Filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSearchBg("")} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${!searchBg ? "bg-red text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>All</button>
        {BLOOD_GROUPS.map((bg) => (
          <button key={bg} onClick={() => setSearchBg(searchBg === bg ? "" : bg)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${searchBg === bg ? "bg-red text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{bg}</button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-12"><Loader className="animate-spin text-red" size={32} /></div>}
      {error && <div className="text-sm text-red bg-red/10 px-4 py-3 rounded-xl">{error}</div>}

      {!loading && donors.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <UserCheck size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No donors found.</p>
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
            {donor.phone && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                <Phone size={12} /> {donor.phone}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
