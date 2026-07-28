import { motion } from "framer-motion";
import { Droplets } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

export default function About() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <motion.div className="mb-12 text-center" {...fadeUp}>
          <span className="inline-flex items-center gap-2 text-red font-bold text-sm uppercase tracking-wider bg-red/10 px-4 py-1.5 rounded-full mb-4">
            <Droplets size={16} /> Our Story &amp; Mission
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
            About Blood Net
          </h1>
          <div className="max-w-3xl mx-auto space-y-6 text-sm md:text-base text-slate-600 leading-relaxed">
            <p className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
              What started as a spreadsheet tracking donors for one hospital in Jodhpur is now a live network
              linking patients, verified donors, and licensed blood banks — built so an urgent request is never
              stuck in a phone tree at 2 a.m.
            </p>
            <p className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
              Blood Net exists to close the critical gap between someone needing blood and someone willing to give it —
              providing real-time, transparent visibility into who has what, and where, when seconds count.
            </p>
            <p className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
              Our platform connects donors, patients, and blood banks across India, making it easier than ever
              to find and donate blood in times of need. We believe that no one should suffer due to the lack of
              a timely blood donation.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
