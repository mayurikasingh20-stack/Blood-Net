import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Droplet, AlertCircle } from "lucide-react";
import api from "../services/api";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

export default function Camps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/camps/")
      .then((res) => setCamps(res.data?.camps || []))
      .catch(() => setError("Could not load camps."))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  function getStatus(date) {
    if (date < today) return "Completed";
    if (date === today) return "Today";
    return "Upcoming";
  }

  function getStatusColor(date) {
    if (date < today) return "bg-green-50 text-green-600";
    if (date === today) return "bg-blue-50 text-blue-600";
    return "bg-amber-50 text-amber-700";
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-red mb-1 block">Camps</span>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Blood Donation Camps</h1>
        <p className="text-sm text-slate-500 mt-1">View all blood donation camps.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-slate-500">Loading camps...</div>
        </div>
      )}

      {!loading && camps.length === 0 && (
        <motion.div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CalendarDays size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-800">No camps found</p>
          <p className="text-xs text-slate-500 mt-1">No blood donation camps are available right now.</p>
        </motion.div>
      )}

      {!loading && camps.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
          variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
        >
          {camps.map((camp, idx) => (
            <motion.div
              key={camp.id || idx}
              variants={fadeUp}
              className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center flex-shrink-0">
                    <Droplet size={18} className="text-red" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 truncate">{camp.title}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${getStatusColor(camp.date)}`}>
                  {getStatus(camp.date)}
                </span>
              </div>
              {camp.description && (
                <p className="text-sm text-slate-600 mb-3 ml-[52px]">{camp.description}</p>
              )}
              <div className="space-y-2 text-sm text-slate-600 ml-[52px]">
                {camp.date && (
                  <p className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-slate-400" />
                    {camp.date}{camp.time ? (" - " + camp.time) : ""}
                  </p>
                )}
                {camp.venue && (
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    {camp.venue}{camp.address ? ", " + camp.address : ""}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
