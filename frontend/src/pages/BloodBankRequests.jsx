import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Droplets, XCircle, AlertCircle, Search, Bell, TrendingUp, ChevronDown, ChevronUp, Phone, User, Building2, Trash2 } from "lucide-react";
import useAuth from "../context/useAuth";
import api from "../services/api";
import { verifyDonationFulfillment, removeAcceptedResponse } from "../services/dashboardService";

const urgencyColors = {
  Critical: "bg-red/10 text-red border-red/20",
  High: "bg-orange-50 text-orange-600 border-orange-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-500 border-slate-200",
};

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  matched: "bg-blue-50 text-blue-600",
  accepted: "bg-purple-50 text-purple-600",
  completed: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-slate-100 text-slate-500",
};

export default function BloodBankRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [verifyModal, setVerifyModal] = useState(null);
  const [verifyUnits, setVerifyUnits] = useState(1);
  const [verifying, setVerifying] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/blood-request/my-requests");
      setRequests(Array.isArray(res.data?.blood_requests) ? res.data.blood_requests : []);
    } catch {
      setError("Could not load requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function handleCancel(id) {
    if (!window.confirm("Cancel this blood request?")) return;
    try {
      await api.patch(`/blood-request/${id}/cancel`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel request.");
    }
  }

  async function handleFulfill() {
    if (!verifyModal) return;
    setVerifying(true);
    try {
      await verifyDonationFulfillment(verifyModal.donationId, verifyUnits);
      setVerifyModal(null);
      setVerifyUnits(1);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Could not mark donation as fulfilled.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleRemoveResponse(donationId) {
    if (!window.confirm("Remove this response from the request?")) return;
    setRemovingId(donationId);
    try {
      await removeAcceptedResponse(donationId);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove response.");
    } finally {
      setRemovingId(null);
    }
  }

  const responderCount = (req) =>
    (req.accepted_donors?.length || 0) + (req.accepted_banks?.length || 0);

  const filtered = requests.filter((r) => {
    if (r.status === "completed") return false;
    const term = searchTerm.toLowerCase();
    return (
      (r.blood_group || "").toLowerCase().includes(term) ||
      (r.hospital || "").toLowerCase().includes(term) ||
      (r.city || "").toLowerCase().includes(term) ||
      (r.id || "").toString().includes(term)
    );
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    completed: requests.filter((r) => r.status === "completed").length,
    cancelled: requests.filter((r) => r.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red mb-1 block">Blood Requests</span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{user?.name || "Blood Bank"}</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track blood requests from hospitals.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { icon: TrendingUp, label: "Total Requests", value: stats.total, color: "text-red", bg: "bg-red/10" },
          { icon: Bell, label: "Pending", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: Droplets, label: "Completed", value: stats.completed, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: XCircle, label: "Cancelled", value: stats.cancelled, color: "text-slate-500", bg: "bg-slate-50" },
        ].map((stat) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.bg}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Droplets size={16} className="text-red" /> All Requests
          </h3>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by blood group, hospital, city..."
              className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-red/20" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Blood Group</th>
                <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital</th>
                <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">City</th>
                <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Units</th>
                <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Urgency</th>
                <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">{searchTerm ? "No matching requests." : "No requests yet."}</td></tr>
              )}
              {filtered.map((req) => (
                <>
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="px-4 md:px-6 py-3"><span className="font-bold text-red">{req.blood_group}</span></td>
                  <td className="px-4 md:px-6 py-3 text-slate-600">{req.hospital}</td>
                  <td className="px-4 md:px-6 py-3 text-slate-500 hidden md:table-cell">{req.city}</td>
                  <td className="px-4 md:px-6 py-3 text-slate-500 hidden md:table-cell">{req.units} ({req.fulfilled_units || 0} fulfilled)</td>
                  <td className="px-4 md:px-6 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyColors[req.urgency_level] || "bg-slate-100 text-slate-500"}`}>
                      {req.urgency_level || "Moderate"}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[req.status] || "bg-slate-100 text-slate-500"}`}>
                      {req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {responderCount(req) > 0 && (
                        <button onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-red/20 text-red text-[10px] font-bold hover:bg-red/10 transition">
                          {expandedId === req.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          View {responderCount(req)} responder{responderCount(req) > 1 ? "s" : ""}
                        </button>
                      )}
                      {(req.status === "pending" || req.status === "matched") && (
                        <button onClick={() => handleCancel(req.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red transition" title="Cancel Request">
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === req.id && responderCount(req) > 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 md:px-6 py-4 bg-slate-50/50">
                      <div className="space-y-2">
                        {req.accepted_donors?.map((donor) => (
                          <div key={donor.donation_id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100">
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
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                donor.status === "verified" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                              }`}>
                                {donor.status === "verified" ? `Fulfilled (${donor.donated_units} unit)` : "Accepted"}
                              </span>
                              {donor.status === "accepted" && (
                                <button
                                  onClick={() => setVerifyModal({ donationId: donor.donation_id, name: donor.name })}
                                  className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold hover:bg-emerald-600 transition"
                                >
                                  Fulfilled
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveResponse(donor.donation_id)}
                                disabled={removingId === donor.donation_id}
                                title="Remove response"
                                className="p-1 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red transition disabled:opacity-50"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {req.accepted_banks?.map((bank) => (
                          <div key={bank.donation_id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                              {bank.name?.charAt(0) || "B"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1">
                                <Building2 size={12} className="text-slate-400" /> {bank.name}
                              </p>
                              <p className="text-xs text-slate-500">{bank.blood_group} &middot; {bank.city || "—"}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Phone size={12} className="text-slate-400" />
                              <span className="font-semibold text-slate-700">{bank.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                bank.status === "verified" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                              }`}>
                                {bank.status === "verified" ? `Fulfilled (${bank.donated_units} unit)` : "Accepted"}
                              </span>
                              {bank.status === "accepted" && (
                                <button
                                  onClick={() => setVerifyModal({ donationId: bank.donation_id, name: bank.name })}
                                  className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold hover:bg-emerald-600 transition"
                                >
                                  Fulfilled
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveResponse(bank.donation_id)}
                                disabled={removingId === bank.donation_id}
                                title="Remove response"
                                className="p-1 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red transition disabled:opacity-50"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {requests.length > 0 && (
          <div className="px-4 md:px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {requests.length} requests
          </div>
        )}
      </motion.div>

      {verifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Mark Fulfilled</h3>
            <p className="text-sm text-slate-500 mb-4">
              Confirm donation from <strong>{verifyModal.name}</strong>
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleFulfill(); }}>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Units Donated</label>
              <input type="number" min={1} value={verifyUnits}
                onChange={(e) => setVerifyUnits(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20 mb-4"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setVerifyModal(null)} className="w-1/3 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={verifying}
                  className="w-2/3 py-2.5 bg-emerald-500 text-white rounded-full text-sm font-bold hover:bg-emerald-600 transition disabled:opacity-60"
                >
                  {verifying ? "Marking..." : "Confirm Fulfillment"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
