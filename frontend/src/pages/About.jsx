import { useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  HeartHandshake,
  IndianRupee,
  Shield,
  Activity,
  CalendarCheck2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Quote,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const compatibilityData = [
  { type: "O-", gives: "Everyone (Universal Donor)", receives: "O-" },
  { type: "O+", gives: "O+, A+, B+, AB+", receives: "O-, O+" },
  { type: "A-", gives: "A-, A+, AB-, AB+", receives: "O-, A-" },
  { type: "A+", gives: "A+, AB+", receives: "O-, O+, A-, A+" },
  { type: "B-", gives: "B-, B+, AB-, AB+", receives: "O-, B-" },
  { type: "B+", gives: "B+, AB+", receives: "O-, O+, B-, B+" },
  { type: "AB-", gives: "AB-, AB+", receives: "O-, A-, B-, AB-" },
  { type: "AB+", gives: "AB+ Only (Universal Recipient)", receives: "All Types" },
];

const donationSteps = [
  { icon: Activity, title: "Registration", desc: "Fill out a basic health and medical history questionnaire at the desk." },
  { icon: Shield, title: "Mini-Physical", desc: "A brief check of temperature, blood pressure, pulse, and hemoglobin." },
  { icon: Droplets, title: "The Donation", desc: "Actual donation takes roughly 8 to 10 minutes to draw one unit of blood." },
  { icon: CalendarCheck2, title: "Refreshment", desc: "Enjoy snacks and drinks in the recovery area for 10-15 minutes." },
];

const faqs = [
  { q: "Who is eligible to donate blood in India?", a: "Generally, any healthy adult aged 18-65 years, weighing at least 45 kg, with hemoglobin of 12.5 g/dL or higher. You should not have active infections or uncontrolled chronic illnesses." },
  { q: "How often can I donate blood?", a: "Healthy males can donate whole blood every 90 days, females every 120 days to allow the body's iron levels to fully recover." },
  { q: "Is it safe to donate blood?", a: "Absolutely. All licensed blood banks use sterile, single-use, disposable equipment. There is zero risk of contracting infections from donating." },
  { q: "What should I eat before donating?", a: "Eat a iron-rich meal 2-3 hours before donating. Avoid fatty foods. Stay hydrated by drinking plenty of water." },
  { q: "How long does the process take?", a: "The entire process - from registration to refreshments - typically takes about 45-60 minutes. The actual donation is only 8-10 minutes." },
];

export default function About() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Hero */}
        <motion.div className="mb-12 text-center md:text-left" {...fadeUp}>
          <span className="inline-flex items-center gap-2 text-red font-bold text-sm uppercase tracking-wider bg-red/10 px-4 py-1.5 rounded-full mb-4">
            <Droplets size={16} /> Our Story &amp; Mission
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
            About Blood Net
          </h1>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 text-sm md:text-base text-slate-600 leading-relaxed">
            <p className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm">
              What started as a spreadsheet tracking donors for one hospital in Jodhpur is now a live network
              linking patients, verified donors, and licensed blood banks - built so an urgent request is never
              stuck in a phone tree at 2 a.m.
            </p>
            <p className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm">
              Blood Net exists to close the critical gap between someone needing blood and someone willing to give it -
              providing real-time, transparent visibility into who has what, and where, when seconds count.
            </p>
          </div>
        </motion.div>

        <hr className="border-slate-200 my-12" />

        {/* Info Cards */}
        <motion.div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-16" variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
          {[
            {
              icon: Droplets,
              title: "Diseases & Blood Types",
              desc: "Not every blood type is compatible. Understanding cross-matching rules is why every unit on Blood Net's partner banks is carefully typed before transfusions.",
              id: "diseases",
            },
            {
              icon: HeartHandshake,
              title: "Post Donation Care",
              desc: "After donating, rest for 10-15 minutes, drink plenty of fluids, and avoid heavy lifting. Most donors feel back to normal within 24 hours.",
              id: "care",
            },
            {
              icon: IndianRupee,
              title: "Processing Charges",
              desc: "Blood is free; however, licensed facilities charge an approved processing fee to cover crucial safety screenings, cold storage, and component processing.",
              id: "charges",
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              id={card.id}
              variants={fadeUp}
              className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow scroll-mt-24"
            >
              <div className="w-12 h-12 rounded-xl bg-red/10 flex items-center justify-center mb-4">
                <card.icon size={22} className="text-red" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">{card.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Compatibility Chart */}
        <motion.div id="compatibility-chart" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-8 mb-16 scroll-mt-24" {...fadeUp}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Activity size={20} className="text-slate-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Compatibility Guide</h3>
              <p className="text-xs text-slate-500">Quick medical compatibility lookup table</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs border-b border-slate-100">
                  <th className="py-3 px-3 md:px-4">Blood Type</th>
                  <th className="py-3 px-3 md:px-4">Can Give To</th>
                  <th className="py-3 px-3 md:px-4">Can Receive From</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {compatibilityData.map((row) => (
                  <tr key={row.type} className="hover:bg-red-50/30 transition-colors">
                    <td className="py-3 px-3 md:px-4 font-bold text-red">{row.type}</td>
                    <td className="py-3 px-3 md:px-4 text-slate-600 text-xs md:text-sm">{row.gives}</td>
                    <td className="py-3 px-3 md:px-4 text-slate-600 text-xs md:text-sm">{row.receives}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Donation Journey */}
        <motion.div className="mb-16" {...fadeUp}>
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-slate-900">The Donation Journey</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {donationSteps.map((step, idx) => (
              <div key={step.title} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm relative">
                <span className="absolute top-3 right-3 text-2xl md:text-3xl font-extrabold text-red/10">{idx + 1}</span>
                <div className="w-8 h-8 rounded-full bg-red/10 text-red flex items-center justify-center mb-3">
                  <step.icon size={16} />
                </div>
                <h4 className="font-bold text-sm mb-1 text-slate-900">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-8" {...fadeUp}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <HelpCircle size={20} className="text-slate-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Common Questions</h3>
              <p className="text-xs text-slate-500">Quick medical requirements and rules</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center text-left font-semibold text-slate-800 hover:text-red transition-colors py-2 gap-4"
                >
                  <span className="text-sm md:text-base">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
                </button>
                {openFaq === idx && (
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
