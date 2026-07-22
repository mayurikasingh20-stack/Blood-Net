import { useState, useEffect, useCallback } from "react";
import { TrendingUp, RefreshCw, AlertTriangle, Search, CheckCircle, XCircle } from "lucide-react";
import api from "../services/api";

const statusStyles = {
  verified: "bg-emerald-50 text-emerald-600",
  accepted: "bg-blue-50 text-blue-600",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red",
  cancelled: "bg-slate-100 text-slate-500",
};

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/donations");
      setDonations(res.data?.donations || []);
    } catch {
      setError("Failed to load donations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleVerify(id) {
    const units = prompt("Enter donated units:");
    if (!units || isNaN(units) || parseInt(units) <= 0) return alert("Enter a valid number");
    try {
      await api.patch(`/admin/donations/${id}/verify`, { donated_units: parseInt(units) });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to verify");
    }
  }

  async function handleReject(id) {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      await api.patch(`/admin/donations/${id}/reject`, { rejection_reason: reason });
      fetchAll();
    } catch { alert("Failed to reject"); }
  }

  const filtered = donations.filter((d) =>
    (d.blood_group || "").includes(search.toUpperCase()) ||
    (d.hospital || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.city || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Donations</h2>
          <p className="text-sm text-slate-500 mt-1">Verify and manage blood donations across the platform.</p>
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
          <TrendingUp size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No donations yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Blood Group</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Hospital</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Units</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((d) => (
                <tr key={d.donation_id || d.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-3"><span className="font-bold text-red">{d.blood_group || "-"}</span></td>
                  <td className="px-6 py-3 text-slate-600 hidden md:table-cell">{d.hospital || "-"}</td>
                  <td className="px-6 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[d.status] || "bg-slate-100 text-slate-500"}`}>
                      {d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500 hidden md:table-cell">{d.donated_units || "-"}</td>
                  <td className="px-6 py-3 text-right">
                    {d.status === "accepted" || d.status === "pending" ? (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleVerify(d.donation_id || d.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition" title="Verify">
                          <CheckCircle size={16} />
                        </button>
                        <button onClick={() => handleReject(d.donation_id || d.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red transition" title="Reject">
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
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