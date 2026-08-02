import { useState, useEffect, useCallback } from "react";
import { Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import api from "../services/api";

export default function AdminBloodBanks() {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

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
    const reason = prompt("Reason for accepting this blood bank:");
    if (!reason || !reason.trim()) return;
    if (!window.confirm("Accept this blood bank?")) return;
    setBusyId(id);
    try {
      await api.patch(`/admin/blood-banks/${id}/approve`, { reason: reason.trim() });
      fetchBanks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id) {
    const reason = prompt("Reason for rejecting this blood bank:");
    if (!reason || !reason.trim()) return;
    if (!window.confirm("Reject this blood bank?")) return;
    setBusyId(id);
    try {
      await api.patch(`/admin/blood-banks/${id}/reject`, { rejection_reason: reason.trim() });
      fetchBanks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    } finally {
      setBusyId(null);
    }
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
          <p className="text-sm text-slate-500 mt-1">Accept or reject blood bank registrations.</p>
        </div>
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">License ID</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">City</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Reason</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((b) => {
                const vs = b.verification_status || b.status;
                const isApproved = vs === "approved";
                const isRejected = vs === "rejected";
                const reason = b.rejection_reason || b.last_action?.reason;
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{b.facility_name || b.name}</span>
                      {b.email && <p className="text-xs text-slate-400">{b.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{b.license_id || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{b.contact_person || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{b.city || "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell max-w-[200px]">
                      {reason ? <span className="text-xs text-slate-500">{reason}</span> : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isApproved ? "bg-emerald-50 text-emerald-600" : isRejected ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {isApproved ? "Approved" : isRejected ? "Rejected" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(b.id)}
                          disabled={isApproved || busyId === b.id}
                          title={isApproved ? "Already approved" : "Accept blood bank"}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 transition hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <CheckCircle size={13} /> Accept
                        </button>
                        <button
                          onClick={() => handleReject(b.id)}
                          disabled={isRejected || busyId === b.id}
                          title={isRejected ? "Already rejected" : "Reject blood bank"}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 transition hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
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
