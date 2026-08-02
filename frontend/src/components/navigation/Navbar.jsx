import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { Droplet, X, Menu, Home, Info, GraduationCap, Mail, LogIn } from "lucide-react";

const linkIcons = {
  Home: Home,
  About: Info,
  Education: GraduationCap,
  Contact: Mail,
};

export default function Navbar({
  brand = "Blood Net",
  brandTo = "/",
  links = [],
  rightContent,
  className = "",
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (to) => location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm ${className}`}
      >
        <div className="flex justify-between items-center px-4 md:px-8 h-16 w-full max-w-6xl mx-auto">
          <Link
            to={brandTo}
            className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-[#7F1D1D] flex items-center justify-center shadow-md shadow-red/20">
              <Droplet size={18} className="text-white fill-white" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-800 tracking-tight">{brand}</span>
              <p className="text-[10px] text-slate-400 -mt-0.5">Life Saving Platform</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-semibold transition-colors ${
                  isActive(link.to) ? "text-[#7F1D1D]" : "text-slate-500 hover:text-[#7F1D1D]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {rightContent || (
              <Link to="/login" className="btn-primary text-sm">Sign In</Link>
            )}
          </nav>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-slate-500 hover:text-[#7F1D1D] p-2 hover:bg-slate-100 rounded-xl transition"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {mobileOpen && createPortal(
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-[#7F1D1D] flex items-center justify-center shadow-md shadow-red/20">
                  <Droplet size={18} className="text-white fill-white" />
                </div>
                <span className="text-base font-bold text-slate-800">{brand}</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
              {links.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No links available</p>
              )}
              {links.map((link) => {
                const active = isActive(link.to);
                const IconComponent = linkIcons[link.label] || Home;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-[#7F1D1D]/5 text-[#7F1D1D] font-semibold border border-[#7F1D1D]/10"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#7F1D1D]"
                    }`}
                  >
                    <IconComponent size={18} className={active ? "text-[#7F1D1D]" : "text-slate-400"} />
                    <span className="text-sm font-medium">{link.label}</span>
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7F1D1D]" />}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7F1D1D] text-white rounded-full text-sm font-bold hover:bg-red-light transition shadow-md shadow-red/20"
              >
                <LogIn size={16} />
                Sign In
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}