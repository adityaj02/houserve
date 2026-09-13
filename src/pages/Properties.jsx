import React, { useState, useEffect } from "react";
import PostPropertyModal from "../components/PostPropertyModal";
import ManageListingsModal from "../components/ManageListingsModal";
import PropertyDossierModal from "../components/PropertyDossierModal";
import { useAuth } from "../context/AuthContext";

function formatPrice(price) {
  if (!price) return "₹0";
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function Properties({ onBack, onOpenLogin }) {
  const auth = useAuth();
  const [propertiesList, setPropertiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCorridor, setSelectedCorridor] = useState("All Metro Enclaves");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Enclaves");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedDossierProperty, setSelectedDossierProperty] = useState(null);

  // Fetch properties from API
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/properties`);
      if (!res.ok) {
        throw new Error("Failed to fetch properties from server.");
      }
      const data = await res.json();
      setPropertiesList(data.properties || []);
    } catch (err) {
      console.error("Fetch properties error:", err);
      setError("Unable to load live properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handlePropertyCreated = (newProp) => {
    setPropertiesList((prev) => [newProp, ...prev]);
  };

  const handlePropertyDeleted = (deletedId) => {
    setPropertiesList((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handleQueryCatalog = (e) => {
    if (e) e.preventDefault();
    const catalogElement = document.getElementById("catalog-gallery");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter properties based on search query, category, corridor
  const filteredProperties = propertiesList.filter((item) => {
    // 1. City / Corridor filter
    if (selectedCorridor !== "All Metro Enclaves") {
      const city = (item.location?.city || "").toLowerCase();
      const address = (item.location?.address || "").toLowerCase();
      const target = selectedCorridor.toLowerCase();

      const matchesCity =
        (target.includes("bengaluru") && (city.includes("bengaluru") || city.includes("bangalore") || address.includes("bengaluru") || address.includes("indiranagar") || address.includes("koramangala"))) ||
        (target.includes("gurugram") && (city.includes("gurugram") || city.includes("gurgaon") || address.includes("gurugram") || address.includes("golf course"))) ||
        (target.includes("pune") && (city.includes("pune") || address.includes("pune"))) ||
        (target.includes("delhi") && (city.includes("delhi") || address.includes("delhi") || address.includes("hauz khas") || address.includes("defence colony")));

      if (!matchesCity && !target.includes(city) && !city.includes(target.split(" ")[0])) {
        return false;
      }
    }

    // 2. Category filter
    if (selectedCategory === "Bespoke Villas") {
      if (item.type !== "villa" && !item.title?.toLowerCase().includes("villa")) return false;
    } else if (selectedCategory === "High Penthouses") {
      if (item.type !== "apartment" && !item.title?.toLowerCase().includes("penthouse")) return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();

      const titleMatch = (item.title || "").toLowerCase().includes(q);
      const descMatch = (item.description || "").toLowerCase().includes(q);
      const addressMatch = (item.location?.address || "").toLowerCase().includes(q);
      const cityMatch = (item.location?.city || "").toLowerCase().includes(q);
      const sellerNameMatch = (item.seller?.name || "").toLowerCase().includes(q);
      const sellerEmailMatch = (item.seller?.email || "").toLowerCase().includes(q);
      const slugMatch = (item.slug || "").toLowerCase().includes(q);
      const priceStringMatch = (item.price ? item.price.toString() : "").includes(q) || formatPrice(item.price).toLowerCase().includes(q);
      const typeMatch = (item.type || "").toLowerCase().includes(q);

      const featuresMatch = Array.isArray(item.features)
        ? item.features.some((f) => f.toLowerCase().includes(q))
        : false;

      const specsMatch = item.specs
        ? (item.specs.area || "").toLowerCase().includes(q) ||
          (item.specs.bedrooms || "").toString().includes(q) ||
          (item.specs.bathrooms || "").toString().includes(q) ||
          (item.specs.layout || "").toLowerCase().includes(q) ||
          (item.specs.status || "").toLowerCase().includes(q)
        : false;

      return (
        titleMatch ||
        descMatch ||
        addressMatch ||
        cityMatch ||
        sellerNameMatch ||
        sellerEmailMatch ||
        slugMatch ||
        priceStringMatch ||
        typeMatch ||
        featuresMatch ||
        specsMatch
      );
    }

    return true;
  });

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 selection:bg-slate-900 selection:text-white font-sans min-h-screen">
      {/* HERO SECTION: ARCHITECTURAL BANNER WITH BACKGROUND IMAGE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6">
        <section className="relative rounded-3xl overflow-hidden bg-slate-950 text-white shadow-2xl border border-slate-800">
          {/* Background Image with Cinematic Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/Assets/property.png"
              alt="Property Banner"
              className="w-full h-full object-cover object-center opacity-45 mix-blend-luminosity filter contrast-125 brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/50 backdrop-blur-[2px]" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 px-6 sm:px-10 py-12 sm:py-16 text-center max-w-4xl mx-auto space-y-6">
            {/* Eyebrow Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-[11px] font-semibold tracking-wider text-slate-200 uppercase shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Direct-from-Owner Provenance
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.12]">
              Curated freehold residences, <br />
              <span className="text-slate-300 font-normal">verified at the deed.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              A tranquil exchange of architectural homes free from speculative markups. Secured with cadastral registry validation.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowPostModal(true)}
                className="px-6 py-3 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-slate-100 transition-colors shadow-lg cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">add_home</span>
                <span>Post Property (Zero Brokerage)</span>
              </button>
            </div>

            {/* FLOATING SEARCH BAR */}
            <div className="pt-4 max-w-3xl mx-auto">
              <form
                onSubmit={handleQueryCatalog}
                className="bg-slate-800/60 backdrop-blur-2xl border border-slate-600/50 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                {/* Corridor Selector */}
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 rounded-xl sm:w-1/3 text-left border border-slate-700/60">
                  <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined text-[15px]">explore</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Corridor</span>
                    <select
                      value={selectedCorridor}
                      onChange={(e) => setSelectedCorridor(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer border-none p-0 pr-2"
                    >
                      <option value="All Metro Enclaves" className="bg-slate-900 text-white">All Metro Enclaves</option>
                      <option value="Bengaluru Urban Core" className="bg-slate-900 text-white">Bengaluru</option>
                      <option value="Gurugram Golf Course Ext." className="bg-slate-900 text-white">Gurugram</option>
                      <option value="Pune Eastern IT Belt" className="bg-slate-900 text-white">Pune</option>
                      <option value="New Delhi" className="bg-slate-900 text-white">New Delhi</option>
                    </select>
                  </div>
                </div>

                {/* Locality Search Input */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-transparent text-left">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locality, architect or society..."
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 border-none focus:outline-none focus:ring-0 p-0 font-normal"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer px-1"
                      title="Clear search query"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Search CTA Button */}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer"
                >
                  <span>Search Homes</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </form>

              {/* Micro Guarantee Lineage */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-lg text-[11px] font-semibold tracking-wide text-slate-300">
                  <span className="material-symbols-outlined text-[14px] text-emerald-400">verified_user</span> 
                  100% Khata/Title Cleared
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-lg text-[11px] font-semibold tracking-wide text-slate-300">
                  <span className="material-symbols-outlined text-[14px] text-emerald-400">timer</span> 
                  30-Day Auto Delete Expiry
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-lg text-[11px] font-semibold tracking-wide text-slate-300">
                  <span className="material-symbols-outlined text-[14px] text-emerald-400">gpp_good</span> 
                  Houserve™ Ultrasound Tested
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-lg text-[11px] font-semibold tracking-wide text-slate-300">
                  <span className="material-symbols-outlined text-[14px] text-emerald-400">handshake</span> 
                  Direct Seller Deed
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* EDITORIAL CATALOG GALLERY */}
      <section id="catalog-gallery" className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-8">
        {/* Category Filter Header */}
        <div className="border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-display font-bold text-slate-950 tracking-tight">Selected Residences</h2>
            <span className="text-xs font-medium text-slate-400">Verified Direct Catalog</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            {["All Enclaves", "Bespoke Villas", "High Penthouses"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`pb-1 cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? "text-slate-950 font-bold border-b-2 border-slate-950"
                    : "hover:text-slate-950 text-slate-500"
                }`}
              >
                {cat} {cat === "All Enclaves" && `(${propertiesList.length})`}
              </button>
            ))}
            <button
              onClick={() => setShowManageModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 border border-slate-200 font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Manage My Listings
            </button>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 text-white font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              + Post Property
            </button>
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading && (
          <div className="py-16 text-center text-slate-500 font-medium text-sm animate-pulse">
            Loading verified properties...
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-center text-xs font-semibold">
            {error}
          </div>
        )}

        {!loading && !error && filteredProperties.length === 0 && (
          <div className="py-16 text-center text-slate-500 space-y-4">
            <p className="text-base font-semibold text-slate-900">No properties match your search or filter criteria.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCorridor("All Metro Enclaves");
                  setSelectedCategory("All Enclaves");
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-900 text-xs font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
              <button
                onClick={() => setShowPostModal(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Be the first to post a property here
              </button>
            </div>
          </div>
        )}

        {/* PROPERTY CARDS GRID */}
        {!loading && (
          <div className="space-y-6">
            {filteredProperties.map((item) => {
              const imageSrc =
                item.images && item.images.length > 0
                  ? item.images[0]
                  : "https://lh3.googleusercontent.com/aida/AEtjO1WA_HYwonXRMIcrpXCn_pQttTKI1yex5Tu25f3uLBgVKlkq_1O4DrWVf_QXZhoYK8FSsqOE59fiu1w8yjAj4ha1OWMLWzDqGyFJcpcjj-giAc1HiMGpYLHfRO1XI6iKYXkKjGIv6czNYxLDluEagNDMgLImlvCJW1KwTk3cg8ES8-V6u4doc5sp1ndHB3QCHm_1VpTOzmI5ozXpYTEf3U7z0S3e3joD02Z3d_CBO-iUKiwLQVLRnQYEhnRd";

              const sellerName = item.seller?.name || "Direct Resident Owner";
              const sellerInitials = sellerName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || "OW";

              const locationText = `${item.location?.address || ""}${
                item.location?.city ? ` · ${item.location.city}` : ""
              }`;

              const featuresList = item.features && item.features.length > 0
                ? item.features
                : ["Direct Seller Deed", "100% Freehold"];

              // 30-Day Auto Delete Countdown calculation
              const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
              const expireDate = item.expiresAt
                ? new Date(item.expiresAt)
                : new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
              const daysLeft = Math.max(
                0,
                Math.ceil((expireDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              );

              return (
                <article
                  key={item._id || item.slug}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-300 transition-all duration-300 shadow-[0_1px_3px_0_rgba(15,23,42,0.04),0_10px_24px_-6px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_32px_-8px_rgba(15,23,42,0.06)]"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Image Section */}
                    <div className="lg:col-span-6 relative bg-slate-100 aspect-[16/10] lg:aspect-auto overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={item.title}
                        className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700 hover:scale-[1.02]"
                      />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {featuresList.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur text-[10px] uppercase font-semibold tracking-wider text-white border border-slate-800 shadow-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* 30-Day Expiry Timer Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur text-white text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">timer</span>
                        <span>{daysLeft} Days Left</span>
                      </div>

                      <div className="absolute bottom-4 left-4 text-[11px] font-mono tracking-tight text-white/95 bg-slate-950/85 backdrop-blur px-3 py-1 rounded-md border border-slate-800">
                        Title Audit № {item.slug ? item.slug.substring(0, 12).toUpperCase() : "HS-DEED"} · Verified
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-950"></span>
                            {locationText || "Metro Enclave"}
                          </span>
                          <span className="font-display text-xl font-bold text-slate-950 normal-case tracking-tight">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <h3
                          onClick={() => setSelectedDossierProperty(item)}
                          className="font-display text-xl sm:text-2xl font-bold text-slate-950 tracking-tight leading-snug hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal pt-1">
                          {item.description}
                        </p>
                      </div>

                      {/* 3-Column Key Spec Grid */}
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                        <div>
                          <span className="block text-xs font-semibold text-slate-900">
                            {item.specs?.areaSqFt ? `${item.specs.areaSqFt} sq.ft` : "1,200 sq.ft"}
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">Area</span>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-slate-900">
                            {item.specs?.bedrooms ? `${item.specs.bedrooms} Bed / ${item.specs.bathrooms || 2} Bath` : "3 Bed / 2 Bath"}
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">Layout</span>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-slate-900 font-capitalize">
                            {item.specs?.furnishedStatus || "Semi-Furnished"}
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">Status</span>
                        </div>
                      </div>

                      {/* Footer Row: Owner Profile & Delete / Dossier Link */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                            {sellerInitials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{sellerName}</div>
                            <div className="text-[10px] text-slate-400">
                              {item.seller?.email ? item.seller.email : "Direct Owner"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const sellerEmail = item.seller?.email;
                              const userEmail = auth?.user?.email;

                              if (auth?.isAuthenticated && userEmail && sellerEmail && sellerEmail.toLowerCase().trim() === userEmail.toLowerCase().trim()) {
                                if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                                  try {
                                    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
                                    const res = await fetch(`${apiUrl}/api/properties/by-id/${item._id}?ownerEmail=${encodeURIComponent(userEmail)}`, {
                                      method: "DELETE",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ ownerEmail: userEmail })
                                    });
                                    if (res.ok) {
                                      handlePropertyDeleted(item._id);
                                    } else {
                                      alert("Failed to delete property.");
                                    }
                                  } catch (err) {
                                    console.error("Direct delete error:", err);
                                  }
                                }
                              } else {
                                setShowManageModal(true);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
                            title="Delete or manage listing"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            <span>Delete</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedDossierProperty(item)}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-950 text-slate-900 hover:text-white transition-all text-xs font-semibold inline-flex items-center gap-1 cursor-pointer group"
                          >
                            <span>Dossier</span>
                            <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">
                              arrow_forward
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Minimalist Editorial Pagination */}
        <div className="pt-6 flex items-center justify-between border-t border-slate-200/80 text-xs text-slate-500 font-medium">
          <span>Showing {filteredProperties.length} of {propertiesList.length} verified properties</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed" disabled>
              Previous
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-slate-950 text-white font-bold">1</span>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
              Next
            </button>
          </div>
        </div>
      </section>

      {/* CUSTODY & ESCROW PROTOCOL BLOCK */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-8">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              The Custody Protocol
            </span>
            <h2 className="font-display text-2xl sm:text-4xl text-white font-bold leading-tight">
              “Real estate transactions should operate like sovereign escrow—settled with mathematical calm.”
            </h2>
            <p className="text-slate-300 font-normal text-sm sm:text-base leading-relaxed max-w-2xl">
              By eliminating commissions, Houserve aligns the buyer and seller directly. Funds are held strictly in designated RBI-regulated escrow custody accounts, released only upon joint biometric deed confirmation at the Sub-Registrar’s office.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-800">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div className="font-mono text-xs text-slate-400 font-semibold">01 / Cadastral Audit</div>
              <h4 className="font-display font-bold text-sm text-white">30-Point Digital Lineage</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Cross-checked against state revenue dockets (Kaveri, Dharani, Meebhoomi) for unencumbered titles.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[18px]">home_repair_service</span>
              </div>
              <div className="font-mono text-xs text-slate-400 font-semibold">02 / Ultrasound Diagnostics</div>
              <h4 className="font-display font-bold text-sm text-white">Structural Health Scan</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Certified Houserve™ engineers test column stress, conduit loads, and thermal moisture seepage.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
              </div>
              <div className="font-mono text-xs text-slate-400 font-semibold">03 / Dual-Signoff Escrow</div>
              <h4 className="font-display font-bold text-sm text-white">Settlement Protection</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Tokens remain secured in regulated custody; seller receives disbursement upon registrar seal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MONOGRAPH CLOSING BANNER */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-4 pb-16">
        <div className="border border-slate-200/80 rounded-3xl p-8 sm:p-12 bg-white flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-[0_1px_3px_0_rgba(15,23,42,0.04),0_10px_24px_-6px_rgba(15,23,42,0.03)]">
          <div className="max-w-xl space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Direct Peer-to-Peer
            </span>
            <h3 className="font-display text-2xl sm:text-3xl text-slate-950 font-bold leading-snug">
              Are you holding an exceptional residence?
            </h3>
            <p className="text-slate-500 font-normal text-xs sm:text-sm leading-relaxed">
              List your freehold home directly. Our guild performs the digital audit, schedules visits with verified buyers, and structures zero-brokerage settlement at no fee.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setShowPostModal(true)}
              type="button"
              className="px-6 py-3 bg-slate-950 text-white text-xs font-semibold tracking-wide rounded-xl text-center hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              Initiate Title Audit &amp; List Free
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-slate-100 text-slate-900 text-xs font-semibold tracking-wide rounded-xl text-center hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
            >
              Escrow Calculator
            </button>
          </div>
        </div>
      </section>

      {/* POST PROPERTY MODAL */}
      {showPostModal && (
        <PostPropertyModal
          onClose={() => setShowPostModal(false)}
          onSuccess={handlePropertyCreated}
        />
      )}

      {/* MANAGE LISTINGS MODAL */}
      {showManageModal && (
        <ManageListingsModal
          onClose={() => setShowManageModal(false)}
          onPropertyDeleted={handlePropertyDeleted}
          onOpenLogin={onOpenLogin}
        />
      )}

      {/* PROPERTY DOSSIER MODAL */}
      {selectedDossierProperty && (
        <PropertyDossierModal
          property={selectedDossierProperty}
          onClose={() => setSelectedDossierProperty(null)}
          onOpenLogin={onOpenLogin}
        />
      )}
    </div>
  );
}
