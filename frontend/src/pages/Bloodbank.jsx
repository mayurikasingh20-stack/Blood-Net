import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { Droplets, AlertTriangle, Bell, CheckCircle, Activity, ThumbsUp, XCircle, MapPin, Calendar, Edit3, Trash2, Plus, X, RefreshCw, LocateFixed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import { getBloodBankDashboard, getInventory, getNotifications, getOpenRequests, getMyCamps, createCamp, updateCamp, deleteCamp, fulfillBloodRequest } from "../services/dashboardService";
import BloodMap from "../components/shared/BloodMap";
import api from "../services/api";
import { BLOOD_GROUPS } from "../utils/constants";
import NotificationPanel from "../components/shared/NotificationPanel";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function CampLocationButton({ onLocationFound }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 15);
        onLocationFound({ lat: latitude, lng: longitude });
        setLocating(false);
      },
      () => {
        alert("Unable to access your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
    );
  }, [map, onLocationFound]);

  return (
    <button
      type="button"
      onClick={handleLocate}
      disabled={locating}
      className="absolute top-3 right-3 z-[1000] bg-white rounded-lg shadow-md border border-slate-200 p-2 hover:bg-slate-50 transition disabled:opacity-60"
      title="Use my current location"
    >
      <LocateFixed size={16} className={locating ? "text-red animate-pulse" : "text-slate-600"} />
    </button>
  );
}

function CampClickMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? (
    <Marker
      draggable={true}
      position={[position.lat, position.lng]}
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          onPositionChange({ lat, lng });
        },
      }}
    />
  ) : null;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

