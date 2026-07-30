import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp, CheckCircle, Clock, Droplets, Heart, Plus,
  XCircle, AlertCircle, Bell, User,
  Activity, ChevronDown, ChevronUp, Phone,
} from "lucide-react";
import useAuth from "../context/useAuth";
import NotificationPanel from "../components/shared/NotificationPanel";
import DonorScreeningModal from "../components/donor/DonorScreeningModal";

import { DONATION_STATUS_STYLES, STATUS_STYLES } from "../utils/constants";
import {
  getUserDashboard, getDonorProfile, getMyDonations, getOpenRequests,
  updateAvailability, acceptBloodRequest, getNotifications,
  getMyBloodRequests, cancelBloodRequest,
  verifyDonationFulfillment, patientUpdateRequestStatus,
} from "../services/dashboardService";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

function computeNextEligible(lastDate) {
  if (!lastDate) return "Today";
  const last = new Date(lastDate);
  const next = new Date(last);
  next.setDate(next.getDate() + 56);
  const now = new Date();
  if (next <= now) return "Today";
  return next.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function UnifiedDashboard() {
  const { user, hasRole } = useAuth();
  const isDonor = hasRole("donor");
  const isPatient = hasRole("patient");

  const [dashboard, setDashboard] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [available, setAvailable] = useState(true);

  const [acceptingId, setAcceptingId] = useState(null);
  const [screeningRequest, setScreeningRequest] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [verifyModal, setVerifyModal] = useState(null);
  const [verifyUnits, setVerifyUnits] = useState(1);
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("donor");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const calls = [
        getUserDashboard().catch(() => null),
        getNotifications().catch(() => ({ notifications: [] })),
      ];

      if (isDonor) {
        calls.push(
          getDonorProfile().catch(() => null),
          getMyDonations().catch(() => ({ donations: [] })),
          getOpenRequests().catch(() => ({ blood_requests: [] })),
        );
      }
      if (isPatient) {
        calls.push(
          getMyBloodRequests().catch(() => ({ blood_requests: [] })),
        );
      }

      const results = await Promise.all(calls);
      const dashData = results[0];
      const notifData = results[1];

      setDashboard(dashData);
      setNotifications(notifData?.notifications || []);

      let idx = 2;
      if (isDonor) {
        const profile = results[idx++];
        const donData = results[idx++];
        const reqData = results[idx++];
        setDonorProfile(profile);
        setDonations(donData?.donations || []);
        setOpenRequests(reqData?.blood_requests || []);
        if (dashData?.donor?.availability !== undefined) setAvailable(dashData.donor.availability);
        else if (profile?.donor?.available !== undefined) setAvailable(profile.donor.available);
      }
      if (isPatient) {
        const reqData = results[idx++];
        setMyRequests(reqData?.blood_requests || []);
      }
    } catch {
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [isDonor, isPatient]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function toggleAvailability() {
    const original = available;
    const newVal = !original;
    try {
      const res = await updateAvailability({ available: newVal });
      setAvailable(res.available);
    } catch {
      setAvailable(original);
    }
  }

  async function handleAccept(requestId) {
    setAcceptingId(requestId);
    try {
      await acceptBloodRequest(requestId);
      setOpenRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not accept request.");
    } finally {
      setAcceptingId(null);
    }
  }

  function handleScreeningComplete(requestId, result) {
    setScreeningRequest(null);
    if (result?.donation_id) {
      setOpenRequests((prev) => prev.filter((r) => r.id !== requestId));
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
    if (!window.confirm(`Mark this request as ${label}?`)) return;
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

  const donorDash = dashboard?.donor;
  const patientDash = dashboard?.patient;
  const bloodGroup = donorDash?.blood_group || donorProfile?.donor?.blood_group || "—";
  const totalDonations = donorDash?.total_donations || 0;
  const fulfilledDonations = donorDash?.verified_donations || 0;
  const lastDonation = donorProfile?.donor?.last_donation_date;
  const weight = donorProfile?.donor?.weight;
  const nextEligible = computeNextEligible(lastDonation);

  const activeRequests = myRequests.filter((r) => r.status !== "completed" && r.status !== "cancelled");
  const pendingCount = myRequests.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red/30 border-t-red rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red mb-1 block">
            {isDonor && isPatient ? "Unified Portal" : isDonor ? "Donor Portal" : "Patient Portal"}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isDonor && isPatient
              ? "Manage your donations and blood requests in one place."
              : isDonor
                ? "Here&apos;s your impact at a glance."
                : "Raise blood requests and track their status."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPatient && (
            <Link to="/requests"
              className="px-5 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red/20"
            >
              <Plus size={16} /> Raise Request
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Role Tabs (only show when user has both roles) */}
      {isDonor && isPatient && (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("donor")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === "donor"
                ? "bg-white text-red shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Droplets size={14} className="inline mr-1.5" />Donor
          </button>
          <button
            onClick={() => setActiveTab("patient")}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition ${
              activeTab === "patient"
                ? "bg-white text-red shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Heart size={14} className="inline mr-1.5" />Patient
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }}
        initial="initial" whileInView="whileInView" viewport={{ once: true }}
      >
        {isDonor && (
          <>
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-blue-50">
                <ThumbsUp size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{totalDonations}</p>
              <p className="text-xs text-slate-500 mt-0.5">Accepted Requests</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-emerald-50">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{fulfilledDonations}</p>
              <p className="text-xs text-slate-500 mt-0.5">Fulfilled</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-amber-50">
                <Clock size={20} className="text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{nextEligible}</p>
              <p className="text-xs text-slate-500 mt-0.5">Next Eligible</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-purple-50">
                <Activity size={20} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{bloodGroup}</p>
              <p className="text-xs text-slate-500 mt-0.5">Blood Type</p>
            </motion.div>
          </>
        )}
        {isPatient && (
          <>
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-red/10">
                <Droplets size={20} className="text-red" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{patientDash?.total_requests ?? myRequests.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Requests</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-emerald-50">
                <Heart size={20} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{patientDash?.total_units_received ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Units Received</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-blue-50">
                <Clock size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{activeRequests.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Active</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-amber-50">
                <AlertCircle size={20} className="text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">Pending</p>
            </motion.div>
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Donor: Availability Toggle */}
          {isDonor && (activeTab === "donor" || !isPatient) && (
            <>
              <motion.div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm" {...fadeUp}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${available ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                      {available ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{available ? "Available to Donate" : "Not Available"}</p>
                      <p className="text-xs text-slate-500">{available ? "You appear in donor searches" : "Hidden from donor searches"}</p>
                    </div>
                  </div>
                  <button onClick={toggleAvailability}
                    className={`relative w-12 h-6 rounded-full transition-colors ${available ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${available ? "translate-x-6" : ""}`} />
                  </button>
                </div>
              </motion.div>

              {/* Open Blood Requests */}
              <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Bell size={16} className="text-red" />
                    Blood Requests Near You
                  </h3>
                  <Link to="/requests" className="text-xs text-red font-semibold hover:underline">View All</Link>
                </div>
                <div className="p-4 md:p-6">
                  {openRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle size={20} className="text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">No open requests</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {openRequests.slice(0, 5).map((req) => (
                        <div key={req.id} className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-slate-50 hover:bg-red-50 transition">
                          <div className="w-12 h-12 rounded-xl bg-red/10 flex items-center justify-center text-red font-bold text-base flex-shrink-0">
                            {req.blood_group}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{req.hospital}</p>
                            <p className="text-xs text-slate-500 truncate">{req.city} &middot; {req.units} unit(s) needed</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            req.urgency_level === "Critical" ? "bg-red/10 text-red" :
                            req.urgency_level === "High" ? "bg-amber-50 text-amber-700" :
                            "bg-blue-50 text-blue-600"
                          }`}>
                            {req.urgency_level}
                          </span>
                          <button
                            onClick={() => setScreeningRequest(req)}
                            disabled={acceptingId === req.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red text-white rounded-full text-xs font-bold hover:bg-red-700 transition disabled:opacity-50"
                          >
                            <ThumbsUp size={12} />
                            {acceptingId === req.id ? "..." : "Accept"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

            </>
          )}

          {/* Patient: Blood Requests */}
          {isPatient && (activeTab === "patient" || !isDonor) && (
            <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
              <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Your Blood Requests</h3>
              </div>
              <div className="p-4 md:p-6">
                {myRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Droplets size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">No blood requests yet</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Click "Raise Blood Request" to create your first request</p>
                    <Link to="/requests" className="px-4 py-2 bg-red text-white rounded-full text-xs font-bold hover:bg-red-700 transition inline-block">Create Request</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRequests.filter((r) => r.status !== "completed").slice(0, 10).map((req) => (
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
                              return (
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[styleKey] || STATUS_STYLES.pending}`}>
                                  {displayStatus === "responded" ? "Responded" : (req.status || "pending")}
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
                                            onClick={() => setVerifyModal({ donationId: donor.donation_id, donorName: donor.name, requestId: req.id })}
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
                            <button onClick={() => handlePatientUpdate(req.id, "not_fulfilled")}
                              className="w-full py-1.5 border border-red/30 text-red rounded-full text-[10px] font-bold hover:bg-red-50 transition"
                            >
                              Not Fulfilled
                            </button>
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
          )}

        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {isDonor && (
            <motion.div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm" {...fadeUp}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red/10 flex items-center justify-center text-red font-bold text-lg">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-500">{user?.city || "—"}</p>
                </div>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Blood Type</span><span className="font-bold text-red">{bloodGroup}</span></div>
                {weight && <div className="flex justify-between"><span className="text-slate-500">Weight</span><span className="font-semibold">{weight} kg</span></div>}
                <div className="flex justify-between"><span className="text-slate-500">Status</span><span className={`font-semibold ${available ? "text-emerald-600" : "text-slate-400"}`}>{available ? "Available" : "Unavailable"}</span></div>
              </div>
            </motion.div>
          )}

          <NotificationPanel
            notifications={notifications}
            onClear={() => setNotifications([])}
            onReadAll={() => setNotifications((prev) =>
              prev.map((n) => ({ ...n, status: "read" }))
            )}
          />
        </div>
      </div>

      {/* Screening Modal */}
      {screeningRequest && (
        <DonorScreeningModal
          requestId={screeningRequest.id}
          requestBloodGroup={screeningRequest.blood_group}
          onComplete={(result) => handleScreeningComplete(screeningRequest.id, result)}
          onClose={() => setScreeningRequest(null)}
        />
      )}

      {/* Verify Modal */}
      {verifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verify Donation</h3>
            <p className="text-sm text-slate-500 mb-4">
              Confirm donation from <strong>{verifyModal.donorName}</strong>
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleVerify(verifyModal.donationId, verifyUnits); }}>
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
                  {verifying ? "Verifying..." : "Confirm Fulfillment"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
