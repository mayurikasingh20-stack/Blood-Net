import { Link, useLocation } from "react-router-dom";
import { LogOut, Droplet } from "lucide-react";

export default function Sidebar({
  items = [],
  open = true,
  onClose,
  onLogout,
  title = "Admin Portal",
  subtitle = "Central Region HQ",
}) {
  const location = useLocation();

  const content = (
    <aside className="flex h-full w-64 flex-col bg-gradient-to-b from-red-100 to-red-50 border-r border-red-200 shadow-lg">
      <div className="px-5 pt-6 pb-4 border-b border-red-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-md shadow-red-200">
            <Droplet size={20} className="text-white fill-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-700 tracking-tight">Blood Net</p>
            <p className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">{title}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4">
        {items.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                active
                  ? "bg-white/90 text-red-600 font-semibold shadow-sm border border-red-200"
                  : "text-slate-500 hover:text-red-600 hover:bg-white/60"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${active ? "text-red-400" : ""}`}>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-300" />}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-3 border-t border-red-100">
        <button
          onClick={() => { onClose?.(); onLogout?.(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-slate-400 hover:text-red-500 hover:bg-white/60"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-40">{content}</div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={onClose}
          />
          <div className="relative h-full">{content}</div>
        </div>
      )}
    </>
  );
}
