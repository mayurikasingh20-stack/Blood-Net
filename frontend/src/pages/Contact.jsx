import { useState } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Droplet,
} from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+91 123 456 7890",
    sub: "Mon-Sat, 9AM-6PM",
    color: "text-red",
    bg: "bg-red/10",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@bloodnet.in",
    sub: "We reply within 24 hrs",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Jodhpur, Rajasthan",
    sub: "India - 342001",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "24/7 Emergency",
    sub: "Office: 9AM - 6PM",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

function validateForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Invalid email";
  if (!form.phone.trim()) errors.phone = "Phone is required";
  else if (!/^[+\d][\d\s-]{7,}$/.test(form.phone)) errors.phone = "Invalid phone";
  if (!form.subject.trim()) errors.subject = "Subject is required";
  if (!form.message.trim()) errors.message = "Message is required";
  else if (form.message.trim().length < 10) errors.message = "At least 10 characters";
  return errors;
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSending(true);
    try {
      const messages = JSON.parse(localStorage.getItem("contact_messages") || "[]");
      messages.push({ ...form, timestamp: new Date().toISOString() });
      localStorage.setItem("contact_messages", JSON.stringify(messages));
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setErrors({ form: "Failed to send. Please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">

        {/* Header */}
        <motion.div className="text-center mb-12 md:mb-16" {...fadeUp}>
          <span className="inline-flex items-center gap-2 text-red font-bold text-sm uppercase tracking-wider bg-red/10 px-4 py-1.5 rounded-full mb-4">
            <Droplet size={16} /> Get In Touch
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            We&apos;d love to hear from you
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
            Have a question, suggestion, or want to partner with us? Drop us a message and our team will get back to you.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-12"
          variants={{ whileInView: { transition: { staggerChildren: 0.08 } } }}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
        >
          {contactInfo.map((item) => (
            <motion.div
              key={item.label}
              variants={{
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
              }}
              className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${item.bg}`}>
                <item.icon size={20} className={item.color} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">{item.label}</p>
              <p className="text-sm md:text-base font-semibold text-slate-800">{item.value}</p>
              <p className="text-xs text-slate-400 mt-1">{item.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Contact Form */}
          <motion.div className="lg:col-span-3 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm" {...fadeUp}>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Thank you for reaching out. We will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-red">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-red/20 ${
                        errors.name ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-xs text-red mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-red">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-red/20 ${
                        errors.email ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-xs text-red mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Phone Number <span className="text-red">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-red/20 ${
                        errors.phone ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                      placeholder="+91 98765 43210"
                    />
                    {errors.phone && <p className="text-xs text-red mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Subject <span className="text-red">*</span>
                    </label>
                    <input
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-red/20 ${
                        errors.subject ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                      placeholder="How can we help?"
                    />
                    {errors.subject && <p className="text-xs text-red mt-1">{errors.subject}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Message <span className="text-red">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-red/20 resize-none ${
                      errors.message ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                    placeholder="Tell us more about your query..."
                  />
                  {errors.message && <p className="text-xs text-red mt-1">{errors.message}</p>}
                </div>

                {errors.form && (
                  <div className="flex items-center gap-2 text-sm text-red bg-red/10 px-4 py-3 rounded-xl">
                    <AlertCircle size={16} />
                    {errors.form}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full md:w-auto px-8 py-3 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Map Sidebar */}
          <motion.div className="lg:col-span-2 space-y-4 md:space-y-6" {...stagger}>
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm h-[280px] md:h-[320px]">
              <MapContainer
                center={[26.2389, 73.0243]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[26.2389, 73.0243]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold text-slate-900">Blood Net HQ</p>
                      <p className="text-xs text-slate-500">Jodhpur, Rajasthan</p>
                      <p className="text-xs text-slate-500 mt-1">support@bloodnet.in</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm">
              <h4 className="font-semibold text-slate-900 mb-3 text-sm">Quick Links</h4>
              <div className="space-y-2.5">
                {[
                  { label: "Register as Donor", href: "/register?role=donor" },
                  { label: "Request Blood", href: "/login?role=patient" },
                  { label: "Blood Bank Login", href: "/login?role=bloodbank" },
                  { label: "About Blood Net", href: "/about" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-slate-600 hover:text-red font-medium transition px-3 py-2 rounded-lg hover:bg-red/5"
                  >
                    &rarr; {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red to-red-700 rounded-2xl p-5 md:p-6 text-white">
              <h4 className="font-bold mb-1">Emergency?</h4>
              <p className="text-sm text-white/80 mb-3">Call our 24/7 helpline for urgent blood requirements.</p>
              <a
                href="tel:+911234567890"
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold hover:bg-white/30 transition"
              >
                <Phone size={14} />
                +91 123 456 7890
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
