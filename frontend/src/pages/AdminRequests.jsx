import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertTriangle, Droplets, Search } from "lucide-react";
import api from "../services/api";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  matched: "bg-blue-50 text-blue-600",
  accepted: "bg-purple-50 text-purple-600",
  completed: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-slate-100 text-slate-500",
};

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/blood-requests");
      setRequests(res.data?.blood_requests || []);
    } catch {
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = requests.filter((r) =>
    (r.hospital || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.blood_group || "").includes(search.toUpperCase()) ||
    (r.city || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Blood Requests</h2>
          <p className="text-sm text-slate-500 mt-1">Track current status of all blood requests across the platform.</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:border-red hover:text-red transition">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
      </div>

      {error && <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl"><AlertTriangle size={16} />{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <Droplets size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Blood Group</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Hospital</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">City</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Units</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Fulfilled</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Severity</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-3"><span className="font-bold text-red">{r.blood_group}</span></td>
                  <td className="px-6 py-3 text-slate-600">{r.hospital}</td>
                  <td className="px-6 py-3 text-slate-500 hidden md:table-cell">{r.city}</td>
                  <td className="px-6 py-3 text-slate-500 hidden md:table-cell">{r.units}</td>
                  <td className="px-6 py-3 text-slate-600 hidden md:table-cell">{r.fulfilled_units || 0}</td>
                  <td className="px-6 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.urgency_level === "Critical" ? "bg-red/10 text-red" :
                      r.urgency_level === "High" ? "bg-amber-50 text-amber-700" :
                      r.urgency_level === "Moderate" ? "bg-blue-50 text-blue-600" :
                      "bg-slate-100 text-slate-500"
                    }`}>{r.urgency_level || "Moderate"}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[r.status] || "bg-slate-100 text-slate-500"}`}>
                      {r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500 hidden md:table-cell">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}