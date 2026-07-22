import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Droplet } from "lucide-react";
import BloodMap from "../components/shared/BloodMap";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

export default function Camps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/map/camps")
      .then((res) => res.json())
      .then((data) => setCamps(data))
      .catch(() => setCamps([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <motion.div className="mb-8 md:mb-10" {...fadeUp}>
        <span className="inline-flex items-center gap-2 text-red font-bold text-sm uppercase tracking-wider bg-red/10 px-4 py-1.5 rounded-full mb-4">
          <Droplet size={16} /> Get Involved
        </span>
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3">
          Upcoming Blood Donation Camps
        </h1>
        <p className="text-slate-500 max-w-2xl text-sm md:text-base">
          Find a blood donation camp near you. No appointment needed - just show up with a valid ID.
        </p>
      </motion.div>

      <motion.div className="mb-8 md:mb-10" {...fadeUp}>
        <BloodMap showCamps={true} showBank={false} height="360px" />
      </motion.div>

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
          <p className="text-sm font-semibold text-slate-800">No upcoming camps found</p>
          <p className="text-xs text-slate-500 mt-1">Check back soon for new camp listings.</p>
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
              className="bg-white rounded-2xl p-5 md:p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center">
                  <Droplet size={18} className="text-red" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900">{camp.title}</h3>
              </div>
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
                    {camp.venue}
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
