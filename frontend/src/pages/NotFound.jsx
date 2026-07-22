import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-20 h-20 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search size={32} className="text-red" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-3">404</h1>
        <p className="text-lg font-semibold text-slate-700 mb-2">Page Not Found</p>
        <p className="text-sm text-slate-500 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red text-white rounded-full font-bold text-sm hover:bg-red-700 transition shadow-lg shadow-red/20"
        >
          <Home size={16} />
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}
