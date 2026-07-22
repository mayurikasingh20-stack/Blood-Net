import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Phone, Droplets, Loader, Navigation } from "lucide-react";
import api from "../services/api";
import BloodMap from "../components/shared/BloodMap";
import { BLOOD_GROUPS } from "../utils/constants";

export default function MapPage() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchBg, setSearchBg] = useState("");

  useEffect(() => {
    loadDonors();
  }, []);

  async function loadDonors(bg) {
    setLoading(true);
    try {
      const url = bg ? `/donor/search?blood_group=${bg}` : "/donor/all";
      const res = await api.get(url);
      setDonors(res.data?.donors || []);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Explore Map</h1>
        <p className="text-sm text-slate-500 mt-1">Find nearby blood banks and donors in your area.</p>
      </div>

      <BloodMap showCamps={true} height="400px" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Droplets size={16} className="text-red" />
              Nearby Donors
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={() => { setSearchBg(""); loadDonors(); }} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${!searchBg ? "bg-red text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>All</button>
              {BLOOD_GROUPS.slice(0, 4).map((bg) => (
                <button key={bg} onClick={() => { setSearchBg(bg); loadDonors(bg); }} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${searchBg === bg ? "bg-red text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{bg}</button>
              ))}
            </div>
          </div>
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="flex justify-center py-8"><Loader className="animate-spin text-red" size={24} /></div>
            ) : donors.filter((d) => d.available !== false).length === 0 ? (
              <div className="text-center py-8">
                <MapPin size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No donors found{searchBg ? ` for ${searchBg}` : ""}.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {donors.filter((d) => d.available !== false).map((donor) => (
                  <div key={donor.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-red/20 transition">
                    <div className="w-10 h-10 rounded-full bg-red/10 flex items-center justify-center text-red font-bold text-sm flex-shrink-0">
                      {donor.first_name?.charAt(0)}{donor.last_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{donor.first_name} {donor.last_name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={10} /> {donor.city || "—"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-red">{donor.blood_group}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Available</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}