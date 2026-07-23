import { useState, useEffect, useCallback } from "react";
import { TrendingUp, RefreshCw, AlertTriangle, Search, X } from "lucide-react";
import api from "../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/donations");
      const all = res.data?.donations || [];
      setDonations(all.filter((d) => d.status === "verified"));
    } catch {
      setError("Failed to load donations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = donations.filter((d) =>
    (d.donor_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.blood_group || "").includes(search.toUpperCase()) ||
    (d.hospital || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.city || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Donation History</h2>
          <p className="text-sm text-slate-500 mt-1">Completed and fulfilled donations across the platform.</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:border-red hover:text-red transition">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by donor, blood group, hospital..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
      </div>

      {error && <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl"><AlertTriangle size={16} />{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <TrendingUp size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No fulfilled donations yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Donor</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Blood Group</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Hospital</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Units</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">Verified On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((d) => (
                <tr key={d.donation_id || d.id} className="hover:bg-slate-50/50 transition cursor-pointer" onClick={() => setSelected(d)}>
                  <td className="px-6 py-3"><span className="font-medium text-slate-800">{d.donor_name || "-"}</span></td>
                  <td className="px-6 py-3"><span className="font-bold text-red">{d.blood_group || "-"}</span></td>
                  <td className="px-6 py-3 text-slate-600 hidden md:table-cell">{d.hospital || "-"}</td>
                  <td className="px-6 py-3 text-slate-600 hidden md:table-cell">{d.donated_units || "-"}</td>
                  <td className="px-6 py-3 text-xs text-slate-400 hidden lg:table-cell">{formatDate(d.verified_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Donation Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Donor</span>
                <span className="font-semibold text-slate-800">{selected.donor_name || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Blood Group</span>
                <span className="font-bold text-red">{selected.blood_group || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Hospital</span>
                <span className="font-semibold text-slate-800">{selected.hospital || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">City</span>
                <span className="font-semibold text-slate-800">{selected.city || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Units Donated</span>
                <span className="font-semibold text-slate-800">{selected.donated_units || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Accepted At</span>
                <span className="text-slate-600">{formatDate(selected.accepted_at)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Verified At</span>
                <span className="text-slate-600">{formatDate(selected.verified_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}