import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets, Heart, Clock, MapPin, XCircle, Plus, AlertCircle,
  ChevronDown, ChevronUp, Phone, User,
} from "lucide-react";
import useAuth from "../context/useAuth";
import {
  getPatientDashboard, getMyBloodRequests, createBloodRequest, cancelBloodRequest, getNotifications,
  verifyDonationFulfillment, patientUpdateRequestStatus,
} from "../services/dashboardService";
import BloodMap from "../components/shared/BloodMap";
import RaiseRequestModal from "../components/shared/RaiseRequestModal";
import NotificationPanel from "../components/shared/NotificationPanel";
import { STATUS_STYLES } from "../utils/constants";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [verifyModal, setVerifyModal] = useState(null); // { donationId, donorName, requestId }
  const [verifyUnits, setVerifyUnits] = useState(1);
  const [verifying, setVerifying] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashData, reqData, notifData] = await Promise.all([
        getPatientDashboard().catch(() => null),
        getMyBloodRequests().catch(() => ({ blood_requests: [] })),
        getNotifications().catch(() => ({ notifications: [] })),
      ]);
      setDashboard(dashData);
      setRequests(reqData?.blood_requests || []);
      setNotifications(notifData?.notifications || []);
    } catch {
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleCreateRequest(formData) {
    const payload = {
      blood_group: formData.bloodGroup,
      units: parseInt(formData.unitsNeeded),
      hospital: formData.hospital,
      hospital_address: formData.hospitalAddress || formData.hospital,
      city: formData.city || user?.city || "",
      urgency_level: formData.urgency,
      required_before: formData.requiredBefore || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      purpose: formData.condition || "",
      contact_name: formData.contactName || user?.name || "",
      contact_phone: formData.contactPhone || user?.phone || "",
    };
    try {
      await createBloodRequest(payload);
      setRaiseOpen(false);
      fetchData();
    } catch (err) {
      console.error("Create request error:", err.response?.status, err.response?.data);
      const errors = err.response?.data?.errors;
      let msg = err.response?.data?.message || err.response?.data?.msg || "Could not create request.";
      if (errors) {
        const fieldLabels = { blood_group: "Blood group", hospital_address: "Hospital address", contact_phone: "Contact phone", required_before: "Required by date", urgency_level: "Urgency level" };
        const list = Object.entries(errors).map(([k, v]) => `${fieldLabels[k] || k}: ${v}`).join("\n");
        msg = list || msg;
      }
      alert(msg);
    }
  }

  async function handleVerify(donationId, units) {
    setVerifying(true);
    try {
      await verifyDonationFulfillment(donationId, units);
      setVerifyModal(null);
      setVerifyUnits(1);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Could not verify donation.");
    } finally {
      setVerifying(false);
    }
  }

  async function handlePatientUpdate(requestId, action) {
    const label = action === "fulfilled" ? "fulfilled" : "not fulfilled";
    if (!window.confirm(`Mark this request as ${label}? This will ${action === "fulfilled" ? "complete the request and verify all donors" : "cancel all pending donor acceptances"} .`)) return;
    try {
      await patientUpdateRequestStatus(requestId, action);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || `Could not mark as ${label}.`);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm("Cancel this blood request?")) return;
    try {
      await cancelBloodRequest(id);
      fetchData();
    } catch {
      alert("Could not cancel request.");
    }
  }

  const activeRequests = requests.filter((r) => r.status !== "completed" && r.status !== "cancelled");
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red mb-1 block">Patient Dashboard</span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, {user?.name?.split(" ")[0] || "Patient"}</h1>
          <p className="text-sm text-slate-500 mt-1">Raise blood requests and track their status in real time.</p>
        </div>
        <button onClick={() => setRaiseOpen(true)}
          className="px-5 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red/20"
        >
          <Plus size={16} /> Raise Blood Request
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }}
        initial="initial" whileInView="whileInView" viewport={{ once: true }}
      >
        {[
          { icon: Droplets, label: "Total Requests", value: dashboard?.total_requests ?? requests.length, color: "text-red", bg: "bg-red/10" },
          { icon: Heart, label: "Units Received", value: dashboard?.total_units_received ?? 0, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: Clock, label: "Active", value: activeRequests.length, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: AlertCircle, label: "Pending Approval", value: pendingCount, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}
            className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.bg}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Your Blood Requests</h3>
            </div>
            <div className="p-4 md:p-6">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Droplets size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">No blood requests yet</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Click &quot;Raise Blood Request&quot; to create your first request</p>
                  <button onClick={() => setRaiseOpen(true)} className="px-4 py-2 bg-red text-white rounded-full text-xs font-bold hover:bg-red-700 transition">Create Request</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.slice(0, 10).map((req) => (
                    <div key={req.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-red/10 flex items-center justify-center text-red font-bold text-base flex-shrink-0">
                            {req.blood_group}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{req.hospital}</p>
                            <p className="text-xs text-slate-500">{req.units} unit(s) needed &middot; {req.city || ""}</p>
                            {req.created_at && <p className="text-xs text-slate-400 mt-0.5">{new Date(req.created_at).toLocaleDateString()}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const displayStatus = req.accepted_count > 0 && req.status === "pending" ? "responded" : req.status;
                            const styleKey = STATUS_STYLES[displayStatus] ? displayStatus : "pending";
                            const label = displayStatus === "responded" ? "Responded" : (req.status || "pending");
                            return (
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[styleKey] || STATUS_STYLES.pending}`}>
                                {label}
                              </span>
                            );
                          })()}
                          {(req.status === "pending" || req.status === "matched") && (
                            <button onClick={() => handleCancel(req.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red transition">
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      {req.accepted_donors && req.accepted_donors.length > 0 && (
                        <div className="mt-3">
                          <button
                            onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-red hover:text-red-700 transition"
                          >
                            {expandedRequest === req.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            View {req.accepted_donors.length} donor{req.accepted_donors.length > 1 ? "s" : ""}
                          </button>
                          <AnimatePresence>
                            {expandedRequest === req.id && (
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
                                      <div className="flex items-center gap-1.5">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          donor.status === "verified" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                        }`}>
                                          {donor.status === "verified" ? `Verified (${donor.donated_units} unit)` : "Accepted"}
                                        </span>
                                        {donor.status === "accepted" && (
                                          <button
                                            onClick={() => {
                                              setVerifyModal({ donationId: donor.donation_id, donorName: donor.name, requestId: req.id });
                                              setVerifyUnits(1);
                                            }}
                                            className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold hover:bg-emerald-600 transition"
                                          >
                                            Verify
                                          </button>
                                        )}
                                      </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => handlePatientUpdate(req.id, "fulfilled")}
                              className="flex-1 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold hover:bg-emerald-600 transition"
                            >
                              Mark Fulfilled
                            </button>
                            <button
                              onClick={() => handlePatientUpdate(req.id, "not_fulfilled")}
                              className="flex-1 py-1.5 border border-red/30 text-red rounded-full text-[10px] font-bold hover:bg-red-50 transition"
                            >
                              Not Fulfilled
                            </button>
                          </div>
                        </div>
                      )}
                      {req.fulfilled_units > 0 && (
                        <div className="mt-2 text-xs text-slate-500">Fulfilled: {req.fulfilled_units}/{req.units} units</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" {...fadeUp}>
            <div className="px-4 md:px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><MapPin size={16} className="text-red" /> Nearby Blood Banks</h3>
            </div>
            <div className="p-4 md:p-6"><BloodMap showCamps={true} height="320px" /></div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <NotificationPanel
            notifications={notifications}
            onClear={() => {
              setNotifications((prev) =>
                prev.map((n) =>
                  n.notification_type === "blood_request" ? { ...n, status: "read" } : n
                )
              );
            }}
          />
        </div>
      </div>

      {raiseOpen && (
        <RaiseRequestModal
          requesterName={user?.name || "Patient"}
          onClose={() => setRaiseOpen(false)}
          onSubmit={handleCreateRequest}
        />
      )}

      {verifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verify Donation</h3>
            <p className="text-sm text-slate-500 mb-4">
              Confirm donation from <strong>{verifyModal.donorName}</strong>
            </p>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Units Donated</label>
            <input
              type="number" min={1} value={verifyUnits}
              onChange={(e) => setVerifyUnits(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setVerifyModal(null)}
                className="w-1/3 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(verifyModal.donationId, verifyUnits)}
                disabled={verifying}
                className="w-2/3 py-2.5 bg-emerald-500 text-white rounded-full text-sm font-bold hover:bg-emerald-600 transition disabled:opacity-60"
              >
                {verifying ? "Verifying..." : "Confirm Fulfillment"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
