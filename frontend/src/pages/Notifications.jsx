import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Mail, MailOpen, Loader, AlertCircle, Trash2 } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../services/dashboardService";

const typeIcons = {
  emergency: AlertCircle,
  general: Bell,
  request: Mail,
  donation: Bell,
};

const typeColors = {
  emergency: "text-red bg-red/10",
  general: "text-blue-600 bg-blue-50",
  request: "text-amber-600 bg-amber-50",
  donation: "text-emerald-600 bg-emerald-50",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data?.notifications || []);
    } catch {
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "read" } : n))
      );
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
    } catch { /* ignore */ }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader className="animate-spin text-red" size={32} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red bg-red/10 px-4 py-3 rounded-xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <motion.div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={28} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 font-medium">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">We will notify you when something arrives</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = typeIcons[n.notification_type] || Bell;
            const colorClass = typeColors[n.notification_type] || typeColors.general;
            const isUnread = n.status === "unread";

            return (
              <div key={n.id}
                onClick={() => isUnread && handleMarkRead(n.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  isUnread
                    ? "bg-white border-red/10 shadow-sm hover:shadow-md"
                    : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isUnread ? "font-bold text-slate-900" : "text-slate-600"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isUnread && <span className="w-2 h-2 rounded-full bg-red" title="Unread" />}
                </div>
              </div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
