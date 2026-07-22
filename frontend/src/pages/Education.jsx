import { useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets, Heart, Shield, Clock, Stethoscope, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, ChevronUp, ArrowRight,
  Users, FlaskConical, Calendar, Phone, MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BLOOD_GROUPS } from "../utils/constants";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const stagger = {
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true },
};

const bloodGroupCompatibility = {
  "A+": { donate: ["A+", "AB+"], receive: ["A+", "A-", "O+", "O-"] },
  "A-": { donate: ["A+", "A-", "AB+", "AB-"], receive: ["A-", "O-"] },
  "B+": { donate: ["B+", "AB+"], receive: ["B+", "B-", "O+", "O-"] },
  "B-": { donate: ["B+", "B-", "AB+", "AB-"], receive: ["B-", "O-"] },
  "AB+": { donate: ["AB+"], receive: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  "AB-": { donate: ["AB+", "AB-"], receive: ["A-", "B-", "AB-", "O-"] },
  "O+": { donate: ["O+", "A+", "B+", "AB+"], receive: ["O+", "O-"] },
  "O-": { donate: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], receive: ["O-"] },
};

const myths = [
  { myth: "Blood donation is painful.", fact: "Only a small needle prick is felt during donation. The discomfort is brief and minimal." },
  { myth: "Donating blood weakens the body permanently.", fact: "The body replaces the donated blood naturally within 24–48 hours. Red blood cells replenish fully in a few weeks." },
  { myth: "You can catch diseases by donating blood.", fact: "Sterile, single-use needles are always used. There is zero risk of infection from a licensed blood bank." },
  { myth: "People with tattoos cannot donate blood.", fact: "You can donate blood one year after getting a tattoo, provided it was done at a licensed facility." },
  { myth: "Donating blood causes weight gain.", fact: "Blood donation has no effect on body weight. Each donation burns only about 650 calories temporarily." },
  { myth: "You cannot donate if you take medication.", fact: "Many medications do not disqualify you. Inform the screening staff about all medications you take." },
  { myth: "Women cannot donate blood at all.", fact: "Women can donate blood if they meet eligibility criteria, including hemoglobin levels and overall health." },
  { myth: "Blood donation takes hours.", fact: "The actual donation takes only 8–10 minutes. The entire process including screening takes about 30–45 minutes." },
];

const faqs = [
  {
    q: "Can diabetics donate blood?",
    a: "Diabetics with well-controlled blood sugar levels and no complications can donate blood. Insulin-dependent diabetics may also be eligible. Inform the screening staff about your condition.",
  },
  {
    q: "Can smokers donate blood?",
    a: "Yes, smokers can donate blood as long as they are in good health. It is advised not to smoke immediately before or after donation.",
  },
  {
    q: "Can women donate during menstruation?",
    a: "Yes, women can donate during menstruation provided they are not experiencing severe cramps or heavy bleeding and their hemoglobin level is normal.",
  },
  {
    q: "Can I donate after vaccination?",
    a: "Most routine vaccinations require a short deferral period of 2–4 weeks. Please inform the screening staff about the specific vaccine you received.",
  },
  {
    q: "Can I donate after getting a tattoo?",
    a: "You must wait 12 months after getting a tattoo at a licensed facility. This waiting period may be shorter in some states with regulated tattoo parlors.",
  },
  {
    q: "How long does blood donation take?",
    a: "The entire process — registration, medical screening, donation, and rest — takes approximately 30 to 45 minutes. The actual blood collection takes only 8 to 10 minutes.",
  },
  {
    q: "What should I eat before donating blood?",
    a: "Eat a healthy meal rich in iron and vitamin C at least 2–3 hours before donation. Avoid fatty foods as they can affect blood testing.",
  },
  {
    q: "Can I donate blood if I have a cold or flu?",
    a: "No. You must be in good general health on the day of donation. Wait until you have fully recovered from any illness.",
  },
];

