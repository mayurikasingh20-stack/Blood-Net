import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Plus, XCircle, Search, Loader, ChevronDown, ChevronUp, Phone, User } from "lucide-react";
import api from "../services/api";
import RaiseRequestModal from "../components/shared/RaiseRequestModal";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  matched: "bg-blue-50 text-blue-600",
  accepted: "bg-purple-50 text-purple-600",
  completed: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-slate-100 text-slate-500",
};

export default function PatientBloodRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const loadRequests = useCallback(async () => {
    try {
      const res = await api.get("/blood-request/my-requests");
      setRequests(res.data?.blood_requests || []);
    } catch {
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  async function handleCancel(id) {
    if (!confirm("Cancel this request?")) return;
    try {
      await api.patch(`/blood-request/${id}/cancel`);
      loadRequests();
    } catch {
      alert("Failed to cancel request");
    }
  }

  const filtered = requests.filter((r) =>
    r.hospital?.toLowerCase().includes(search.toLowerCase()) ||
    r.blood_group?.includes(search.toUpperCase()) ||
    r.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-12"><Loader className="animate-spin text-red" size={32} /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Blood Requests</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your blood requests and track their status.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition">
          <Plus size={16} /> New Request
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by hospital, blood group, city..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
      </div>

      {error && <div className="text-sm text-red bg-red/10 px-4 py-3 rounded-xl">{error}</div>}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <Droplets size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">{search ? "No matching requests." : "No blood requests yet. Create your first request."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red/10 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-red">{req.blood_group}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{req.hospital}</p>
                    <p className="text-xs text-slate-500">{req.city} &middot; {req.units} unit(s) &middot; {req.fulfilled_units || 0} fulfilled</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {req.accepted_count > 0 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                      {req.accepted_count} accepted
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusStyles[req.status] || "bg-slate-100 text-slate-500"}`}>
                    {req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : "Pending"}
                  </span>
                  {req.status !== "completed" && req.status !== "cancelled" && (
                    <button onClick={() => handleCancel(req.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red transition" title="Cancel">
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
              {req.accepted_donors && req.accepted_donors.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-red hover:text-red-700 transition"
                  >
                    {expandedId === req.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    View {req.accepted_donors.length} donor{req.accepted_donors.length > 1 ? "s" : ""}
                  </button>
                  <AnimatePresence>
                    {expandedId === req.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 space-y-2">
                        {req.accepted_donors.map((donor) => (
                          <div key={donor.donor_id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-red/10 flex items-center justify-center text-red font-bold text-sm flex-shrink-0">
                              {donor.name?.charAt(0) || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1">
                                <User size={12} className="text-slate-400" /> {donor.name}
                              </p>
                              <p className="text-xs text-slate-500">{donor.blood_group} &middot; {donor.city || "—"}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Phone size={12} className="text-slate-400" />
                              <span className="font-semibold text-slate-700">{donor.phone}</span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {showModal && <RaiseRequestModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={loadRequests} />}
    </div>
  );
}