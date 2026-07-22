import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.15),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.1),transparent_40%)]" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div className="space-y-6" {...stagger}>
              <motion.div
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full"
                variants={{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } }}
              >
                <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Serving Jodhpur & Beyond</span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                variants={{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } }}
              >
                Every Drop{" "}
                <span className="text-red">Counts.</span>
                <br />
                Every Second{" "}
                <span className="text-red">Matters.</span>
              </motion.h1>

              <motion.p
                className="text-slate-300 text-base md:text-lg max-w-lg"
                variants={{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } }}
              >
                Blood Net connects patients, donors, and licensed blood banks on one real-time network. 
                When seconds count, we make sure the right blood type reaches the right place.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 pt-2"
                variants={{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } }}
              >
                <Link
                  to="/register?role=donor"
                  className="px-8 py-3.5 bg-red text-white rounded-full text-sm font-bold text-center hover:bg-red-700 transition shadow-lg shadow-red/30 flex items-center justify-center gap-2"
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

              <motion.div
                className="flex items-center gap-3 text-xs text-slate-400 pt-2 flex-wrap"
                variants={{ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } }}
              >
                <span className="flex items-center gap-1"><CheckCircle size={12} /> Verified Network</span>
                <span className="flex items-center gap-1"><CheckCircle size={12} /> Real-time Tracking</span>
                <span className="flex items-center gap-1"><CheckCircle size={12} /> Free to Join</span>
                <span className="text-slate-500 mx-1">|</span>
                <Link to="/login?role=bloodbank" className="hover:text-white transition font-medium">Blood Bank Login</Link>
                <span className="text-slate-500">·</span>
                <Link to="/bloodbank-register" className="hover:text-white transition font-medium">Register Facility</Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="hidden lg:flex justify-center"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-4 bg-gradient-to-r from-red/20 to-blue-600/20 blur-3xl rounded-3xl" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400">Live Network</p>
                      <p className="text-2xl font-bold mt-1">214</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red/20 flex items-center justify-center">
                      <Droplet size={22} className="text-red" />
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">Critical Requests</p>
                        <p className="text-xs text-slate-400">24 hospitals waiting</p>
                      </div>
                      <span className="bg-red/20 text-red text-xs font-bold px-2.5 py-1 rounded-full">24</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">Available Donors</p>
                        <p className="text-xs text-slate-400">18 within 5 km</p>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">18</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red">Urgent Need</p>
                    <p className="text-sm font-semibold mt-1">O- blood type critically low</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <motion.section className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 md:-mt-12 relative z-10" {...fadeUp}>
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 p-4 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-3 md:p-4">
                <stat.icon size={24} className={`${stat.color} mx-auto mb-2`} />
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs md:text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

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
        <div className="bg-gradient-to-br from-red to-red-700 rounded-3xl p-8 md:p-16 text-white text-center">
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
                to="/bloodbank-register"
                className="px-8 py-3.5 bg-white/10 border border-white/30 text-white rounded-full text-sm font-bold hover:bg-white/20 transition"
              >
                Register Blood Bank
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
    </div>
  );
}
