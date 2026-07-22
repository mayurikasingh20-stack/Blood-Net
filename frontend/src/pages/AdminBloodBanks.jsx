import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle, Shield, AlertTriangle, RefreshCw } from "lucide-react";
import api from "../services/api";

export default function AdminBloodBanks() {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/blood-banks");
      setBloodBanks(res.data?.blood_banks || []);
    } catch {
      setError("Failed to load blood banks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  async function handleApprove(id) {
    try {
      await api.patch(`/admin/blood-banks/${id}/approve`);
      fetchBanks();
    } catch { alert("Failed to approve"); }
  }

  async function handleReject(id) {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      await api.patch(`/admin/blood-banks/${id}/reject`, { rejection_reason: reason });
      fetchBanks();
    } catch { alert("Failed to reject"); }
  }

  const filtered = bloodBanks.filter((b) =>
    (b.facility_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.city || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Blood Banks</h2>
          <p className="text-sm text-slate-500 mt-1">Approve or reject blood bank registrations.</p>
        </div>
        <button onClick={fetchBanks} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:border-red hover:text-red transition">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or city..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
      </div>

      {error && <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl"><AlertTriangle size={16} />{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <p className="text-slate-500">{search ? "No matching blood banks." : "No blood banks registered yet."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">City</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((b) => {
                const vs = b.verification_status || b.status;
                const isPending = vs !== "approved";
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-3">
                      <span className="font-semibold text-slate-800">{b.facility_name || b.name}</span>
                      {b.email && <p className="text-xs text-slate-400">{b.email}</p>}
                    </td>
                    <td className="px-6 py-3 text-slate-500 hidden md:table-cell">{b.city || "-"}</td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPending ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-600"}`}>
                        {isPending ? "Pending" : "Approved"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {isPending ? (
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleApprove(b.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition" title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleReject(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red transition" title="Reject">
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center justify-end gap-1"><Shield size={13} /> Verified</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}