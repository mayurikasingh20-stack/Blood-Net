import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ThumbsUp, CheckCircle, Clock, CalendarCheck, User,
  Droplets, XCircle, AlertCircle, MapPin,
  Settings, Bell, Activity,
} from "lucide-react";
import useAuth from "../context/useAuth";
import BloodMap from "../components/shared/BloodMap";
import NotificationPanel from "../components/shared/NotificationPanel";
import DonorScreeningModal from "../components/donor/DonorScreeningModal";
import { DONATION_STATUS_STYLES } from "../utils/constants";
import {
  getDonorDashboard, getMyDonations, getDonorProfile,
  updateAvailability, getNotifications, getOpenRequests,
  acceptBloodRequest,
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

export default function DonorDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [available, setAvailable] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dash, profile, donData, reqData, notifData] = await Promise.all([
        getDonorDashboard().catch(() => null),
        getDonorProfile().catch(() => null),
        getMyDonations().catch(() => ({ donations: [] })),
        getOpenRequests().catch(() => ({ blood_requests: [] })),
        getNotifications().catch(() => ({ notifications: [] })),
      ]);

      setDashboard(dash);
      setDonorProfile(profile);
      setDonations(donData?.donations || []);
      setOpenRequests(reqData?.blood_requests || []);
      setNotifications(notifData?.notifications || []);
      if (dash?.availability !== undefined) setAvailable(dash.availability);
      else if (profile?.donor?.available !== undefined) setAvailable(profile.donor.available);
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

  const [acceptingId, setAcceptingId] = useState(null);
  const [screeningRequest, setScreeningRequest] = useState(null);

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

  const bloodGroup = dashboard?.blood_group || donorProfile?.donor?.blood_group || "—";
  const totalDonations = dashboard?.total_donations || 0;
  const fulfilledDonations = dashboard?.verified_donations || 0;
  const lastDonation = donorProfile?.donor?.last_donation_date;
  const weight = donorProfile?.donor?.weight;
  const nextEligible = computeNextEligible(lastDonation);
  const myBloodGroup = donorProfile?.donor?.blood_group || dashboard?.blood_group || "";

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red mb-1 block">Donor Dashboard</span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(" ")[0] || "Donor"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here&apos;s your impact at a glance.</p>
        </div>
        <Link to="/donor/settings" className="px-4 py-2 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:border-red hover:text-red transition flex items-center gap-1.5">
          <Settings size={15} /> <span className="hidden sm:inline">Settings</span>
        </Link>
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
          { icon: ThumbsUp, label: "Requests Accepted", value: totalDonations, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: CheckCircle, label: "Donations Fulfilled", value: fulfilledDonations, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: Clock, label: "Next Eligible", value: nextEligible, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: CalendarCheck, label: "Last Donation", value: lastDonation || "N/A", color: "text-purple-600", bg: "bg-purple-50" },
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
          {/* Availability Toggle */}
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

          {/* Blood Requests Near You */}
          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell size={16} className="text-red" />
                Blood Requests Near You
              </h3>
              <Link to="/donor/requests" className="text-xs text-red font-semibold hover:underline">View All</Link>
            </div>
            <div className="p-4 md:p-6">
              {openRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">No open requests</p>
                  <p className="text-xs text-slate-400 mt-1">There are no pending blood requests right now</p>
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

          {/* Nearby Blood Banks Map */}
          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" {...fadeUp}>
            <div className="px-4 md:px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><MapPin size={16} className="text-red" /> Nearby Blood Banks</h3>
            </div>
            <div className="p-4 md:p-6"><BloodMap showCamps={true} height="320px" /></div>
          </motion.div>

          {/* Donation History */}
          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity size={16} className="text-red" />
                Donation History
              </h3>
              {donations.length > 0 && (
                <Link to="/donor/history" className="text-xs text-red font-semibold hover:underline">View All</Link>
              )}
            </div>
            <div className="p-4 md:p-6">
              {donations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Droplets size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">No donations yet</p>
                  <p className="text-xs text-slate-400 mt-1">Your history will appear after your first donation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.slice(0, 5).map((d, idx) => (
                    <div key={d.donation_id || idx} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full border-2 ${idx === 0 ? "bg-red border-red" : "bg-slate-200 border-slate-200"}`} />
                        {idx < Math.min(donations.length, 5) - 1 && <div className="w-0.5 h-8 bg-slate-100" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="text-sm font-semibold text-slate-900">{d.blood_group} - {d.hospital || "Blood Bank"}</p>
                        <p className="text-xs text-slate-500">
                          {d.created_at ? new Date(d.created_at).toLocaleDateString() : ""} &middot; {d.donated_units || 1} unit(s)
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${DONATION_STATUS_STYLES[d.status] || "bg-amber-50 text-amber-700"}`}>
                        {d.status || "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm" {...fadeUp}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red/10 flex items-center justify-center text-red font-bold text-lg">
                {user?.name?.charAt(0) || "D"}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{user?.name || "Donor"}</p>
                <p className="text-xs text-slate-500">{user?.city || "—"}</p>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Blood Type</span><span className="font-bold text-red">{bloodGroup}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Weight</span><span className="font-semibold">{weight || "—"} kg</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span><span className={`font-semibold ${available ? "text-emerald-600" : "text-slate-400"}`}>{available ? "Available" : "Unavailable"}</span></div>
            </div>
            <Link to="/donor/profile" className="mt-4 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-red hover:text-red transition">
              <User size={15} /> Edit Profile
            </Link>
          </motion.div>

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
      {/* Screening Modal */}
      {screeningRequest && (
        <DonorScreeningModal
          requestId={screeningRequest.id}
          requestBloodGroup={screeningRequest.blood_group}
          onComplete={(result) => handleScreeningComplete(screeningRequest.id, result)}
          onClose={() => setScreeningRequest(null)}
        />
      )}
    </div>
  );
}
