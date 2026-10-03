import { useState, useEffect, useRef } from "react";
import "../styles/global.css";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Properties from "./Properties";
import Rentals from "./Rentals";
import { useAuth } from "../context/AuthContext";
import ManageListingsModal from "../components/ManageListingsModal";
import Footer from "../components/layout/Footer";

function formatPrice(price) {
  if (!price) return "Price on request";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function Landing({ initialLoginOpen = false }) {
  const [openLogin, setOpenLogin] = useState(initialLoginOpen);
  const [openManageListings, setOpenManageListings] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated;
  const signOut = auth?.signOut;
  const user = auth?.user;

  // Dynamic property data
  const [buyProps, setBuyProps] = useState([]);
  const [rentProps, setRentProps] = useState([]);
  const [propsLoading, setPropsLoading] = useState(true);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setOpenLogin(initialLoginOpen);
  }, [initialLoginOpen]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real properties from API
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    setPropsLoading(true);
    Promise.all([
      fetch(`${apiUrl}/api/properties?listingFor=sale`).then(r => r.json()).catch(() => ({ properties: [] })),
      fetch(`${apiUrl}/api/properties?listingFor=rent`).then(r => r.json()).catch(() => ({ properties: [] })),
    ]).then(([saleData, rentData]) => {
      const saleList = saleData.properties || [];
      const rentList = rentData.properties || [];
      // Pick up to 3 random properties from each list
      const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
      setBuyProps(shuffle(saleList).slice(0, 3));
      setRentProps(shuffle(rentList).slice(0, 3));
    }).finally(() => setPropsLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const goToServices = (query = "") => {
    setServiceSearchQuery(query);
    setDropdownOpen(false);
    setActiveView("houserve");
  };

  if (activeView === "houserve") {
    return <Dashboard onBackToHouserve={() => setActiveView("overview")} initialSearchQuery={serviceSearchQuery} />;
  }

  // Mini property card for the overview
  function MiniPropertyCard({ item, type }) {
    const imageSrc = item.images?.length > 0 ? item.images[0] : "/Assets/property.png";
    const location = [item.location?.address, item.location?.city].filter(Boolean).join(" · ");
    const price = type === "rent"
      ? (item.price >= 100000 ? `₹${(item.price / 100000).toFixed(1)}L/mo` : `₹${(item.price || 0).toLocaleString("en-IN")}/mo`)
      : formatPrice(item.price);
    const beds = item.specs?.bedrooms;
    const area = item.specs?.area;
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:border-black hover:shadow-md transition-all flex flex-col">
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img src={imageSrc} alt={item.title} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {item.features?.slice(0, 1).map((f, i) => (
              <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm text-white">{f}</span>
            ))}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/90 text-white backdrop-blur-sm">{type === "rent" ? "For Rent" : "For Sale"}</span>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-black leading-tight">{item.title}</h3>
            {location && <p className="text-xs text-gray-500 mt-0.5 font-medium">{location}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 font-medium">
              {beds && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">bed</span>{beds} BHK</span>}
              {area && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">square_foot</span>{area}</span>}
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-base font-bold text-black">{price}</span>
            <button onClick={() => setActiveView(type === "rent" ? "rentals" : "properties")} className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer">View Details</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-black selection:text-white relative min-h-screen">
      
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover"
        style={{ zIndex: 0, opacity: Math.max(0, 0.55 - scrollY / 900) }}
      >
        <source src="/Assets/Loginvideo.mp4" type="video/mp4" />
      </video>
      {/* White overlay fades IN as user scrolls — starts fully transparent */}
      <div
        className="fixed inset-0 bg-white"
        style={{ zIndex: 1, opacity: Math.min(0.92, scrollY / 350) }}
      ></div>

      {openLogin && <Login onClose={() => setOpenLogin(false)} />}
      {openManageListings && <ManageListingsModal onClose={() => setOpenManageListings(false)} />}

      {/* 1. NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Houserve logo */}
          <button onClick={() => setActiveView("overview")} className="flex items-center gap-2 group cursor-pointer">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <img
                src="/Assets/LOGO.png"
                alt="Houserve"
                className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-black group-hover:text-gray-700 transition-colors">Houserve</span>
          </button>
          
          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium text-gray-600">
            <button onClick={() => setActiveView("overview")} className={`transition-colors cursor-pointer ${activeView === "overview" ? "text-black font-semibold relative py-1 after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-[2px] after:bg-black" : "hover:text-black"}`}>Overview</button>
            <button onClick={() => setActiveView("houserve")} className={`transition-colors cursor-pointer ${activeView === "houserve" ? "text-black font-semibold relative py-1 after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-[2px] after:bg-black" : "hover:text-black"}`}>Houserve</button>
            <a href="https://build-kart-in-is6v.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">BuildKart</a>
            <button onClick={() => setActiveView("properties")} className={`transition-colors cursor-pointer ${activeView === "properties" ? "text-black font-semibold relative py-1 after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-[2px] after:bg-black" : "hover:text-black"}`}>Buy</button>
            <button onClick={() => setActiveView("rentals")} className={`transition-colors cursor-pointer ${activeView === "rentals" ? "text-black font-semibold relative py-1 after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-[2px] after:bg-black" : "hover:text-black"}`}>Rent</button>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 relative">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveView("houserve")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#05070f] text-white text-[13px] font-medium hover:bg-black/85 transition-colors shadow-sm cursor-pointer">
                  <span>Houserve Pro</span>
                  <span className="text-xs">→</span>
                </button>
                <div className="relative" ref={userMenuRef}>
                    <div
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className="relative w-9 h-9 rounded-full bg-[#0a1122] flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all select-none"
                    >
                        <span className="material-symbols-outlined text-[19px]">person</span>
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#10b981] border-2 border-white rounded-full"></span>
                    </div>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl border border-slate-200/80 bg-white py-2 z-[100]">
                          <button onClick={() => { setOpenManageListings(true); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                            <span className="material-symbols-outlined text-[18px] text-slate-400">home_work</span>
                            Manage My Listings
                          </button>
                          <hr className="my-1 border-t border-slate-100" />
                          <button 
                              type="button"
                              onClick={() => { signOut(); setUserMenuOpen(false); }} 
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2"
                          >
                              <span className="material-symbols-outlined text-[18px]">logout</span>
                              Log out
                          </button>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <button onClick={() => setOpenLogin(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#05070f] text-white text-[13px] font-medium hover:bg-black/85 transition-colors shadow-sm cursor-pointer">
                <span>Get Started</span>
                <span className="text-xs">→</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ROUTING LOGIC */}
      {activeView === "properties" ? (
        <div className="relative z-10">
          <Properties
            onBack={() => setActiveView("overview")}
            onOpenLogin={() => setOpenLogin(true)}
          />
        </div>
      ) : activeView === "rentals" ? (
        <div className="relative z-10">
          <Rentals
            onBack={() => setActiveView("overview")}
            onOpenLogin={() => setOpenLogin(true)}
          />
        </div>
      ) : activeView === "houserve" ? (
        <div className="relative z-10">
          <Dashboard />
        </div>
      ) : (
        <main className="relative z-10 pt-20 pb-12 w-full">
          {/* HERO SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-4">

              {/* Glass hero text card */}
              <div className="w-full px-8 py-7 rounded-3xl bg-white/30 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.10)] ring-1 ring-white/20">
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-black tracking-tight leading-[1.12]">
                  Home services &amp; architectural supplies at your doorstep.
                </h1>
                <p className="text-gray-700 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed mt-3">Certified technicians, wholesale finishes, verified properties.</p>
              </div>

              {/* Custom Glass SERVICE DROPDOWN */}
              {(() => {
                const SERVICES_LIST = [
                  { key: "AC",         icon: "ac_unit",           label: "AC Service & Repair",       desc: "Jet overhaul, gas refill, deep clean" },
                  { key: "Plumbing",   icon: "water_drop",        label: "Plumbing & Drain Cleaning",  desc: "100-bar jet drain, leak fix" },
                  { key: "Electrical", icon: "bolt",              label: "Electrical & Wiring",        desc: "FLIR thermal audit, panel work" },
                  { key: "Painting",   icon: "format_paint",      label: "Painting & Finishing",       desc: "Interior, exterior, waterproofing" },
                  { key: "Carpentry",  icon: "carpenter",         label: "Carpentry & Furniture",      desc: "Custom fit-outs, modular repair" },
                  { key: "Cleaning",   icon: "cleaning_services", label: "Deep Cleaning",              desc: "Full-home, kitchen, post-reno" },
                  { key: "Building",   icon: "construction",      label: "Civil & Construction",       desc: "Renovations, waterproofing, tiling" },
                ];
                const selected = SERVICES_LIST.find(s => s.key === serviceSearchQuery);
                return (
                  <div className="w-full max-w-2xl mt-2 relative" ref={dropdownRef}>
                    {/* Trigger bar */}
                    <div className="flex items-center gap-2 p-1.5 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.10)] ring-1 ring-white/30">
                      <button
                        onClick={() => setDropdownOpen(o => !o)}
                        className="flex flex-grow items-center gap-3 pl-3 py-2 text-left cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-black/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-gray-800 text-[20px]">{selected ? selected.icon : "home_repair_service"}</span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{selected ? selected.label : "Select a Houserve service..."}</div>
                          {selected && <div className="text-[11px] text-gray-500 truncate">{selected.desc}</div>}
                        </div>
                        <span className={`material-symbols-outlined text-gray-500 text-[20px] mr-1 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>expand_more</span>
                      </button>
                      <button
                        onClick={() => goToServices(serviceSearchQuery)}
                        className="px-5 py-3 bg-black/85 hover:bg-black text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md flex-shrink-0 cursor-pointer backdrop-blur-sm active:scale-95"
                      >
                        <span>Book</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>

                    {/* Dropdown panel */}
                    {dropdownOpen && (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl bg-white/60 backdrop-blur-2xl border border-white/70 shadow-[0_16px_48px_rgba(0,0,0,0.18)] ring-1 ring-white/30 overflow-hidden">
                        {SERVICES_LIST.map((s) => (
                          <button
                            key={s.key}
                            onClick={() => goToServices(s.key)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/70 transition-colors cursor-pointer group ${
                              serviceSearchQuery === s.key ? "bg-white/80" : ""
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                              serviceSearchQuery === s.key
                                ? "bg-black text-white"
                                : "bg-black/8 text-gray-700 group-hover:bg-black group-hover:text-white"
                            }`}>
                              <span className="material-symbols-outlined text-[19px]">{s.icon}</span>
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="text-sm font-semibold text-gray-900">{s.label}</div>
                              <div className="text-[11px] text-gray-500 font-medium">{s.desc}</div>
                            </div>
                            {serviceSearchQuery === s.key && (
                              <span className="material-symbols-outlined text-black text-[18px] flex-shrink-0">check</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Glass quick-book chips */}
              <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-gray-800 font-medium px-5 py-2.5 rounded-full bg-white/35 backdrop-blur-xl border border-white/50 shadow-sm ring-1 ring-white/20">
                <span className="text-gray-500">Quick book:</span>
                <button onClick={() => goToServices("AC")} className="hover:text-black underline underline-offset-4 decoration-gray-400 cursor-pointer">AC Overhaul</button>
                <span className="text-gray-400">•</span>
                <button onClick={() => goToServices("Plumbing")} className="hover:text-black underline underline-offset-4 decoration-gray-400 cursor-pointer">Hydro Plumbing</button>
                <span className="text-gray-400">•</span>
                <button onClick={() => goToServices("Electrical")} className="hover:text-black underline underline-offset-4 decoration-gray-400 cursor-pointer">Master Electrical</button>
              </div>

            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Glass property card */}
              <div className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-white/20 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-white/20 group">
                <img alt="Modern luxury Indian apartment living room" className="w-full h-80 sm:h-96 lg:h-full object-cover group-hover:scale-[1.01] transition-transform duration-500" src="/Assets/property.png" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase tracking-wider font-semibold text-white/80">Turnkey Renovation • Delhi NCR</span>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">Bespoke residential & bath buildouts</h3>
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => setActiveView("properties")} className="text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-full cursor-pointer">Explore Projects</button>
                    <span className="text-xs text-white/80 font-medium">60-Day Shield</span>
                  </div>
                </div>
              </div>
              {/* Glass service card */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden bg-white/20 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-white/20 group">
                <img alt="Professional Indian HVAC electrician" className="w-full h-80 sm:h-96 lg:h-full object-cover group-hover:scale-[1.01] transition-transform duration-500" src="/Assets/ac-service.png" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> 45-Min Emergency Dispatch</span>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">Certified Master Mechanics</h3>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                    <span className="text-sm font-bold text-white">From ₹699</span>
                    <button onClick={() => setActiveView("houserve")} className="text-xs bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-black font-semibold px-3.5 py-1.5 rounded-full transition-colors cursor-pointer">Book Trade</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CLEAN CATEGORY GRID */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="services">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight text-black">Instant Booking & Trade Services</h2>
              <button onClick={() => setActiveView("houserve")} className="text-sm font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer">
                <span>View All 18 Services</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { icon: "ac_unit", title: "AC Jet Overhaul", price: "From ₹699", badge: "60-Day Shield", badgeClass: "text-emerald-700 bg-emerald-50", dest: "houserve" },
                { icon: "bolt", title: "Master Electrical", price: "FLIR Thermal Audit", badge: "₹1,499 Flat", badgeClass: "text-gray-700 bg-gray-100", dest: "houserve" },
                { icon: "water_drop", title: "Hydro Plumbing", price: "100-Bar Jet Drain", badge: "From ₹899", badgeClass: "text-gray-700 bg-gray-100", dest: "houserve" },
                { icon: "bathtub", title: "Sanitaryware Depot", price: "Kohler & Jaquar", badge: "Wholesale Crate", badgeClass: "text-indigo-700 bg-indigo-50", dest: "buildkart" },
                { icon: "grid_on", title: "Kajaria Slabs", price: "1200x1800mm Slabs", badge: "₹118 / sq.ft", badgeClass: "text-gray-700 bg-gray-100", dest: "buildkart" },
                { icon: "door_front", title: "Door Hardware", price: "Invisible Hinges", badge: "5k+ Catalog", badgeClass: "text-gray-700 bg-gray-100", dest: "buildkart" }
              ].map((s, idx) => {
                const cardClass = "bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 hover:border-black transition-all group flex flex-col items-center text-center cursor-pointer shadow-sm";
                const inner = (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-black group-hover:text-white flex items-center justify-center text-black mb-3 transition-colors shadow-sm">
                      <span className="material-symbols-outlined text-[26px]">{s.icon}</span>
                    </div>
                    <span className="text-sm font-bold text-black">{s.title}</span>
                    <span className="text-xs text-gray-600 font-medium mt-0.5">{s.price}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full mt-2 ${s.badgeClass}`}>{s.badge}</span>
                  </>
                );
                return s.dest === "houserve"
                  ? <div key={idx} onClick={() => setActiveView("houserve")} className={cardClass}>{inner}</div>
                  : <a key={idx} href="https://build-kart-in-is6v.vercel.app" target="_blank" rel="noopener noreferrer" className={cardClass}>{inner}</a>;
              })}
            </div>
          </section>

          {/* BUILDKART ARCHITECTURAL LINES */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="buildkart">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-300 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Direct From Manufacturer Depot</span>
                <h2 className="text-3xl font-bold tracking-tight text-black mt-1">BuildKart Architectural Lines</h2>
                <p className="text-sm text-gray-700 max-w-xl mt-1 font-medium">Wholesale catalog & 4-hr site delivery in Delhi NCR.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-black text-white px-3 py-1.5 rounded-full font-medium shadow-sm">Delhi Depots</span>
                <a className="text-xs font-semibold text-black hover:underline flex items-center gap-1 border border-gray-300 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm" href="https://build-kart-in-is6v.vercel.app" target="_blank" rel="noopener noreferrer">
                  <span>build-kart-in.vercel.app</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-[#fbf9f6]/95 backdrop-blur-sm rounded-2xl border border-[#ede7df] overflow-hidden flex flex-col justify-between shadow-sm">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">CATEGORY 01</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black text-white shadow-sm">Kohler & Jaquar Authorized</span>
                  </div>
                  <h3 className="text-3xl font-bold text-black tracking-tight mt-2">Sanitaryware & Bath Suites.</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#ede7df] shadow-sm">
                      <span className="material-symbols-outlined text-black text-[22px]">water_drop</span>
                      <div>
                        <div className="text-xs font-bold text-black">Water Management</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 font-medium">Precision flow & thermostatic balancing</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#ede7df] shadow-sm">
                      <span className="material-symbols-outlined text-black text-[22px]">spa</span>
                      <div>
                        <div className="text-xs font-bold text-black">Wellness Experience</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 font-medium">Sculptural tubs & hydrotherapy steam</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full overflow-hidden border-t border-[#ede7df] bg-white">
                  <img alt="Modern luxury bathroom" className="w-full h-72 sm:h-80 object-cover object-center" src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=2070&auto=format&fit=crop" />
                </div>
              </div>
              
              <div className="lg:col-span-5 bg-[#fbf9f6]/95 backdrop-blur-sm rounded-2xl border border-[#ede7df] overflow-hidden flex flex-col justify-between shadow-sm">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">CATEGORY 02</span>
                      <h3 className="text-3xl font-bold text-black tracking-tight mt-1">Hardware & Finishing.</h3>
                    </div>
                    <a className="text-xs font-semibold text-black border border-gray-300 bg-white px-3 py-1 rounded-md hover:bg-gray-50 shadow-sm" href="https://build-kart-in-is6v.vercel.app" target="_blank" rel="noopener noreferrer">View All</a>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#ede7df] shadow-sm">
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-black text-[18px]">door_front</span><span className="text-xs font-semibold text-black">Signature Handles & Levers</span></div>
                      <span className="text-[11px] text-gray-500 font-medium">Custom Forged Brass</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#ede7df] shadow-sm">
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-black text-[18px]">lock</span><span className="text-xs font-semibold text-black">Invisible 3D Hinges</span></div>
                      <span className="text-[11px] text-gray-500 font-medium">Zero Clearance 180°</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#ede7df] shadow-sm">
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-black text-[18px]">tune</span><span className="text-xs font-semibold text-black">Magnetic Mortise Locks</span></div>
                      <span className="text-[11px] text-gray-500 font-medium">Silent Latch Standard</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#ede7df]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-black border border-gray-300" title="Matte Black"></span>
                      <span className="w-3 h-3 rounded-full bg-gray-400" title="Satin Nickel"></span>
                      <span className="w-3 h-3 rounded-full bg-[#b89758]" title="Antique Brass"></span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-black">5,000+ SKUs</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white border-t border-[#ede7df]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#fafbfc] border border-gray-200 shadow-sm">
                      <div className="text-xs font-bold text-black">Electrical & Switchgear</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 font-medium">Schneider, Legrand & Crabtree</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#fafbfc] border border-gray-200 shadow-sm">
                      <div className="text-xs font-bold text-black">Vitrified Tiles & Slabs</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 font-medium">Kajaria 1200x1800mm zero-absorption slabs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* PRODUCT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-4 flex flex-col justify-between shadow-sm hover:border-black transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">33% OFF</span>
                    <span className="text-xs text-gray-600 font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-amber-500 text-[14px]">star</span> 4.85</span>
                  </div>
                  <h4 className="font-bold text-base text-black">Inverter AC Deep Jet Overhaul</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Foam wash & gas check</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                  <button onClick={() => setActiveView("houserve")} className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm">Instant Book</button>
                </div>
              </div>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-4 flex flex-col justify-between shadow-sm hover:border-black transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-black bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Contractor Rate</span>
                    <span className="text-xs text-gray-600 font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-black text-[14px]">local_shipping</span> 4-Hr Drop</span>
                  </div>
                  <h4 className="font-bold text-base text-black">Kajaria Vitrified Slabs</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Statuario 9mm rectified</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                  <a href="https://build-kart-in-is6v.vercel.app" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-black text-xs font-semibold rounded-lg transition-colors shadow-sm">Order Pallet</a>
                </div>
              </div>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-4 flex flex-col justify-between shadow-sm hover:border-black transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Kohler OEM</span>
                    <span className="text-xs text-gray-600 font-semibold">10-Yr Shield</span>
                  </div>
                  <h4 className="font-bold text-base text-black">Artifacts Thermostatic Diverter</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Solid forged brass core</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                  <a href="https://build-kart-in-is6v.vercel.app" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">Add to Cart</a>
                </div>
              </div>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-4 flex flex-col justify-between shadow-sm hover:border-black transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-black bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Smart Entry</span>
                    <span className="text-xs text-gray-600 font-semibold">Zigbee 3.0</span>
                  </div>
                  <h4 className="font-bold text-base text-black">Digital Smart Door Lock</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Biometric & RFID unlock</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                  <a href="https://build-kart-in-is6v.vercel.app" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">Buy Now</a>
                </div>
              </div>
            </div>
          </section>

          {/* VERIFIED ARCHITECTURAL ASSETS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="properties">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-300 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">VERIFIED ARCHITECTURAL ASSETS</span>
                <h2 className="text-3xl font-bold tracking-tight text-black mt-1">Curated Residential Properties for Sale & Rent</h2>
                <p className="text-sm text-gray-700 max-w-2xl mt-1 font-medium">Direct owner & developer transactions. Verified titles in Delhi NCR.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setActiveView("properties")} className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-black text-white shadow-sm cursor-pointer">All Buy Properties</button>
                <button onClick={() => setActiveView("rentals")} className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors shadow-sm cursor-pointer">All Rentals</button>
              </div>
            </div>
            
            {/* --- BUY PROPERTIES --- */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">home</span>For Sale
                </h3>
                <button onClick={() => setActiveView("properties")} className="text-xs font-semibold text-gray-600 hover:text-black underline underline-offset-4 cursor-pointer">View all →</button>
              </div>

              {propsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white/80 rounded-2xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : buyProps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {buyProps.map(item => <MiniPropertyCard key={item._id} item={item} type="sale" />)}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 py-12 flex flex-col items-center justify-center gap-3 text-center">
                  <span className="material-symbols-outlined text-[40px] text-gray-400">add_home</span>
                  <p className="text-sm font-semibold text-gray-700">No properties listed for sale yet.</p>
                  <p className="text-xs text-gray-500">Be the first to list your property — zero brokerage.</p>
                  <button
                    onClick={() => isAuthenticated ? setActiveView("properties") : setOpenLogin(true)}
                    className="mt-2 px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
                  >
                    + Post a Property
                  </button>
                </div>
              )}
            </div>

            {/* --- RENT PROPERTIES --- */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">key</span>For Rent
                </h3>
                <button onClick={() => setActiveView("rentals")} className="text-xs font-semibold text-gray-600 hover:text-black underline underline-offset-4 cursor-pointer">View all →</button>
              </div>

              {propsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white/80 rounded-2xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : rentProps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rentProps.map(item => <MiniPropertyCard key={item._id} item={item} type="rent" />)}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 py-12 flex flex-col items-center justify-center gap-3 text-center">
                  <span className="material-symbols-outlined text-[40px] text-gray-400">key</span>
                  <p className="text-sm font-semibold text-gray-700">No rentals listed yet.</p>
                  <p className="text-xs text-gray-500">List your property for rent — reach verified tenants directly.</p>
                  <button
                    onClick={() => isAuthenticated ? setActiveView("rentals") : setOpenLogin(true)}
                    className="mt-2 px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
                  >
                    + List for Rent
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* TRUST & HOUSERVE PRO BANNER */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="pro">
            <div className="bg-[#0b0f19]/90 backdrop-blur-md rounded-2xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-white/10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Houserve Pro
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Developer or property manager?</h3>
                <p className="text-sm text-gray-300">Enterprise SLA facility operations and depot supply.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-shrink-0">
                <button onClick={() => setActiveView("houserve")} className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors shadow-sm cursor-pointer">Deploy Houserve Pro →</button>
                <a className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm text-center transition-colors border border-white/10" href="tel:+919811797407">Call Concierge</a>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* FOOTER - Renders globally for all views */}
      <Footer setActiveView={setActiveView} />
    </div>
  );
}
