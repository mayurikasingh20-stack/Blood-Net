import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Activity,
  CalendarX,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  Loader,
} from "lucide-react";
import useAuth from "../context/useAuth";
import {
  getInventory,
  adjustInventory,
  deleteInventoryItem,
} from "../services/dashboardService";
import { BLOOD_GROUPS } from "../utils/constants";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const statusColors = {
  AVAILABLE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  LOW_STOCK: "bg-amber-50 text-amber-700 border-amber-200",
  OUT_OF_STOCK: "bg-red-50 text-red border-red-200",
  EXPIRED: "bg-red-50 text-red border-red-200",
};

const statusLabels = {
  AVAILABLE: "Available",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
  EXPIRED: "Expired",
};

const ACTIONS = [
  { value: "Add Units", label: "Add Units" },
  { value: "Reduce Units", label: "Reduce Units" },
];

export default function BloodBankInventory() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    action: "Add Units",
    blood_group: "",
    units: 1,
  });

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const invData = await getInventory();
      setInventory(Array.isArray(invData?.inventory) ? invData.inventory : []);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Could not load inventory.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  useEffect(() => {
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, [fetchInventory]);

  const filteredInventory = inventory.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.blood_group || "").toLowerCase().includes(term) ||
      (item.id || "").toString().includes(term)
    );
  });

  const sumUnits = (items) => items.reduce((s, i) => s + (i.units || 0), 0);

  const lowStock = inventory.filter((i) => i.status === "LOW_STOCK");

  const nearExpiry = inventory.filter((item) => {
    if (!item.expiry_date) return false;
    const daysLeft = Math.ceil(
      (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft >= 0 && daysLeft <= 7 && (item.status === "AVAILABLE" || item.status === "LOW_STOCK");
  });

  const totalAvailable = sumUnits(inventory.filter((i) => i.status === "AVAILABLE"));
  const totalUnits = sumUnits(inventory);

  function resetForm() {
    setFormData({ action: "Add Units", blood_group: "", units: 1 });
    setFormErrors({});
    setSuccess("");
  }

  function validateForm() {
    const errors = {};
    if (!formData.blood_group) errors.blood_group = "Select a blood group";
    const u = Number(formData.units);
    if (!u || u < 1 || !Number.isInteger(u)) errors.units = "Units must be a positive integer";
    const currentUnits = sumUnits(inventory.filter((i) => i.blood_group === formData.blood_group && i.status === "AVAILABLE"));
    if (formData.action === "Reduce Units" && currentUnits < u) {
      errors.units = "Cannot reduce more units than are currently available.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormErrors({});
    setSuccess("");
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        action: formData.action,
        blood_group: formData.blood_group,
        units: Number(formData.units),
      };
      const res = await adjustInventory(payload);
      setSuccess(res.message || "Inventory updated successfully.");
      resetForm();
      fetchInventory();
      setTimeout(() => { setShowModal(false); setSuccess(""); }, 2000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setFormErrors(data.errors);
      } else {
        setFormErrors({ general: data?.error || "Could not update inventory." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this inventory item?")) return;
    try {
      await deleteInventoryItem(id);
      fetchInventory();
    } catch {
      alert("Could not delete item.");
    }
  }

  function handleCurrentUnits(bg) {
    return sumUnits(inventory.filter((i) => i.blood_group === bg && i.status === "AVAILABLE"));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red mb-1 block">Inventory Management</span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{user?.name || "Blood Bank"}</h1>
          <p className="text-sm text-slate-500 mt-1">Manage blood units, track stock levels, and monitor supply.</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="px-5 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red/20">
          <Plus size={16} /> Update Inventory
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { icon: Droplets, label: "Total Units", value: totalUnits, color: "text-red", bg: "bg-red/10" },
          { icon: CheckCircle, label: "Available", value: totalAvailable, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: AlertTriangle, label: "Low Stock Types", value: lowStock.length, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: Clock, label: "Unique Types", value: inventory.length, color: "text-blue-600", bg: "bg-blue-50" },
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" {...fadeUp}>
            {BLOOD_GROUPS.map((bg) => {
              const item = inventory.find((i) => i.blood_group === bg);
              const units = item ? item.units : 0;
              const isLow = item && item.status === "LOW_STOCK";
              const isOut = item && item.status === "OUT_OF_STOCK";
              const isExpired = item && item.status === "EXPIRED";
              const isEmpty = !item || units === 0;
              const cardClass = isExpired ? "bg-red-50 border-red-200" :
                isOut ? "bg-slate-100 border-slate-200" :
                isLow ? "bg-amber-50 border-amber-200" :
                "bg-white border-slate-100";
              const textClass = isExpired ? "text-red" :
                isOut ? "text-slate-400" :
                isLow ? "text-amber-600" :
                "text-slate-900";
              return (
                <div key={bg} className={`rounded-xl p-3 md:p-4 border text-center ${cardClass}`}>
                  <p className={`text-lg font-bold ${textClass}`}>{bg}</p>
                  <p className={`text-xs mt-0.5 ${textClass}`}>
                    {isEmpty ? "No stock" : `${units} unit${units !== 1 ? "s" : ""}`}
                  </p>
                  {isLow && <span className="text-[10px] font-bold text-amber-600 flex items-center justify-center gap-1 mt-1"><AlertTriangle size={10} /> Low</span>}
                  {isOut && <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1 mt-1"><XCircle size={10} /> Out</span>}
                  {isExpired && <span className="text-[10px] font-bold text-red flex items-center justify-center gap-1 mt-1"><CalendarX size={10} /> Expired</span>}
                </div>
              );
            })}
          </motion.div>

          <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
            <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity size={16} className="text-red" /> Inventory Units
              </h3>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by blood group or ID..."
                  className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-red/20" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Blood Group</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Units</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Collection</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Expiry</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 md:px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInventory.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">{searchTerm ? "No matching units found." : "No inventory units yet. Add your first unit."}</td></tr>
                  )}
                  {filteredInventory.map((item) => {
                    const isExpiring = item.expiry_date && Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) <= 7 && item.status === "AVAILABLE";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 md:px-6 py-3"><span className="font-bold text-red">{item.blood_group}</span></td>
                        <td className="px-4 md:px-6 py-3 text-slate-600">{item.units} units</td>
                        <td className="px-4 md:px-6 py-3 text-slate-500 hidden md:table-cell">{item.collection_date || "—"}</td>
                        <td className="px-4 md:px-6 py-3 hidden md:table-cell">
                          <span className={`${isExpiring ? "text-red font-semibold" : "text-slate-500"}`}>
                            {item.expiry_date || "—"}
                            {isExpiring && <span className="ml-1 text-[10px]">(Expiring)</span>}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[item.status] || statusColors.AVAILABLE}`}>
                            {statusLabels[item.status] || item.status || "Available"}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red transition"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {inventory.length > 0 && (
              <div className="px-4 md:px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
                Showing {filteredInventory.length} of {inventory.length} units
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          {lowStock.length > 0 && (
            <motion.div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm" {...fadeUp}>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-amber-500" /> Low Stock Alert
              </h4>
              <div className="space-y-2">
                {lowStock.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-amber-600">{item.blood_group}</span>
                    <span className="text-xs text-slate-500">{item.units} units</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {nearExpiry.length > 0 && (
            <motion.div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm" {...fadeUp}>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <CalendarX size={15} className="text-red" /> Expiring Soon (7 days)
              </h4>
              <div className="space-y-2">
                {nearExpiry.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{item.blood_group} - {item.units} units</span>
                    <span className="text-xs text-red">{Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))} days</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Update Blood Inventory</h3>
              <button onClick={() => { resetForm(); setShowModal(false); }} className="p-1.5 rounded-lg hover:bg-slate-100 transition"><XCircle size={20} className="text-slate-400" /></button>
            </div>

            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 mb-4">
                <CheckCircle size={16} /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Inventory Action <span className="text-red">*</span></label>
                <select value={formData.action} onChange={(e) => { setFormData((p) => ({ ...p, action: e.target.value })); setFormErrors((p) => ({ ...p, action: "" })); }}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red/20 ${formErrors.action ? "border-red" : "border-slate-200"}`} required>
                  {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
                {formErrors.action && <p className="text-xs text-red mt-1">{formErrors.action}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Blood Group <span className="text-red">*</span></label>
                <select value={formData.blood_group} onChange={(e) => { setFormData((p) => ({ ...p, blood_group: e.target.value })); setFormErrors((p) => ({ ...p, blood_group: "" })); }}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red/20 ${formErrors.blood_group ? "border-red" : "border-slate-200"}`} required>
                  <option value="" disabled>Select blood group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg} {formData.action === "Reduce Units" ? `(Current: ${handleCurrentUnits(bg)} units)` : ""}
                    </option>
                  ))}
                </select>
                {formErrors.blood_group && <p className="text-xs text-red mt-1">{formErrors.blood_group}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Units <span className="text-red">*</span></label>
                <input type="number" min={1} step={1} value={formData.units} onChange={(e) => { setFormData((p) => ({ ...p, units: e.target.value })); setFormErrors((p) => ({ ...p, units: "" })); }}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red/20 ${formErrors.units ? "border-red" : "border-slate-200"}`} required />
                {formErrors.units && <p className="text-xs text-red mt-1">{formErrors.units}</p>}
                {formData.blood_group && formData.action === "Reduce Units" && (
                  <p className="text-xs text-slate-400 mt-1">
                    Available: {handleCurrentUnits(formData.blood_group)} units
                  </p>
                )}
              </div>
              {formErrors.general && (
                <div className="flex items-center gap-2 text-sm text-red bg-red/10 px-4 py-3 rounded-xl">
                  <AlertCircle size={16} /> {formErrors.general}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { resetForm(); setShowModal(false); }}
                  className="w-1/3 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="w-2/3 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <Loader size={16} className="animate-spin" /> : null}
                  {submitting ? "Updating..." : "Update Inventory"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
