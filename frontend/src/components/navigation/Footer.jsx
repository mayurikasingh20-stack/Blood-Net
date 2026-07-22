import { Link } from "react-router-dom";
import { Droplet } from "lucide-react";

export default function Footer({
  brand = "Blood Net",
  links = [],
  className = "",
}) {
  if (links.length === 0) {
    return (
      <footer className={`w-full py-6 border-t border-slate-100 mt-8 bg-white ${className}`}>
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 gap-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-sm shadow-rose-200">
              <Droplet size={13} className="text-white fill-white" />
            </div>
            <span className="text-sm font-bold text-slate-700">{brand}</span>
            <span className="text-slate-300 text-xs">|</span>
            <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Blood Net. All rights reserved.</p>
          </div>
          <div className="flex gap-5">
            <Link className="text-xs text-slate-400 hover:text-red transition" to="#">Privacy Policy</Link>
            <Link className="text-xs text-slate-400 hover:text-red transition" to="#">Terms of Service</Link>
            <Link className="text-xs text-slate-400 hover:text-red transition" to="#">Contact</Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`bg-white border-t border-slate-100 py-10 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-sm shadow-rose-200">
              <Droplet size={15} className="text-white fill-white" />
            </div>
            <span className="text-sm font-bold text-slate-700">{brand}</span>
          </div>
          <div className="flex flex-wrap gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs text-slate-400 hover:text-red transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="text-center pt-6 border-t border-slate-50">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} {brand}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
