import { Link, useLocation } from "react-router-dom";
import { LogOut, Droplet, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const itemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03 } }),
};

export default function Sidebar({
  items = [],
  open = false,
  onClose,
  onLogout,
  title = "Admin Portal",
}) {
  const location = useLocation();

  const content = (
    <aside className="flex h-full w-64 flex-col bg-white border-r border-slate-200 shadow-lg">
      <div className="px-5 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-[#7F1D1D] flex items-center justify-center shadow-md shadow-red/20">
            <Droplet size={20} className="text-white fill-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-800 tracking-tight">Blood Net</p>
            <p className="text-[10px] text-[#7F1D1D] uppercase tracking-wider font-semibold">{title}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4 overflow-y-auto">
        {items.map((item, idx) => {
          const active = location.pathname === item.to;
          return (
            <motion.div
              key={item.to}
              custom={idx}
              variants={itemVariants}
              initial="initial"
              animate="animate"
            >
              <Link
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-[#7F1D1D]/5 text-[#7F1D1D] font-semibold border border-[#7F1D1D]/10"
                    : "text-slate-500 hover:text-[#7F1D1D] hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7F1D1D]" />}
              </Link>
              {item.action && (
                <Link
                  to={item.action.to}
                  onClick={onClose}
                  className="mx-3 mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-[#7F1D1D]/10 bg-[#7F1D1D]/5 px-3 py-1.5 text-xs font-bold text-[#7F1D1D] transition hover:bg-[#7F1D1D] hover:text-white"
                >
                  <Plus size={13} /> {item.action.label}
                </Link>
              )}
            </motion.div>
          );
        })}
      </nav>
      <div className="px-3 py-3 border-t border-slate-100">
        <button
          onClick={() => { onClose?.(); onLogout?.(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:text-[#7F1D1D] hover:bg-slate-50"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-40">{content}</div>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative h-full"
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}