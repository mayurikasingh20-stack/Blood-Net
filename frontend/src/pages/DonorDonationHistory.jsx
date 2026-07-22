import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, Search, CheckCircle, Clock, XCircle, Loader } from "lucide-react";
import { getMyDonations } from "../services/dashboardService";

const statusStyles = {
  verified: "bg-emerald-50 text-emerald-600 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-blue-50 text-blue-600 border-blue-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function DonorDonationHistory() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyDonations();
        setDonations(data?.donations || []);
      } catch {
        setError("Failed to load donation history.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = donations.filter((d) =>
    !search || d.blood_group?.toLowerCase().includes(search.toLowerCase()) ||
    d.hospital?.toLowerCase().includes(search.toLowerCase()) ||
    d.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader className="animate-spin text-red" size={32} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Donation History</h1>
          <p className="text-sm text-slate-500 mt-1">{donations.length} donation(s) on record</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by blood group, hospital..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red bg-red/10 px-4 py-3 rounded-xl flex items-center gap-2">
          <XCircle size={16} /> {error}
        </div>
      )}

      <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Droplets size={22} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">{donations.length === 0 ? "No donations yet" : "No matching donations"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Blood Group", "Hospital", "City", "Units", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => (
                  <tr key={d.donation_id || d.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">{d.blood_group}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.hospital || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{d.city || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{d.donated_units || d.units || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusStyles[d.status] || statusStyles.pending}`}>
                        {d.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Donations", value: donations.length, icon: Droplets, color: "text-red", bg: "bg-red/10" },
          { label: "Verified", value: donations.filter((d) => d.status === "verified").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending", value: donations.filter((d) => d.status === "pending").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Cancelled", value: donations.filter((d) => d.status === "cancelled").length, icon: XCircle, color: "text-slate-500", bg: "bg-slate-100" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.bg}`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-lg font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
