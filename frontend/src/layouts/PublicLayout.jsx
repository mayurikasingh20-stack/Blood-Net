import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/navigation/Navbar";
import Footer from "../components/navigation/Footer";

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" },
};

export default function PublicLayout({
  children,
  navLinks = [],
  footerLinks = [],
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      <Navbar links={navLinks} />
      <motion.main className="flex-1 pt-16" {...pageTransition} key={window.location.pathname}>
        {children || <Outlet />}
      </motion.main>
      <Footer links={footerLinks} />
    </div>
  );
}
