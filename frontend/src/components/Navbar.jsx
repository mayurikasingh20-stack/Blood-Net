import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Droplet, Menu, X } from "lucide-react";
import useAuth from "../context/useAuth";

function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [usermenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 font-serif font-bold text-xl">
          <Droplet className="text-red fill-red" size={22} />
          BLOOD<span className="text-red">NET</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">

          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red/10 hover:text-red-deep transition">
              About &amp; Resources <ChevronDown size={12} className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 pt-2 w-64">
                <div className="bg-paper border border-ink/10 rounded-2xl shadow-xl p-2">
                  <Link to="/about#diseases" className="block px-3 py-2.5 rounded-lg hover:bg-red/10 hover:text-red-deep transition">
                    <p className="font-semibold text-sm">Diseases &amp; Blood Types</p>
                    <p className="text-xs text-ink-soft font-normal">What blood-borne illness needs what</p>
                  </Link>
                  <Link to="/about#care" className="block px-3 py-2.5 rounded-lg hover:bg-red/10 hover:text-red-deep transition">
                    <p className="font-semibold text-sm">Post Donation Care</p>
                    <p className="text-xs text-ink-soft font-normal">Recovery timeline &amp; tips</p>
                  </Link>
                  <Link to="/about#charges" className="block px-3 py-2.5 rounded-lg hover:bg-red/10 hover:text-red-deep transition">
                    <p className="font-semibold text-sm">Processing Charges</p>
                    <p className="text-xs text-ink-soft font-normal">Transparent component pricing</p>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/camps" className="px-3 py-2 rounded-lg hover:bg-red/10 hover:text-red-deep transition">
            Upcoming Camps
          </Link>
          <Link to="/" className="px-3 py-2 rounded-lg hover:bg-red/10 hover:text-red-deep transition">
            Dashboard
          </Link>
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <div
              className="relative"
              onMouseEnter={() => setLoginOpen(true)}
              onMouseLeave={() => setLoginOpen(false)}
            >
              <button className="flex items-center gap-1.5 border border-ink/20 px-5 py-2.5 rounded-full text-sm font-bold hover:border-red hover:text-red-deep transition">
                Login <ChevronDown size={12} className={`transition-transform ${loginOpen ? "rotate-180" : ""}`} />
              </button>
              {loginOpen && (
                <div className="absolute top-full right-0 pt-2 w-64">
                  <div className="bg-paper border border-ink/10 rounded-2xl shadow-xl p-2">
                    <Link to="/login?role=patient" className="block px-3 py-2.5 rounded-lg hover:bg-red/10 hover:text-red-deep transition">
                      <p className="font-semibold text-sm">Patient Login</p>
                      <p className="text-xs text-ink-soft font-normal">Request &amp; track blood needs</p>
                    </Link>
                    <Link to="/login?role=donor" className="block px-3 py-2.5 rounded-lg hover:bg-red/10 hover:text-red-deep transition">
                      <p className="font-semibold text-sm">Donor Login</p>
                      <p className="text-xs text-ink-soft font-normal">Manage donations &amp; eligibility</p>
                    </Link>
                    <Link to="/login?role=bloodbank" className="block px-3 py-2.5 rounded-lg hover:bg-red/10 hover:text-red-deep transition">
                      <p className="font-semibold text-sm">Blood Bank Dashboard</p>
                      <p className="text-xs text-ink-soft font-normal">Inventory &amp; camp management</p>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="relative"
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <button className="flex items-center gap-1.5 border border-ink/20 px-5 py-2.5 rounded-full text-sm font-bold hover:border-red hover:text-red-deep transition">
                Hi, {user.name?.split(" ")[0] || "there"} <ChevronDown size={12} className={`transition-transform ${usermenuOpen ? "rotate-180" : ""}`} />
              </button>
              {usermenuOpen && (
                <div className="absolute top-full right-0 pt-2 w-56">
                  <div className="bg-paper border border-ink/10 rounded-2xl shadow-xl p-2">
                    <Link to={`/${user.role}-dashboard`} className="block px-3 py-2.5 rounded-lg hover:bg-red/10 hover:text-red-deep transition text-sm font-semibold">
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-red/10 hover:text-red-deep transition text-sm font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <Link
            to="/login?role=donor"
            className="bg-red text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-[0_8px_20px_-6px_rgba(184,31,58,0.55)]
                       hover:bg-red-deep hover:-translate-y-0.5 transition-all"
          >
            Donate Blood
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-red/10"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink/10 bg-cream px-5 py-4 flex flex-col gap-1 text-sm font-semibold">
          <Link to="/about" className="px-3 py-2.5 rounded-lg hover:bg-red/10" onClick={() => setMobileOpen(false)}>Learn</Link>
          <Link to="/camps" className="px-3 py-2.5 rounded-lg hover:bg-red/10" onClick={() => setMobileOpen(false)}>Upcoming Camps</Link>
          <Link to="/" className="px-3 py-2.5 rounded-lg hover:bg-red/10" onClick={() => setMobileOpen(false)}>Dashboard</Link>

          <div className="h-px bg-ink/10 my-2" />

          {!user ? (
            <>
              <Link to="/login?role=patient" className="px-3 py-2.5 rounded-lg hover:bg-red/10" onClick={() => setMobileOpen(false)}>Patient Login</Link>
              <Link to="/login?role=donor" className="px-3 py-2.5 rounded-lg hover:bg-red/10" onClick={() => setMobileOpen(false)}>Donor Login</Link>
              <Link to="/login?role=bloodbank" className="px-3 py-2.5 rounded-lg hover:bg-red/10" onClick={() => setMobileOpen(false)}>Blood Bank Dashboard</Link>
            </>
          ) : (
            <>
              <Link to={`/${user.role}-dashboard`} className="px-3 py-2.5 rounded-lg hover:bg-red/10" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left px-3 py-2.5 rounded-lg hover:bg-red/10">Logout</button>
            </>
          )}

          <Link
            to="/login?role=donor"
            className="mt-2 bg-red text-white text-center font-bold px-5 py-2.5 rounded-full"
            onClick={() => setMobileOpen(false)}
          >
            Donate Blood
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;
