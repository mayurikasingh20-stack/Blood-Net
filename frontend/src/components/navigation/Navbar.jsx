import { Link } from "react-router-dom";
import { Droplet } from "lucide-react";

export default function Navbar({
  brand = "Blood Net",
  brandTo = "/",
  links = [],
  rightContent,
  className = "",
}) {
  return (
    <header
      className={`fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm ${className}`}
    >
      <div className="flex justify-between items-center px-4 md:px-8 h-16 w-full max-w-6xl mx-auto">
        <Link
          to={brandTo}
          className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-md shadow-rose-200">
            <Droplet size={18} className="text-white fill-white" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-800 tracking-tight">{brand}</span>
            <p className="text-[10px] text-slate-400 -mt-0.5">Life Saving Platform</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-stack-lg">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-slate-500 hover:text-red transition-colors font-semibold"
            >
              {link.label}
            </Link>
          ))}
          {rightContent || (
            <>
              <Link
                to="/login"
                className="bg-red text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red/20"
              >
                Sign In
              </Link>
            </>
          )}
        </nav>

        <button className="md:hidden text-on-surface-variant p-2">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>
  );
}
