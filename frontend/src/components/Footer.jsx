import { Link } from "react-router-dom";
import { Droplet, Mail, Phone, Circle, Heart, Shield } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper mt-10">
      <div className="max-w-6xl mx-auto px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 pb-10 border-b border-ink/10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-serif font-bold text-xl">
              <Droplet className="text-red fill-red" size={20} />
              BLOOD<span className="text-red">NET</span>
            </div>
            <p className="text-[13.5px] text-ink-soft leading-relaxed mt-3.5 max-w-xs">
              A live network connecting patients, donors and licensed blood banks — built to make the
              right match happen faster.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-full bg-red/10 text-red-deep flex items-center justify-center hover:bg-red hover:text-white transition-all">
                <Circle size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-red/10 text-red-deep flex items-center justify-center hover:bg-red hover:text-white transition-all">
                <Heart size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-red/10 text-red-deep flex items-center justify-center hover:bg-red hover:text-white transition-all">
                <Shield size={16} />
              </a>
            </div>
          </div>

          {/* Blood Services */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-ink-soft mb-4">Blood Services</h5>
            <Link to="/education" className="block text-[13.5px] font-semibold mb-2.5 hover:text-red-deep transition">Diseases &amp; Blood Types</Link>
            <Link to="/education" className="block text-[13.5px] font-semibold mb-2.5 hover:text-red-deep transition">Post Donation Care</Link>
            <Link to="/education" className="block text-[13.5px] font-semibold mb-2.5 hover:text-red-deep transition">Processing Charges</Link>
          </div>

          {/* Network */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-ink-soft mb-4">Network</h5>
            <Link to="/about" className="block text-[13.5px] font-semibold mb-2.5 hover:text-red-deep transition">About BLOOD NET</Link>
            <Link to="/camps" className="block text-[13.5px] font-semibold mb-2.5 hover:text-red-deep transition">Upcoming Camps</Link>
            <Link to="/" className="block text-[13.5px] font-semibold mb-2.5 hover:text-red-deep transition">Dashboard</Link>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-ink-soft mb-4">Contact</h5>
            <a href="mailto:support@bloodnet.in" className="flex items-center gap-2 text-[13.5px] font-semibold mb-2.5 hover:text-red-deep transition">
              <Mail size={14} /> support@bloodnet.in
            </a>
            <a href="tel:+911234567890" className="flex items-center gap-2 text-[13.5px] font-semibold mb-2.5 hover:text-red-deep transition">
              <Phone size={14} /> +91 123 456 7890
            </a>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2 pt-6 text-xs text-ink-soft">
          <span>© 2026 BLOOD NET. Built as an institute project — demo interface.</span>
          <span>Modaled with reference to Rotary Blood Centre Jodhpur's public service Modal.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;