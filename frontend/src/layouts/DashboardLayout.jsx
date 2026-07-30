import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplet, Menu, Bell, CheckCircle, X, Home, Activity,
  Settings, MapPin, Droplets, Heart, Calendar,
} from "lucide-react";
import Sidebar from "../components/navigation/Sidebar";
import Footer from "../components/navigation/Footer";
import useAuth from "../context/useAuth";
import { getNotifications, markAllNotificationsRead } from "../services/dashboardService";

const pageTransition = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" },
};

export default function DashboardLayout({
  children,
  sidebarItems = [],
  title = "Admin Portal",
  subtitle = "Central Region HQ",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const displaySubtitle = user?.name || subtitle;

  const fetchNotifs = useCallback(async () => {
    const data = await getNotifications().catch(() => ({ notifications: [] }));
    setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user, fetchNotifs]);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = notifications.filter((n) => n.status === "unread");

  async function handleMarkAllRead() {
    await markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 md:pb-0 md:pl-64">
      {/* Top Header */}
      <header className="fixed top-0 right-0 left-0 lg:left-64 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm h-16 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-[#7F1D1D] flex items-center justify-center shadow-md shadow-red/20">
            <Droplet size={18} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight">Blood Net</h1>
            <p className="text-[10px] text-slate-400 -mt-0.5">Life Saving Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              className="relative text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition"
            >
              <Bell size={20} />
              {unread.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#7F1D1D] text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                  {unread.length > 9 ? "9+" : unread.length}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Bell size={14} className="text-[#7F1D1D]" />
                      Notifications
                    </h3>
                    {unread.length > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-slate-400 hover:text-[#7F1D1D] transition font-semibold flex items-center gap-1">
                        <CheckCircle size={12} /> Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {unread.length === 0 ? (
                      <div className="text-center py-6">
                        <CheckCircle size={24} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500">No new notifications</p>
                      </div>
                    ) : (
                      unread.slice(0, 10).map((n) => (
                        <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#7F1D1D]/5 transition cursor-pointer">
                          <div className="w-8 h-8 rounded-lg bg-[#7F1D1D]/10 flex items-center justify-center text-[#7F1D1D] flex-shrink-0 mt-0.5">
                            <Droplet size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                            </p>
                          </div>
                          <span className="w-2 h-2 bg-[#7F1D1D] rounded-full flex-shrink-0 mt-2" />
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={handleLogout}
        title={title}
        subtitle={displaySubtitle}
      />

      {/* Main Content with Page Transitions */}
      <motion.main
        className="pt-24 px-4 md:px-8 max-w-6xl mx-auto pb-12"
        {...pageTransition}
        key={window.location.pathname}
      >
        {children || <Outlet />}
      </motion.main>

      <Footer className="md:pl-64" />

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 flex justify-around items-center h-16 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-pb">
        {sidebarItems.slice(0, 5).map((item) => {
          const IconComponent = getIconForNav(item.icon);
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center text-slate-400 active:scale-90 transition-transform min-w-0 px-1"
              onClick={() => setMenuOpen(false)}
            >
              <IconComponent size={18} />
              <span className="text-[9px] font-semibold mt-0.5 truncate max-w-full">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function getIconForNav(iconName) {
  const iconMap = {
    dashboard: Activity,
    emergency: Droplets,
    calendar_month: Calendar,
    location_on: MapPin,
    history: Activity,
    bloodtype: Droplet,
    group: Heart,
    location_city: MapPin,
    volunteer_activism: Heart,
    mail: Bell,
    map: MapPin,
    settings: Settings,
    notification_important: Bell,
  };
  return iconMap[iconName] || Home;
}