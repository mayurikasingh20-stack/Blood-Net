import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, LogIn } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={32} className="text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Unauthorized Access</h1>
        <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
          You do not have permission to access this page. Please log in with the correct account credentials.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red text-white rounded-full font-bold text-sm hover:bg-red-700 transition shadow-lg shadow-red/20"
        >
          <LogIn size={16} />
          Go to Login
        </Link>
      </motion.div>
    </div>
  );
}
