import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HeartPulse, User, Users, Building2, ArrowRight, Droplets, HeartHandshake, IndianRupee } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import api from "../services/api";

const bloodServices = [
  {
    icon: Droplets,
    title: "Diseases & Blood Types",
    desc: "What blood-borne illness needs what — and which types are compatible for safe transfusion.",
    link: "/education",
  },
  {
    icon: HeartHandshake,
    title: "Post Donation Care",
    desc: "A simple recovery timeline — what to do in the first hour, the first day, and the first week.",
    link: "/education",
  },
  {
    icon: IndianRupee,
    title: "Processing Charges",
    desc: "Transparent component pricing, so no patient feels overcharged during an emergency.",
    link: "/education",
  },
];

const badgeStyles = {
  critical: "bg-red/10 text-red-deep",
  high: "bg-amber/15 text-[#8A5A15]",
  moderate: "bg-green/10 text-green",
};
const dotStyles = { critical: "bg-red", high: "bg-amber", moderate: "bg-green" };

function Dashboard() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [stats, setStats] = useState([
    { label: "Registered Donors", value: "—", sub: "Loading...", icon: HeartPulse, tint: "bg-red/10 text-red-deep" },
    { label: "Patients Supported", value: "—", sub: "Loading...", icon: User, tint: "bg-amber/15 text-[#8A5A15]" },
    { label: "Blood Banks Connected", value: "—", sub: "Loading...", icon: Building2, tint: "bg-maroon/10 text-maroon" },
    { label: "Camps Set Up", value: "—", sub: "Loading...", icon: Users, tint: "bg-green/10 text-green" },
  ]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/blood-request/open").catch(() => ({ data: { blood_requests: [] } })),
      api.get("/donor/all").catch(() => ({ data: { count: 0 } })),
      api.get("/public-blood-banks/").catch(() => ({ data: { blood_banks: [] } })),
    ]).then(([reqRes, donorRes, bankRes]) => {
      const requests = (reqRes.data?.blood_requests || []).slice(0, 10).map((r) => ({
        bloodType: r.blood_group,
        hospital: r.hospital,
        location: r.city ? `${r.city}` : "Unknown",
        units: `${r.units} unit(s)`,
        time: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recently",
        level: (r.urgency_level || "").toLowerCase() === "critical" ? "critical" : (r.urgency_level || "").toLowerCase() === "high" ? "high" : "moderate",
        chip: (r.urgency_level || "").toLowerCase() === "critical" ? "bg-red" : (r.urgency_level || "").toLowerCase() === "high" ? "bg-maroon" : "bg-green",
      }));
      setUrgentRequests(requests);
      setStats([
        { label: "Registered Donors", value: donorRes.data?.count?.toLocaleString() || "—", sub: "Available to donate", icon: HeartPulse, tint: "bg-red/10 text-red-deep" },
        { label: "Patients Supported", value: "—", sub: "In our network", icon: User, tint: "bg-amber/15 text-[#8A5A15]" },
        { label: "Blood Banks Connected", value: bankRes.data?.blood_banks?.length?.toLocaleString() || "—", sub: "Across all districts", icon: Building2, tint: "bg-maroon/10 text-maroon" },
        { label: "Open Requests", value: requests.length.toLocaleString(), sub: "Currently active", icon: Users, tint: "bg-green/10 text-green" },
      ]);
    }).catch(() => {});
  }, []);

  const bloodTypes = [...new Set(urgentRequests.map((r) => r.bloodType))];

  const visibleRequests = activeFilter
    ? urgentRequests.filter((r) => r.bloodType === activeFilter)
    : urgentRequests;

  const handleDonateClick = () => {
    if (user) {
      navigate("/donor-dashboard");
    } else {
      navigate("/login?role=donor");
    }
  };

  

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO — dark solid card */}
        <div className="px-8 pt-11">
          <div className="max-w-6xl mx-auto rounded-[28px] overflow-hidden text-white bg-ink
                          shadow-[0_30px_70px_-30px_rgba(0,0,0,0.5)]
                          grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr]">
            <div className="p-10 md:p-14 flex flex-col gap-5">
              <span className="inline-flex items-center gap-2 w-fit px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4CE59A] animate-pulse" />
                214 units needed across Jodhpur right now
              </span>

              <p className="font-serif italic text-xl md:text-2xl leading-snug max-w-lg text-white/95">
                "Blood donation costs nothing but a little time — and buys someone their next sunrise."
              </p>

              <p className="text-sm md:text-[15px] leading-relaxed text-white/70 max-w-lg">
                BLOOD NET connects verified donors, patients in need, and licensed blood banks on a single
                live network — so an urgent request is never stuck in a phone tree at 2 a.m.
              </p>

              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  onClick={handleDonateClick}
                  className="flex items-center gap-2 bg-white text-red-deep font-bold px-6 py-3.5 rounded-full
                             transition-all hover:bg-red-50 hover:-translate-y-0.5"
                >
                  <User size={17} /> Donate Blood
                </button>
                <Link
                  to="/login?role=patient"
                  className="flex items-center gap-2 border border-white/30 text-white font-bold px-6 py-3.5 rounded-full
                             transition-all hover:border-white hover:bg-white/10"
                >
                  <HeartPulse size={17} /> Request Blood
                </Link>
              </div>
            </div>

            <div className="relative min-h-[260px] md:min-h-[420px] p-6 md:p-8 flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(184,31,58,0.25),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(226,154,60,0.2),_transparent_45%)]">
              <div className="w-full max-w-[360px] rounded-[24px] border border-white/15 bg-white/10 backdrop-blur-md p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.55)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">Live Need</p>
                    <p className="text-3xl font-semibold mt-1">214</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                    <HeartPulse size={20} className="text-white" />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-3.5 py-3">
                    <div>
                      <p className="text-sm font-semibold">Critical requests</p>
                      <p className="text-xs text-white/65">24 hospitals waiting</p>
                    </div>
                    <span className="rounded-full bg-red/20 px-2.5 py-1 text-[11px] font-bold text-white">24</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-3.5 py-3">
                    <div>
                      <p className="text-sm font-semibold">Nearby donors</p>
                      <p className="text-xs text-white/65">18 available within 5 km</p>
                    </div>
                    <span className="rounded-full bg-amber/25 px-2.5 py-1 text-[11px] font-bold text-white">18</span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-[#FBF6F1] p-4 text-ink">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-deep">Today</p>
                      <p className="text-sm font-semibold mt-1">O- blood type is in demand</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red/10 text-red-deep">
                      <Droplets size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="max-w-6xl mx-auto px-8 mt-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/about" className="group bg-paper border border-ink/10 rounded-[22px] p-8 flex flex-col gap-3.5
                                       transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(74,18,32,0.25)]">
            <span className="w-fit text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-red/10 text-red-deep">Our Story</span>
            <h3 className="font-serif text-2xl font-semibold">About BLOOD NET</h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              What started as a spreadsheet tracking donors for one hospital in Jodhpur is now a live network
              linking patients, verified donors and licensed blood banks.
            </p>
            <span className="flex items-center gap-1.5 text-sm font-bold text-red-deep mt-auto">
              Read about BLOOD NET <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link to="/education" className="group bg-paper border border-ink/10 rounded-[22px] p-8 flex flex-col gap-3.5
                                           transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(74,18,32,0.25)]">
            <span className="w-fit text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber/15 text-[#8A5A15]">Blood-Borne Risk</span>
            <h3 className="font-serif text-2xl font-semibold">HIV / AIDS</h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              The most consequential disease transmissible through unscreened blood — and why every unit on
              BLOOD NET's partner banks is triple-screened first.
            </p>
            <span className="flex items-center gap-1.5 text-sm font-bold text-red-deep mt-auto">
              Read about HIV/AIDS <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* BLOOD SERVICES */}
        <div className="max-w-6xl mx-auto px-8 mt-16 mb-6">
          <span className="block text-xs font-bold uppercase tracking-wide text-red-deep mb-2">Learn More</span>
          <h2 className="font-serif text-3xl font-semibold">Blood Services</h2>
        </div>
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {bloodServices.map(({ icon: Icon, title, desc, link }) => (
            <Link
              key={title}
              to={link}
              className="group bg-paper border border-ink/10 rounded-[20px] p-7 flex flex-col gap-3 transition-all
                         hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(74,18,32,0.25)]"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-red/10 text-red-deep">
                <Icon size={20} />
              </div>
              <h4 className="font-serif text-lg font-semibold">{title}</h4>
              <p className="text-sm text-ink-soft leading-relaxed">{desc}</p>
              <span className="flex items-center gap-1.5 text-sm font-bold text-red-deep mt-auto">
                Learn more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        {/* STATS */}
        <div className="max-w-6xl mx-auto px-8 mt-16 mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wide text-red-deep mb-2">Network, Live</span>
            <h2 className="font-serif text-3xl font-semibold">The network at a glance</h2>
          </div>
          <p className="text-sm text-ink-soft max-w-sm">
            Numbers pulled from every patient, donor and blood bank account connected to BLOOD NET.
          </p>
        </div>
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map(({ label, value, sub, icon: Icon, tint }) => (
            <div
              key={label}
              className="bg-paper border border-ink/10 rounded-[20px] p-7 transition-all
                         hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(74,18,32,0.25)]"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${tint}`}>
                <Icon size={22} />
              </div>
              <p className="font-mono text-[34px] font-bold tracking-tight">{value}</p>
              <p className="text-[13.5px] font-semibold text-ink-soft mt-1">{label}</p>
              <p className="text-xs font-bold text-green mt-2.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* URGENT REQUESTS */}
        <div className="max-w-6xl mx-auto px-8 mt-16 mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wide text-red-deep mb-2">Real-Time Requests</span>
            <h2 className="font-serif text-3xl font-semibold">Current blood needs</h2>
          </div>
          <p className="text-sm text-ink-soft max-w-sm">
            Sorted by urgency — critical requests surface first so nearby donors can respond immediately.
          </p>
        </div>

        {/* FILTER CHIPS */}
        <div className="max-w-6xl mx-auto px-8 mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              activeFilter === null
                ? "bg-ink text-white border-ink"
                : "border-ink/15 text-ink-soft hover:border-ink/30"
            }`}
          >
            All Types
          </button>
          {bloodTypes.map((bt) => (
            <button
              key={bt}
              onClick={() => setActiveFilter(activeFilter === bt ? null : bt)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all font-mono ${
                activeFilter === bt
                  ? "bg-red-deep text-white border-red-deep"
                  : "border-ink/15 text-ink-soft hover:border-red/40"
              }`}
            >
              {bt}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-8 pb-16 flex flex-col gap-3.5">
          {visibleRequests.length === 0 && (
            <div className="bg-paper border border-ink/10 rounded-[18px] p-8 text-center text-sm text-ink-soft">
              No active requests for {activeFilter} right now.
            </div>
          )}

          {visibleRequests.map((req, i) => (
            <div
              key={i}
              className="bg-paper border border-ink/10 rounded-[18px] p-5 grid grid-cols-1 md:grid-cols-[64px_1.4fr_1fr_1fr_120px]
                         items-center gap-4 transition-all hover:translate-x-1 hover:shadow-[0_20px_50px_-20px_rgba(74,18,32,0.25)]"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-white ${req.chip}`}>
                {req.bloodType}
              </div>
              <div>
                <p className="font-bold text-[15px]">{req.hospital}</p>
                <p className="text-xs text-ink-soft mt-0.5">{req.location}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Units needed</p>
                <p className="text-sm font-semibold mt-0.5">{req.units}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Requested</p>
                <p className="text-sm font-semibold mt-0.5">{req.time}</p>
              </div>
              <span className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold ${badgeStyles[req.level]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[req.level]}`} />
                {req.level[0].toUpperCase() + req.level.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
