import { motion } from "framer-motion";
import { Bell, CheckCircle, Droplets, X } from "lucide-react";
import { markAllNotificationsRead } from "../../services/dashboardService";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

function NotificationIcon({ type }) {
  if (type === "donation_acceptance" || type === "donation_verified") return <Droplets size={16} />;
  if (type === "blood_request_completed" || type === "blood_request") return <Droplets size={16} />;
  if (type?.includes("approval") || type?.includes("rejection")) return <Bell size={16} />;
  return <Bell size={16} />;
}

export default function NotificationPanel({ notifications = [], onClear }) {
  const unread = notifications.filter((n) => n.status === "unread");

  async function handleClearAll() {
    try {
      await markAllNotificationsRead();
      if (onClear) onClear();
    } catch {
      // silently fail
    }
  }

  return (
    <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm" {...fadeUp}>
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Bell size={16} className="text-red" />
          Notifications
        </h3>
        {unread.length > 0 && (
          <button onClick={handleClearAll} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red transition font-semibold">
            <X size={12} /> Clear All
          </button>
        )}
      </div>
      <div className="p-4 md:p-6">
        {unread.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={18} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No new notifications</p>
            <p className="text-xs text-slate-400 mt-1">You&apos;ll be notified when something happens</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {unread.slice(0, 10).map((n) => (
              <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50/50 hover:bg-red-50 transition">
                <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center text-red font-bold text-sm flex-shrink-0">
                  <NotificationIcon type={n.notification_type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                  <p className="text-xs text-slate-500 truncate">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-red/10 text-red rounded-full flex-shrink-0">New</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
