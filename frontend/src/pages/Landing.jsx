import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Droplet,
  Heart,
  Shield,
  Clock,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  Quote,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, staggerChildren: 0.1 },
};

const stats = [
  { value: "10k+", label: "Lives Saved Yearly", icon: Heart, color: "text-red" },
  { value: "450+", label: "Verified Blood Banks", icon: Building2, color: "text-blue-600" },
  { value: "15k+", label: "Registered Donors", icon: Users, color: "text-emerald-600" },
  { value: "24/7", label: "Active Monitoring", icon: Clock, color: "text-purple-600" },
];

const features = [
  {
    icon: Droplet,
    title: "Fast Blood Matching",
    desc: "AI-powered algorithm finds the nearest compatible blood units within milliseconds of a request.",
    color: "text-red",
    bg: "bg-red/10",
  },
  {
    icon: Shield,
    title: "Verified Blood Banks",
    desc: "Every blood bank is vetted against strict safety standards with real-time inventory auditing.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Clock,
    title: "Emergency Response",
    desc: "Critical requests get priority routing with live tracking from pickup to delivery.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Users,
    title: "Community Network",
    desc: "Connect nearby donors with patients in need, building a resilient local blood supply chain.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: MapPin,
    title: "Live Location Tracking",
    desc: "Real-time GPS tracking for blood deliveries with temperature monitoring throughout transit.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: CheckCircle,
    title: "Eligibility Management",
    desc: "Donors get automated eligibility checks and reminders for their next donation date.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

const howItWorks = [
  { step: 1, title: "Register", desc: "Sign up as a donor, patient, or blood bank in under 2 minutes." },
  { step: 2, title: "Connect", desc: "Browse nearby donors, blood banks, or raise a blood request instantly." },
  { step: 3, title: "Save Lives", desc: "Donors get matched with requests. Blood banks dispatch units with live tracking." },
];

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Chief Pathologist, AIIMS Jodhpur",
    quote:
      "Blood Net has revolutionized how we source blood in emergencies. The real-time inventory visibility alone has saved us hours during critical situations.",
    avatar: "PS",
    color: "bg-red/10 text-red",
  },
  {
    name: "Rahul Verma",
    role: "Regular Donor, Jodhpur",
    quote:
      "I have donated 8 times through Blood Net. The app reminds me when I am eligible and finds nearby requests. It makes donating effortless.",
    avatar: "RV",
    color: "bg-blue-50 text-blue-600",
  },
  {
    name: "Sneha Mehta",
    role: "Patient Coordinator, MDM Hospital",
    quote:
      "Finding O-negative blood used to mean calling ten different banks. Now I just open Blood Net and see exactly who has what. Game changer.",
    avatar: "SM",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const faqs = [
  {
    q: "Who can donate blood?",
    a: "Anyone aged 18-65, weighing at least 45kg, in good health on the day of donation. A quick hemoglobin test is done at the camp to confirm eligibility.",
  },
  {
    q: "How often can I donate?",
    a: "Healthy males can donate every 90 days. Females can donate every 120 days. Your Blood Net dashboard tracks your next eligible date automatically.",
  },
  {
    q: "Is blood donation safe?",
    a: "Absolutely. All partner blood banks use sterile, single-use equipment. There is zero risk of infection from donating blood.",
  },
  {
    q: "How does Blood Net verify blood banks?",
    a: "We verify licenses, conduct periodic audits, and maintain a live inventory feed. Each bank must meet clinical safety standards to stay on the network.",
  },
  {
    q: "Can I track my donation impact?",
    a: "Yes! Donors can see how many lives they have impacted, view donation history, and get notified when their blood is used.",
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);
  const [topRequests, setTopRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/public/requests/top")
      .then((res) => setTopRequests(res.data.blood_requests))
      .catch(() => setTopRequests([]))
      .finally(() => setRequestsLoading(false));
  }, []);

  const urgencyConfig = {
    Critical: { bg: "bg-red/10", badge: "bg-red text-white", icon: "text-red" },
    High: { bg: "bg-orange-50", badge: "bg-orange-500 text-white", icon: "text-orange-500" },
    Moderate: { bg: "bg-amber-50", badge: "bg-amber-500 text-white", icon: "text-amber-500" },
    Low: { bg: "bg-green-50", badge: "bg-green-500 text-white", icon: "text-green-500" },
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0B0F19] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(230,57,70,0.12),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.06),transparent_40%)]" />
        <div className="relative w-full max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div className="space-y-4" {...stagger}>
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                variants={{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } }}
              >
                Every Drop{" "}
                <span className="text-[#E63946]">Counts.</span>
                <br />
                Every Second{" "}
                <span className="text-[#E63946]">Matters.</span>
              </motion.h1>

              <motion.p
                className="text-slate-400 text-base md:text-lg max-w-lg leading-relaxed"
                variants={{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } }}
              >
                Blood Net connects patients, donors, and licensed blood banks on one real-time network. 
                When seconds count, we make sure the right blood type reaches the right place.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 pt-1"
                variants={{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } }}
              >
                <Link
                  to="/register?role=donor"
                  className="px-8 py-3.5 bg-[#E63946] text-white rounded-full text-sm font-bold text-center hover:bg-red-700 transition shadow-lg shadow-[#E63946]/30 flex items-center justify-center gap-2"
                >
                  <Droplet size={18} /> Become a Donor
                </Link>
                <Link
                  to="/login?role=patient"
                  className="px-8 py-3.5 bg-white/10 border border-white/25 text-white rounded-full text-sm font-bold text-center hover:bg-white/20 transition flex items-center justify-center gap-2"
                >
                  Request Blood
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="hidden lg:flex justify-center items-center relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative w-full max-w-sm flex flex-col items-center">
                <div className="absolute -inset-10 bg-[#E63946]/20 blur-[80px] rounded-full" />
                <div className="relative w-48 h-56 md:w-56 md:h-64">
                  <svg viewBox="0 0 120 160" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="bloodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E63946" stopOpacity="0.95" />
                        <stop offset="40%" stopColor="#c1121f" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#780000" stopOpacity="0.7" />
                      </linearGradient>
                      <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <path d="M60 10 C40 40 15 70 15 100 C15 130 30 150 60 150 C90 150 105 130 105 100 C105 70 80 40 60 10Z"
                      fill="url(#bloodGrad)" filter="url(#glow)" />
                    <path d="M35 85 Q45 75 55 80 Q65 85 60 95 Q55 105 45 100 Q35 95 35 85Z"
                      fill="url(#shine)" opacity="0.6" />
                    <ellipse cx="42" cy="75" rx="8" ry="12" fill="url(#shine)" opacity="0.4" transform="rotate(-20 42 75)" />
                    <ellipse cx="75" cy="115" rx="10" ry="5" fill="url(#shine)" opacity="0.2" transform="rotate(10 75 115)" />
                  </svg>
                </div>
                <motion.div
                  className="relative -mt-3 inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2.5 rounded-full shadow-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] animate-pulse" />
                  <span className="text-xs font-semibold text-slate-200">{topRequests.length} Active Blood Request{topRequests.length !== 1 ? "s" : ""}</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* URGENT BLOOD REQUESTS BOARD */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-red font-bold text-sm uppercase tracking-wider bg-red/10 px-4 py-1.5 rounded-full">
            Live Requests
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mt-4 mb-4">
            Urgent Blood Requests
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
            These patients need blood immediately. Every matching donor can make a difference.
          </p>
        </div>

        {requestsLoading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 rounded-lg" />
              ))}
            </div>
          </div>
        ) : topRequests.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
            <p className="text-slate-500 text-lg font-medium">No urgent requests right now</p>
            <p className="text-slate-400 text-sm mt-1">Check back soon — new requests appear in real time.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {topRequests.map((req, idx) => {
              const urgent = urgencyConfig[req.urgency_level] || urgencyConfig.Moderate;
              return (
                <motion.div
                  key={req.id}
                  className={`flex items-center gap-3 md:gap-6 px-5 md:px-8 py-4 ${idx < topRequests.length - 1 ? "border-b border-slate-100" : ""} hover:bg-slate-50 transition`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <span className={`min-w-[68px] text-center text-lg font-black tracking-wider px-2.5 py-1 rounded-lg ${urgent.bg}`}>
                    {req.blood_group}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{req.hospital}</p>
                    <p className="text-xs text-slate-500 truncate">{req.city}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 hidden sm:inline-block ${urgent.badge}`}>
                    {req.urgency_level}
                  </span>
                  <span className="text-xs text-slate-500 flex-shrink-0 hidden md:block">
                    <span className="font-bold text-slate-700">{req.units}</span> unit{req.units > 1 ? "s" : ""}
                  </span>
                  <Link
                    to="/register?role=donor"
                    className="flex-shrink-0 text-xs font-bold text-red hover:text-red-700 transition flex items-center gap-1"
                  >
                    Help <ArrowRight size={12} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {topRequests.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/register?role=donor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red/30"
            >
              <Droplet size={16} /> Become a Donor & Help Them
            </Link>
          </div>
        )}
      </section>

      {/* FEATURES */}
      <motion.section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24" {...fadeUp}>
        <div className="text-center mb-12 md:mb-16">
          <span className="text-red font-bold text-sm uppercase tracking-wider bg-red/10 px-4 py-1.5 rounded-full">
            Why Blood Net
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mt-4 mb-4">
            Built for Speed, Designed for Safety
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
            Every feature is engineered to close the gap between a blood request and a life-saving transfusion.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
          variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={{
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
              }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                <feature.icon size={22} className={feature.color} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* HOW IT WORKS */}
      <motion.section className="bg-white py-16 md:py-24" {...fadeUp}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-red font-bold text-sm uppercase tracking-wider bg-red/10 px-4 py-1.5 rounded-full">
              Simple Process
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mt-4 mb-4">
              How It Works
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
              Three simple steps to start saving lives through Blood Net.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {howItWorks.map((item) => (
              <motion.div
                key={item.step}
                className="text-center relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.step * 0.15 }}
              >
                <div className="w-16 h-16 bg-red rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red/20">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-8 -right-6 text-slate-300 text-2xl">
                    <ArrowRight size={24} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* TESTIMONIALS */}
      <motion.section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24" {...fadeUp}>
        <div className="text-center mb-12 md:mb-16">
          <span className="text-red font-bold text-sm uppercase tracking-wider bg-red/10 px-4 py-1.5 rounded-full">
            Testimonials
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mt-4 mb-4">
            Trusted by Healthcare Heroes
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
            Hear from the people who use Blood Net every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {testimonials.map((item) => (
            <motion.div
              key={item.name}
              className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: testimonials.indexOf(item) * 0.1 }}
            >
              <Quote size={20} className="text-red/30 mb-4" />
              <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${item.color}`}>
                  {item.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section className="bg-white py-16 md:py-24" {...fadeUp}>
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-red font-bold text-sm uppercase tracking-wider bg-red/10 px-4 py-1.5 rounded-full">
              FAQ
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mt-4 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm md:text-base">
              Everything you need to know about Blood Net and blood donation.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-5 md:px-6 py-4 md:py-5 text-left hover:bg-slate-50 transition"
                >
                  <span className="text-sm md:text-base font-semibold text-slate-800 pr-4">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp size={18} className="text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 md:px-6 pb-4 md:pb-5">
                    <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CONTACT SECTION */}
      <motion.section className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24" {...fadeUp}>
        <div className="bg-gradient-to-br from-[#7F1D1D] to-[#5C1010] rounded-2xl p-8 md:p-16 text-white text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Droplet size={40} className="mx-auto mb-6 text-white/80" />
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-8 max-w-lg mx-auto">
              Join thousands of donors and healthcare professionals saving lives through Blood Net. 
              Every drop counts, and every moment matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register?role=donor"
                className="px-8 py-3.5 bg-white text-red rounded-full text-sm font-bold hover:bg-slate-100 transition shadow-lg"
              >
                Register as Donor
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3.5 bg-white/10 border border-white/30 text-white rounded-full text-sm font-bold hover:bg-white/20 transition"
              >
                Contact Us
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-white/70">
              <span className="flex items-center gap-2"><Mail size={14} /> support@bloodnet.in</span>
              <span className="flex items-center gap-2"><Phone size={14} /> +91 123 456 7890</span>
              <span className="flex items-center gap-2"><MapPin size={14} /> Jodhpur, Rajasthan</span>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}