const chargesData = [
  { component: "Whole Blood", range: "₹350 – ₹800" },
  { component: "Packed Red Blood Cells (PRBC)", range: "₹900 – ₹1,800" },
  { component: "Fresh Frozen Plasma (FFP)", range: "₹600 – ₹1,200" },
  { component: "Platelets (Random Donor)", range: "₹300 – ₹600" },
  { component: "Platelets (Single Donor / Apheresis)", range: "₹2,000 – ₹5,000" },
  { component: "Cryoprecipitate", range: "₹400 – ₹800" },
];

function SectionHeading({ label, title }) {
  return (
    <div className="text-center mb-10">
      <span className="text-xs font-bold uppercase tracking-widest text-red/70 mb-2 block">{label}</span>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h2>
    </div>
  );
}

function BloodGroupCard({ group, compat }) {
  const isUniversalDonor = group === "O-";
  const isUniversalRecipient = group === "AB+";
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-bold text-red">{group}</span>
        {(isUniversalDonor || isUniversalRecipient) && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {isUniversalDonor ? "Universal Donor" : "Universal Recipient"}
          </span>
        )}
      </div>
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-semibold text-slate-700">Donate to: </span>
          <span className="text-slate-500">{compat.donate.join(", ")}</span>
        </div>
        <div>
          <span className="font-semibold text-slate-700">Receive from: </span>
          <span className="text-slate-500">{compat.receive.join(", ")}</span>
        </div>
      </div>
    </motion.div>
  );
}