export default function BloodBankDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [openBloodRequests, setOpenBloodRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [camps, setCamps] = useState([]);
  const [showCampModal, setShowCampModal] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [campForm, setCampForm] = useState({ title: "", description: "", date: "", time: "", venue: "", address: "", lat: "", lng: "" });
  const [campSaving, setCampSaving] = useState(false);
  const [fulfillingId, setFulfillingId] = useState(null);
  const [respondedIds, setRespondedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashData, invData, reqRes, openReqData, notifData, campsData] = await Promise.all([
        getBloodBankDashboard().catch(() => null),
        getInventory().catch(() => ({ inventory: [] })),
        api.get("/blood-request/my-requests").catch(() => ({ data: { blood_requests: [] } })),
        getOpenRequests().catch(() => ({ blood_requests: [] })),
        getNotifications().catch(() => ({ notifications: [] })),
        getMyCamps().catch(() => ({ camps: [] })),
      ]);
      setDashboard(dashData);
      setInventory(Array.isArray(invData?.inventory) ? invData.inventory : []);
      setRequests(Array.isArray(reqRes.data?.blood_requests) ? reqRes.data.blood_requests : []);
      setOpenBloodRequests(openReqData?.blood_requests || []);
      setNotifications(notifData?.notifications || []);
      setCamps(Array.isArray(campsData?.camps) ? campsData.camps : []);
    } catch {
      setError("Could not load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const sumUnits = (items) => items.reduce((s, i) => s + (i.units || 0), 0);
  const totalAvailable = sumUnits(inventory.filter((i) => i.status === "AVAILABLE"));
  const totalUnits = sumUnits(inventory);

  const lowStock = BLOOD_GROUPS.filter((bg) => {
    const units = sumUnits(inventory.filter((i) => i.blood_group === bg && i.status === "AVAILABLE"));
    return units < 3;
  });

  const nearExpiry = inventory.filter((item) => {
    if (!item.expiry_date) return false;
    const daysLeft = Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 7 && item.status === "AVAILABLE";
  });

  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  async function handleFulfill(requestId) {
    setFulfillingId(requestId);
    try {
      await fulfillBloodRequest(requestId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fulfill request.");
    } finally {
      setFulfillingId(null);
    }
  }

  async function handleCampSubmit(e) {
    e.preventDefault();
    setCampSaving(true);
    try {
      const payload = { ...campForm };
      if (payload.lat) payload.lat = parseFloat(payload.lat);
      else delete payload.lat;
      if (payload.lng) payload.lng = parseFloat(payload.lng);
      else delete payload.lng;

      if (editingCamp) {
        await updateCamp(editingCamp.id, payload);
      } else {
        await createCamp(payload);
      }
      setShowCampModal(false);
      fetchData();
    } catch {
      alert("Failed to save camp.");
    } finally {
      setCampSaving(false);
    }
  }

  const campPositionChange = useCallback((pos) => {
    setCampForm((prev) => ({ ...prev, lat: pos.lat, lng: pos.lng }));
  }, []);

  const campMarkerPos = campForm.lat && campForm.lng
    ? { lat: parseFloat(campForm.lat), lng: parseFloat(campForm.lng) }
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red mb-1 block">Blood Bank Dashboard</span>
            {dashboard?.verification_status && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                dashboard.verification_status === "approved"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {dashboard.verification_status === "approved" ? "Verified" : dashboard.verification_status}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{user?.name || "Blood Bank"}</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of inventory, requests, and blood supply.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }}
        initial="initial" whileInView="whileInView" viewport={{ once: true }}>
        {[
          { icon: Droplets, label: "Total Units", value: totalUnits, color: "text-red", bg: "bg-red/10" },
          { icon: CheckCircle, label: "Blood Groups", value: 8, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: AlertTriangle, label: "Low Stock", value: lowStock.length, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: Bell, label: "Pending Requests", value: pendingRequests, color: "text-red", bg: "bg-red-10" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}
            className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.bg}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <motion.div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm" {...fadeUp}>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-red" /> Blood Group Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BLOOD_GROUPS.map((bg) => {
                const units = sumUnits(inventory.filter((i) => i.blood_group === bg && i.status === "AVAILABLE"));
                const isLow = units < 3;
                return (
                  <div key={bg} className={`rounded-xl p-3 text-center border ${isLow ? "bg-red-50 border-red-200" : "bg-white border-slate-100"}`}>
                    <p className={`text-lg font-bold ${isLow ? "text-red" : "text-slate-900"}`}>{bg}</p>
                    <p className={`text-xs mt-0.5 ${isLow ? "text-red" : "text-slate-500"}`}>{units} unit{units !== 1 ? "s" : ""}</p>
                    {isLow && <span className="text-[10px] font-bold text-red flex items-center justify-center gap-1 mt-1"><AlertTriangle size={10} /> Low</span>}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {(lowStock.length > 0 || nearExpiry.length > 0) && (
            <motion.div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm" {...fadeUp}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" /> Alerts
                </h3>
                <button onClick={() => navigate("/bloodbank/emergency")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red text-white rounded-xl text-xs font-bold hover:bg-red-700 transition">
                  Raise Request
                </button>
              </div>
              <div className="space-y-2">
                {lowStock.map((bg) => (
                  <div key={bg} className="flex items-center justify-between text-sm px-3 py-2 bg-amber-50 rounded-xl">
                    <span className="font-semibold text-amber-700">{bg} - Low Stock</span>
                    <span className="text-xs text-amber-600">{sumUnits(inventory.filter((i) => i.blood_group === bg && i.status === "AVAILABLE"))} units</span>
                  </div>
                ))}
                {nearExpiry.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm px-3 py-2 bg-red-10 rounded-xl">
                    <span className="font-semibold text-red">{item.blood_group} - Expiring</span>
                    <span className="text-xs text-red">{Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))} days</span>
                  </div>
                ))}
              </div>
              {lowStock.length > 0 && (
                <button onClick={() => navigate("/bloodbank/emergency")}
                  className="mt-3 w-full py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-100 transition border border-amber-200">
                  Request blood from donors
                </button>
              )}
            </motion.div>
          )}

          {pendingRequests > 0 && (
            <motion.div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm" {...fadeUp}>
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Bell size={16} className="text-blue-500" /> My Pending Requests
              </h3>
              <div className="space-y-2">
                {requests.filter((r) => r.status === "pending").slice(0, 3).map((req) => (
                  <div key={req.id} className="flex items-center justify-between text-sm px-3 py-2 bg-blue-50 rounded-xl">
                    <span className="text-slate-600">{req.blood_group} - {req.hospital}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{req.units} units</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* All Open Blood Requests */}
          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={16} className="text-red" />
                Blood Requests
              </h3>
            </div>
            <div className="p-4 md:p-6">
              {openBloodRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">No open requests</p>
                  <p className="text-xs text-slate-400 mt-1">All requests have been fulfilled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {openBloodRequests.slice(0, 5).map((req) => (
                    <div key={req.id} className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-slate-50 hover:bg-red-50 transition">
                      <div className="w-12 h-12 rounded-xl bg-red/10 flex items-center justify-center text-red font-bold text-base flex-shrink-0">
                        {req.blood_group}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{req.hospital}</p>
                        <p className="text-xs text-slate-500 truncate">{req.city} &middot; {req.units} unit(s) needed</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          req.urgency_level === "Critical" ? "bg-red/10 text-red" :
                          req.urgency_level === "High" ? "bg-amber-50 text-amber-700" :
                          "bg-blue-50 text-blue-600"
                        }`}>
                          {req.urgency_level}
                        </span>
                        <button
                          onClick={() => handleFulfill(req.id)}
                          disabled={fulfillingId === req.id}
                          className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition disabled:opacity-50"
                        >
                          {fulfillingId === req.id ? "..." : "Fulfill"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Nearby Blood Banks Map */}
          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
            <div className="px-4 md:px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={16} className="text-red" />
                Nearby Blood Banks & Camps
              </h3>
            </div>
            <div className="p-4 md:p-6"><BloodMap showCamps={true} height="320px" /></div>
          </motion.div>
        </div>

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

      {/* ==================== CAMPS SECTION ==================== */}
      <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={16} className="text-red" />
            Camps
          </h3>
          <button
            onClick={() => {
              setEditingCamp(null);
              setCampForm({ title: "", description: "", date: "", time: "", venue: "", address: "", lat: "", lng: "" });
              setShowCampModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
          >
            <Plus size={14} /> Set Up Camp
          </button>
        </div>
        <div className="p-4 md:p-6">
          {camps.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No camps set up yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "Set Up Camp" to organize a blood donation camp.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {camps.map((camp) => (
                <div key={camp.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-red/20 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{camp.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{camp.venue || camp.address}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      camp.status === "completed" ? "bg-green-50 text-green-600" :
                      camp.date === new Date().toISOString().split("T")[0] ? "bg-blue-50 text-blue-600" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {camp.date === new Date().toISOString().split("T")[0] ? "Today" : camp.status || "upcoming"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                    <p>Date: {camp.date}</p>
                    {camp.time && <p>Time: {camp.time}</p>}
                  </div>
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setEditingCamp(camp);
                        setCampForm({
                          title: camp.title || "",
                          description: camp.description || "",
                          date: camp.date || "",
                          time: camp.time || "",
                          venue: camp.venue || "",
                          address: camp.address || "",
                          lat: camp.lat ?? "",
                          lng: camp.lng ?? "",
                        });
                        setShowCampModal(true);
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-red transition"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Delete this camp?")) return;
                        try {
                          await deleteCamp(camp.id);
                          fetchData();
                        } catch {
                          alert("Failed to delete camp.");
                        }
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-red hover:text-red-700 transition"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ===== CAMP MODAL ===== */}
      {showCampModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCampModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">{editingCamp ? "Edit Camp" : "Set Up New Camp"}</h3>
              <button onClick={() => setShowCampModal(false)} className="p-1 hover:bg-slate-100 rounded-lg transition"><X size={18} /></button>
            </div>
            <form onSubmit={handleCampSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Camp Title *</label>
                <input value={campForm.title} onChange={(e) => setCampForm({ ...campForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Description</label>
                <textarea value={campForm.description} onChange={(e) => setCampForm({ ...campForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Date *</label>
                  <input type="date" value={campForm.date} onChange={(e) => setCampForm({ ...campForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Time</label>
                  <input type="time" value={campForm.time} onChange={(e) => setCampForm({ ...campForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Venue *</label>
                <input value={campForm.venue} onChange={(e) => setCampForm({ ...campForm, venue: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Address</label>
                <textarea value={campForm.address} onChange={(e) => setCampForm({ ...campForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20" rows={2} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Location on Map</label>
                <p className="text-xs text-slate-400 mb-2">Click on the map to place a marker or drag to adjust.</p>
                <div className="relative rounded-xl overflow-hidden border border-slate-200" style={{ height: "220px" }}>
                  <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CampClickMarker position={campMarkerPos} onPositionChange={campPositionChange} />
                    <CampLocationButton onLocationFound={campPositionChange} />
                  </MapContainer>
                </div>
                {campForm.lat && campForm.lng && (
                  <p className="text-xs text-stone-500 mt-1">
                    Selected: {parseFloat(campForm.lat).toFixed(6)}, {parseFloat(campForm.lng).toFixed(6)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={campSaving}
                  className="flex-1 py-2.5 bg-red text-white rounded-xl text-sm font-bold hover:bg-red-700 transition disabled:opacity-50">
                  {campSaving ? "Saving..." : editingCamp ? "Update Camp" : "Create Camp"}
                </button>
                <button type="button" onClick={() => setShowCampModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
