import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Droplets,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Search,
  ChevronRight,
  RefreshCw,
  Shield,
  UserCheck,
  Ban,
  Calendar,
} from "lucide-react";
import { getAdminDashboard, getAdminCamps, getNotifications } from "../services/dashboardService";
import api from "../services/api";
import NotificationPanel from "../components/shared/NotificationPanel";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "bloodbanks", label: "Blood Banks", icon: Building2 },
  { id: "requests", label: "Requests", icon: Droplets },
  { id: "donations", label: "Donations", icon: TrendingUp },
  { id: "camps", label: "Camps", icon: Calendar },
];

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [camps, setCamps] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const dash = await getAdminDashboard().catch(() => null);
      setDashboard(dash);

      const [banksRes, reqsRes, donsRes] = await Promise.all([
        api.get("/admin/blood-banks").catch(() => ({ data: { blood_banks: [] } })),
        api.get("/admin/blood-requests").catch(() => ({ data: { blood_requests: [] } })),
        api.get("/admin/donations").catch(() => ({ data: { donations: [] } })),
      ]);
      setBloodBanks(Array.isArray(banksRes.data?.blood_banks) ? banksRes.data.blood_banks : []);
      setAllRequests(Array.isArray(reqsRes.data?.blood_requests) ? reqsRes.data.blood_requests : []);
      setAllDonations(Array.isArray(donsRes.data?.donations) ? donsRes.data.donations : []);

      const campsData = await getAdminCamps().catch(() => ({ camps: [] }));
      setCamps(Array.isArray(campsData?.camps) ? campsData.camps : []);

      const notifs = await getNotifications().catch(() => ({ notifications: [] }));
      setNotifications(Array.isArray(notifs?.notifications) ? notifs.notifications : []);
    } catch {
      setError("Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  async function handleApprove(id) {
    try {
      await api.patch(`/admin/blood-banks/${id}/approve`);
      fetchAll();
    } catch { alert("Failed to approve."); }
  }

  async function handleReject(id) {
    try {
      await api.patch(`/admin/blood-banks/${id}/reject`, { rejection_reason: "Rejected by admin" });
      fetchAll();
    } catch { alert("Failed to reject."); }
  }

  const pendingBanks = bloodBanks.filter((b) => (b.verification_status || b.status) === "pending");
  const approvedBanks = bloodBanks.filter((b) => (b.verification_status || b.status) === "approved");
  const pendingRequests = allRequests.filter((r) => r.status === "pending");

  const filteredBanks = bloodBanks.filter((b) =>
    (b.facility_name || b.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.city || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red mb-1 block">
            Admin Panel
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage users, blood banks, and platform activity.</p>
        </div>
        <button
          onClick={fetchAll}
          className="px-4 py-2 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:border-red hover:text-red transition flex items-center gap-1.5"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
      >
        {[
          { icon: Building2, label: "Blood Banks", value: bloodBanks.length, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Users, label: "Pending Approval", value: pendingBanks.length, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: Droplets, label: "Blood Requests", value: allRequests.length, color: "text-red", bg: "bg-red/10" },
          { icon: TrendingUp, label: "Donations", value: allDonations.length, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveTab(stat.label === "Pending Approval" ? "bloodbanks" : stat.label === "Blood Requests" ? "requests" : "overview")}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.bg}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id ? "bg-white text-red shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div className="space-y-6" {...fadeUp}>
            <NotificationPanel notifications={notifications} onClear={() => {
              setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
            }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-500" />
                  Recent Blood Banks
                </h3>
                {bloodBanks.slice(0, 5).map((b) => {
                  const vs = b.verification_status || b.status;
                  return (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{b.facility_name || b.name}</p>
                      <p className="text-xs text-slate-500">{b.city || "—"}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      vs === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"
                    }`}>
                      {vs === "approved" ? "Approved" : "Pending"}
                    </span>
                  </div>
                  );
                })}
                {bloodBanks.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No blood banks registered.</p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Droplets size={16} className="text-red" />
                  Recent Requests
                </h3>
                {allRequests.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {r.blood_group || r.bloodGroup} - {r.hospital_name || r.hospital}
                      </p>
                      <p className="text-xs text-slate-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      {r.status || "Pending"}
                    </span>
                  </div>
                ))}
                {allRequests.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No requests yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Blood Banks Tab */}
        {activeTab === "bloodbanks" && (
          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
            <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900">All Blood Banks</h3>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or city..."
                  className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">City</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="text-right px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBanks.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                        {searchTerm ? "No matching blood banks." : "No blood banks registered."}
                      </td>
                    </tr>
                  )}
                  {filteredBanks.map((b) => {
                    const vs = b.verification_status || b.status;
                    const isPending = vs !== "approved";
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 md:px-6 py-3">
                          <span className="font-semibold text-slate-800">{b.facility_name || b.name}</span>
                          {b.email && <p className="text-xs text-slate-400">{b.email}</p>}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-slate-500 hidden md:table-cell">{b.city || "—"}</td>
                        <td className="px-4 md:px-6 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPending ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {isPending ? "Pending" : "Approved"}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprove(b.id)}
                                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition"
                                  title="Approve"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(b.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red transition"
                                  title="Reject"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            {!isPending && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Shield size={13} /> Verified
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
            <div className="px-4 md:px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">All Blood Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">Track current status of all blood requests.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase">Blood Group</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase">Hospital</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Units</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Fulfilled</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase">Severity</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allRequests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">No requests found.</td>
                    </tr>
                  )}
                  {allRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 md:px-6 py-3">
                        <span className="font-bold text-red">{r.blood_group || r.bloodGroup}</span>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-slate-600">{r.hospital_name || r.hospital}</td>
                      <td className="px-4 md:px-6 py-3 text-slate-500 hidden md:table-cell">{r.units || 1}</td>
                      <td className="px-4 md:px-6 py-3 text-slate-600 hidden md:table-cell">{r.fulfilled_units || 0}</td>
                      <td className="px-4 md:px-6 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.urgency_level === "Critical" ? "bg-red/10 text-red" :
                          r.urgency_level === "High" ? "bg-amber-50 text-amber-700" :
                          r.urgency_level === "Moderate" ? "bg-blue-50 text-blue-600" :
                          "bg-slate-100 text-slate-500"
                        }`}>{r.urgency_level || "Moderate"}</span>
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                          r.status === "cancelled" ? "bg-slate-100 text-slate-500" :
                          r.status === "pending" ? "bg-amber-50 text-amber-700" :
                          "bg-blue-50 text-blue-600"
                        }`}>{r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "Pending"}</span>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-slate-500 hidden md:table-cell">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Donations Tab */}
        {activeTab === "donations" && (
          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
            <div className="px-4 md:px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Donation History</h3>
              <p className="text-xs text-slate-500 mt-0.5">Completed and fulfilled donations across the platform.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase">Donor</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase">Blood Group</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Bank</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Units</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Verified On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allDonations.filter((d) => d.status === "verified").length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No fulfilled donations yet.</td>
                    </tr>
                  )}
                  {allDonations.filter((d) => d.status === "verified").map((d) => (
                    <tr key={d.donation_id || d.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 md:px-6 py-3 font-semibold text-slate-800">{d.donor_name || "—"}</td>
                      <td className="px-4 md:px-6 py-3">
                        <span className="font-bold text-red">{d.blood_group || "—"}</span>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-slate-500 hidden md:table-cell">{d.blood_bank_name || d.hospital || "—"}</td>
                      <td className="px-4 md:px-6 py-3 text-slate-600 hidden md:table-cell">{d.donated_units || "—"}</td>
                      <td className="px-4 md:px-6 py-3 text-slate-500 hidden md:table-cell">
                        {d.verified_at ? new Date(d.verified_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "camps" && (
          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
            <div className="px-4 md:px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">All Blood Donation Camps</h3>
            </div>
            <div className="p-4 md:p-6">
              {camps.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No camps registered yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Title</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Venue</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Blood Bank</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {camps.map((camp) => (
                        <tr key={camp.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3 font-semibold text-slate-800">{camp.title}</td>
                          <td className="px-4 py-3 text-slate-600">{camp.date}</td>
                          <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{camp.venue || "—"}</td>
                          <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{camp.blood_bank_name || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              camp.status === "completed" ? "bg-green-50 text-green-600" :
                              camp.status === "ongoing" || camp.date === new Date().toISOString().split("T")[0] ? "bg-blue-50 text-blue-600" :
                              "bg-amber-50 text-amber-700"
                            }`}>
                              {camp.date === new Date().toISOString().split("T")[0] ? "Today" : camp.status || "upcoming"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