function MythCard({ myth, fact, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 md:p-5 text-left hover:bg-slate-50/50 transition"
      >
        <div className="w-8 h-8 rounded-full bg-red/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <XCircle size={16} className="text-red" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">{myth}</p>
          {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{fact}</p>
              </div>
            </motion.div>
          )}
        </div>
        <div className="flex-shrink-0 mt-1">
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>
    </motion.div>
  );
}

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-4 md:p-5 text-left hover:bg-slate-50/50 transition"
      >
        <span className="text-sm font-bold text-slate-900">{faq.q}</span>
        {open ? <ChevronUp size={18} className="text-red flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-4 md:px-5 pb-4 md:pb-5">
          <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

function TimelineStep({ number, title, description, icon: Icon }) {
  return (
    <motion.div variants={fadeUp} className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-red text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {Icon ? <Icon size={18} /> : number}
        </div>
        {number < 8 && <div className="w-0.5 flex-1 bg-red/20 mt-1" />}
      </div>
      <div className="pb-8">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
    </motion.div>
  );
}

export default function Education() {
  return (
    <div className="bg-cream min-h-screen">
      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red/5 via-cream to-red/10 py-20 md:py-28">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_30%_50%,#b81f3a,transparent_70%)]" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-red/10 flex items-center justify-center mx-auto mb-6">
              <Droplets size={32} className="text-red" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-red/70 mb-3 block">Education</span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-5">
              Learn About Blood Donation
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Knowledge saves lives. Understand how blood donation works, who can donate, and how your donation helps patients in need.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-16 md:space-y-24 pb-16 md:pb-24">

        {/* ==================== WHY BLOOD DONATION MATTERS ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <SectionHeading label="Impact" title="Why Blood Donation Matters" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Heart, title: "Saves Lives", desc: "Every donation can save up to three lives. One unit of blood can be separated into components used by different patients." },
              { icon: FlaskConical, title: "Cannot Be Manufactured", desc: "Blood cannot be manufactured artificially. There is no substitute for human blood. Voluntary donors are the only source." },
              { icon: Users, title: "Hospitals Depend on Donors", desc: "Hospitals depend entirely on voluntary blood donors to meet the daily demand for blood transfusions." },
              { icon: Stethoscope, title: "Needed Everywhere", desc: "Blood is needed for accidents, surgeries, cancer treatment, childbirth complications, and blood disorders like thalassemia." },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center mb-4">
                  <item.icon size={20} className="text-red" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ==================== ELIGIBILITY ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <SectionHeading label="Eligibility" title="Blood Donation Eligibility" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {[
              { icon: Calendar, title: "Age", desc: "18 – 65 years" },
              { icon: Heart, title: "Weight", desc: "45–50 kg minimum" },
              { icon: Shield, title: "Health", desc: "Good overall health" },
              { icon: Droplets, title: "Hemoglobin", desc: "Normal level required" },
              { icon: AlertTriangle, title: "Infections", desc: "No active infections" },
              { icon: XCircle, title: "Substances", desc: "No alcohol or drugs" },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-red/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon size={18} className="text-red" />
                </div>
                <p className="text-xs font-bold text-slate-900 mb-1">{item.title}</p>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ==================== HOW OFTEN ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <SectionHeading label="Frequency" title="How Often Can You Donate?" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Droplets, title: "Whole Blood", items: ["Men: Every 90 days (3 months)", "Women: Every 120 days (4 months)", "Based on hemoglobin levels"], color: "text-red" },
              { icon: Calendar, title: "Platelet Donation", items: ["Every 2 weeks", "Subject to medical eligibility", "Higher platelet count needed"], color: "text-blue-600" },
              { icon: Clock, title: "Plasma Donation", items: ["Every 2–4 weeks", "Depends on blood bank policy", "Doctor's recommendation advised"], color: "text-emerald-600" },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-red/10 flex items-center justify-center mb-4">
                  <item.icon size={20} className={item.color} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">{item.title}</h3>
                <ul className="space-y-2">
                  {item.items.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      {line}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center mt-4">Always follow the doctor's recommendation and blood bank guidelines.</p>
        </motion.section>

        {/* ==================== BLOOD GROUPS ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <SectionHeading label="Compatibility" title="Blood Groups" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {BLOOD_GROUPS.map((group) => (
              <BloodGroupCard key={group} group={group} compat={bloodGroupCompatibility[group]} />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">O Negative — Universal Donor</span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">AB Positive — Universal Recipient</span>
          </div>
        </motion.section>

        {/* ==================== BLOOD BANK FACTS ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <SectionHeading label="India" title="Blood Bank Facts" />
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Shield, title: "Legal Framework", desc: "Blood itself cannot legally be bought or sold in India. Only licensed blood banks can collect and distribute blood." },
                { icon: Users, title: "Voluntary Donors", desc: "Licensed blood banks collect blood from voluntary, unpaid donors. Donating blood is a selfless act of service." },
                { icon: FlaskConical, title: "Processing Charges", desc: "Patients are charged only for processing, testing, storage, transportation, and service costs — not for the blood itself." },
                { icon: MapPin, title: "Replacement Donation", desc: "Some hospitals may request replacement donation depending on their policies. This helps maintain blood bank stocks." },
              ].map((item) => (
                <motion.div key={item.title} variants={fadeUp} className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-red" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ==================== CHARGES ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <SectionHeading label="Costs" title="Approximate Blood Processing Charges" />
          <p className="text-xs text-slate-500 text-center mb-6">These are approximate processing charges and may vary between hospitals and states. Prices are regulated by authorities.</p>
          <motion.div variants={fadeUp} className="overflow-x-auto">
            <table className="w-full text-sm bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-red text-white">
                  <th className="text-left px-4 md:px-6 py-3 font-bold text-xs uppercase tracking-wider">Component</th>
                  <th className="text-left px-4 md:px-6 py-3 font-bold text-xs uppercase tracking-wider">Approximate Range</th>
                </tr>
              </thead>
              <tbody>
                {chargesData.map((row, i) => (
                  <tr key={row.component} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-4 md:px-6 py-3 text-xs text-slate-800 font-medium">{row.component}</td>
                    <td className="px-4 md:px-6 py-3 text-xs text-slate-600">{row.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          <p className="text-xs text-slate-400 text-center mt-4">Prices vary by state and government / private institution.</p>
        </motion.section>

        {/* ==================== BEFORE DONATING ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <SectionHeading label="Preparation" title="Before Donating Blood" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[
              "Get proper sleep the night before",
              "Eat a healthy meal rich in iron",
              "Drink plenty of water",
              "Carry a valid government ID",
              "Avoid alcohol 24 hours before",
              "Inform staff about medications",
            ].map((item) => (
              <motion.div key={item} variants={fadeUp} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-slate-700 font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ==================== AFTER DONATING ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <SectionHeading label="Recovery" title="After Donating Blood" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[
              "Rest for 10–15 minutes at the blood bank",
              "Drink extra fluids throughout the day",
              "Eat a healthy meal within 2 hours",
              "Avoid heavy exercise for 24 hours",
              "Keep the bandage on for 4–6 hours",
              "Avoid smoking and alcohol for 24 hours",
            ].map((item) => (
              <motion.div key={item} variants={fadeUp} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-slate-700 font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ==================== MYTHS VS FACTS ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <SectionHeading label="Myth Busters" title="Common Myths vs Facts" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {myths.map((item, i) => (
              <MythCard key={i} myth={item.myth} fact={item.fact} index={i} />
            ))}
          </div>
        </motion.section>

        {/* ==================== FAQ ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <SectionHeading label="FAQ" title="Frequently Asked Questions" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </motion.section>

        {/* ==================== EMERGENCY REQUEST PROCESS ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <SectionHeading label="How It Works" title="Emergency Blood Request Process" />
          <p className="text-xs text-slate-500 text-center mb-8 max-w-xl mx-auto">Here is how Blood Net helps connect patients with nearby donors in real time.</p>
          <div className="max-w-lg mx-auto">
            {[
              { number: 1, title: "Patient Creates a Request", desc: "A patient submits a blood request with blood group, hospital, and urgency details.", icon: null },
              { number: 2, title: "Nearby Donors Are Notified", desc: "Eligible donors in the same city receive instant notifications about the request.", icon: Bell },
              { number: 3, title: "Donor Accepts", desc: "A willing donor accepts the request and the patient is notified immediately.", icon: CheckCircle },
              { number: 4, title: "Patient Receives Notification", desc: "The patient sees the donor's name, blood group, phone number, and city.", icon: Phone },
              { number: 5, title: "Patient Connects with Donor", desc: "The patient contacts the donor to coordinate the donation at the hospital or blood bank.", icon: Users },
              { number: 6, title: "Donation Completed", desc: "The donor donates blood at the specified location.", icon: Droplets },
              { number: 7, title: "Patient Confirms Donation", desc: "The patient verifies the donation on the platform.", icon: Shield },
              { number: 8, title: "Donor's Count Increases", desc: "The donor's total donation count is updated on their profile.", icon: Heart },
            ].map((step, i) => (
              <TimelineStep key={i} number={i + 1} title={step.title} description={step.desc} icon={step.icon} />
            ))}
          </div>
        </motion.section>

        {/* ==================== CTA ==================== */}
        <motion.section {...stagger} className="scroll-mt-20">
          <motion.div variants={fadeUp} className="relative overflow-hidden bg-gradient-to-br from-red via-red-deep to-red text-white rounded-3xl p-8 md:p-12 text-center shadow-xl">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,#ffffff,transparent_70%)]" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5 backdrop-blur-sm">
                <Heart size={28} className="text-white fill-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">Your One Donation Can Save Lives</h2>
              <p className="text-sm md:text-base text-white/80 max-w-lg mx-auto mb-8">
                Join thousands of donors who make a difference every day. Sign up today and become a regular blood donor.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white text-red font-bold rounded-full text-sm hover:bg-white/90 transition shadow-lg shadow-black/10"
                >
                  Become a Donor
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 border border-white/40 text-white font-bold rounded-full text-sm hover:bg-white/10 transition flex items-center gap-2"
                >
                  Request Blood <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ==================== FOOTER DISCLAIMER ==================== */}
        <motion.div variants={fadeUp} className="text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-center gap-2">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                This information is provided for educational purposes only. Always follow the advice of licensed medical professionals and your local blood bank.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
