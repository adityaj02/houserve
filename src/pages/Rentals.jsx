import React, { useState, useEffect } from "react";
import PostPropertyModal from "../components/PostPropertyModal";
import ManageListingsModal from "../components/ManageListingsModal";
import PropertyDossierModal from "../components/PropertyDossierModal";
import { useAuth } from "../context/AuthContext";

function formatRent(price) {
  if (!price) return "₹0/mo";
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)}L/mo`;
  }
  return `₹${price.toLocaleString("en-IN")}/mo`;
}

export default function Rentals({ onBack, onOpenLogin }) {
  const auth = useAuth();
  const [rentalsList, setRentalsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCorridor, setSelectedCorridor] = useState("All Metro Enclaves");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Rentals");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedDossierProperty, setSelectedDossierProperty] = useState(null);

  // Fetch rentals from API (reusing properties endpoint — in a real app you'd filter by listing_type=rent)
  const fetchRentals = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/properties?type=rent`);
      if (!res.ok) {
        throw new Error("Failed to fetch rentals from server.");
      }
      const data = await res.json();
      setRentalsList(data.properties || []);
    } catch (err) {
      console.error("Fetch rentals error:", err);
      setError("Unable to load live rental listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleRentalCreated = (newProp) => {
    setRentalsList((prev) => [newProp, ...prev]);
  };

  const handleRentalDeleted = (deletedId) => {
    setRentalsList((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handleScrollToCatalog = (e) => {
    if (e) e.preventDefault();
    const catalogElement = document.getElementById("rental-catalog-gallery");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter rentals
  const filteredRentals = rentalsList.filter((item) => {
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

    if (selectedCategory === "Studio & 1 BHK") {
      const beds = item.specs?.bedrooms;
      if (beds && Number(beds) > 1) return false;
    } else if (selectedCategory === "Premium 3+ BHK") {
      const beds = item.specs?.bedrooms;
      if (!beds || Number(beds) < 3) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const titleMatch = (item.title || "").toLowerCase().includes(q);
      const descMatch = (item.description || "").toLowerCase().includes(q);
      const addressMatch = (item.location?.address || "").toLowerCase().includes(q);
      const cityMatch = (item.location?.city || "").toLowerCase().includes(q);
      const sellerNameMatch = (item.seller?.name || "").toLowerCase().includes(q);
      const typeMatch = (item.type || "").toLowerCase().includes(q);
      const featuresMatch = Array.isArray(item.features)
        ? item.features.some((f) => f.toLowerCase().includes(q))
        : false;

      return titleMatch || descMatch || addressMatch || cityMatch || sellerNameMatch || typeMatch || featuresMatch;
    }

    return true;
  });

  return (
    <div className="w-full bg-[#f0f4f8] text-slate-900 selection:bg-indigo-700 selection:text-white font-sans min-h-screen">
      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6">
        <section className="relative rounded-3xl overflow-hidden bg-indigo-950 text-white shadow-2xl border border-indigo-900">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/Assets/property.png"
              alt="Rental Property Banner"
              className="w-full h-full object-cover object-center opacity-35 mix-blend-luminosity filter contrast-125 brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/90 to-indigo-950/50 backdrop-blur-[2px]" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 px-6 sm:px-10 py-12 sm:py-16 text-center max-w-4xl mx-auto space-y-6">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/90 backdrop-blur-md border border-indigo-700/60 text-[11px] font-semibold tracking-wider text-indigo-200 uppercase shadow-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Zero-Broker Rental Marketplace
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-[1.12]">
              Verified rentals, no middlemen, <br />
              <span className="text-indigo-300 font-normal">move in with confidence.</span>
            </h1>

            <p className="text-sm sm:text-base text-indigo-200 font-normal max-w-2xl mx-auto leading-relaxed">
              Tenant-verified residences listed directly by owners. Transparent lease terms, police-verified backgrounds, and zero brokerage on all rentals.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowPostModal(true)}
                className="px-6 py-3 rounded-xl bg-white text-indigo-950 text-xs font-bold hover:bg-indigo-50 transition-colors shadow-lg cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">add_home</span>
                <span>List Your Property (Zero Brokerage)</span>
              </button>
            </div>

            {/* FLOATING SEARCH BAR */}
            <div className="pt-4 max-w-3xl mx-auto">
              <form
                onSubmit={handleScrollToCatalog}
                className="bg-indigo-900/60 backdrop-blur-2xl border border-indigo-700/50 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                {/* Corridor Selector */}
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-900/90 rounded-xl sm:w-1/3 text-left border border-indigo-700/60">
                  <div className="w-7 h-7 rounded-lg bg-indigo-800 flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined text-[15px]">explore</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[9px] uppercase tracking-wider text-indigo-400 font-bold">Corridor</span>
                    <select
                      value={selectedCorridor}
                      onChange={(e) => setSelectedCorridor(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer border-none p-0 pr-2"
                    >
                      <option value="All Metro Enclaves" className="bg-indigo-950 text-white">All Metro Enclaves</option>
                      <option value="Bengaluru Urban Core" className="bg-indigo-950 text-white">Bengaluru</option>
                      <option value="Gurugram Golf Course Ext." className="bg-indigo-950 text-white">Gurugram</option>
                      <option value="Pune Eastern IT Belt" className="bg-indigo-950 text-white">Pune</option>
                      <option value="New Delhi" className="bg-indigo-950 text-white">New Delhi</option>
                    </select>
                  </div>
                </div>

                {/* Locality Search Input */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-transparent text-left">
                  <span className="material-symbols-outlined text-indigo-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locality, society or BHK type..."
                    className="w-full bg-transparent text-xs text-white placeholder:text-indigo-400 border-none focus:outline-none focus:ring-0 p-0 font-normal"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-indigo-400 hover:text-white text-xs cursor-pointer px-1"
                      title="Clear search query"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white text-indigo-950 hover:bg-indigo-50 rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer"
                >
                  <span>Find Rentals</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </form>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 backdrop-blur-md border border-indigo-700/50 rounded-lg text-[11px] font-semibold tracking-wide text-indigo-200">
                  <span className="material-symbols-outlined text-[14px] text-cyan-400">verified_user</span>
                  Owner Background Verified
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 backdrop-blur-md border border-indigo-700/50 rounded-lg text-[11px] font-semibold tracking-wide text-indigo-200">
                  <span className="material-symbols-outlined text-[14px] text-cyan-400">contract</span>
                  Digital Lease Agreement
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 backdrop-blur-md border border-indigo-700/50 rounded-lg text-[11px] font-semibold tracking-wide text-indigo-200">
                  <span className="material-symbols-outlined text-[14px] text-cyan-400">gpp_good</span>
                  Houserve™ Inspected
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 backdrop-blur-md border border-indigo-700/50 rounded-lg text-[11px] font-semibold tracking-wide text-indigo-200">
                  <span className="material-symbols-outlined text-[14px] text-cyan-400">handshake</span>
                  Zero Brokerage
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* RENTAL CATALOG GALLERY */}
      <section id="rental-catalog-gallery" className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-8">
        {/* Category Filter Header */}
        <div className="border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-display font-bold text-slate-950 tracking-tight">Available Rentals</h2>
            <span className="text-xs font-medium text-slate-400">Verified Direct Listings</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            <button
              onClick={() => setShowManageModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 border border-slate-200 font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Manage My Listings
            </button>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition-colors cursor-pointer"
            >
              + List Rental
            </button>
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading && (
          <div className="py-16 text-center text-slate-500 font-medium text-sm animate-pulse">
            Loading verified rental listings...
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-center text-xs font-semibold">
            {error}
          </div>
        )}

        {!loading && !error && filteredRentals.length === 0 && (
          <div className="py-16 text-center text-slate-500 space-y-4">
            <p className="text-base font-semibold text-slate-900">No rentals match your search or filter criteria.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCorridor("All Metro Enclaves");
                  setSelectedCategory("All Rentals");
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-900 text-xs font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
              <button
                onClick={() => setShowPostModal(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-700 text-white text-xs font-semibold hover:bg-indigo-800 transition-colors cursor-pointer"
              >
                Be the first to list a rental here
              </button>
            </div>
          </div>
        )}

        {/* RENTAL CARDS GRID */}
        {!loading && (
          <div className="space-y-6">
            {filteredRentals.map((item) => {
              const imageSrc =
                item.images && item.images.length > 0
                  ? item.images[0]
                  : "https://lh3.googleusercontent.com/aida/AEtjO1WA_HYwonXRMIcrpXCn_pQttTKI1yex5Tu25f3uLBgVKlkq_1O4DrWVf_QXZhoYK8FSsqOE59fiu1w8yjAj4ha1OWMLWzDqGyFJcpcjj-giAc1HiMGpYLHfRO1XI6iKYXkKjGIv6czNYxLDluEagNDMgLImlvCJW1KwTk3cg8ES8-V6u4doc5sp1ndHB3QCHm_1VpTOzmI5ozXpYTEf3U7z0S3e3joD02Z3d_CBO-iUKiwLQVLRnQYEhnRd";

              const ownerName = item.seller?.name || "Direct Resident Owner";
              const ownerInitials = ownerName
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
                : ["Zero Brokerage", "Houserve Inspected"];

              // Lease expiry countdown
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
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-indigo-200 transition-all duration-300 shadow-[0_1px_3px_0_rgba(15,23,42,0.04),0_10px_24px_-6px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_32px_-8px_rgba(99,102,241,0.1)]"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Image Section */}
                    <div className="lg:col-span-6 relative bg-indigo-50 aspect-[16/10] lg:aspect-auto overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={item.title}
                        className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700 hover:scale-[1.02]"
                      />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {featuresList.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-indigo-950/80 backdrop-blur text-[10px] uppercase font-semibold tracking-wider text-white border border-indigo-800 shadow-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Availability Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur text-white text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        <span>Available · {daysLeft}d</span>
                      </div>

                      <div className="absolute bottom-4 left-4 text-[11px] font-mono tracking-tight text-white/95 bg-indigo-950/85 backdrop-blur px-3 py-1 rounded-md border border-indigo-800">
                        Rental Ref № {item.slug ? item.slug.substring(0, 12).toUpperCase() : "HS-RENT"} · Verified
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-700"></span>
                            {locationText || "Metro Enclave"}
                          </span>
                          <span className="font-display text-xl font-bold text-indigo-700 normal-case tracking-tight">
                            {formatRent(item.price)}
                          </span>
                        </div>
                        <h3
                          onClick={() => setSelectedDossierProperty(item)}
                          className="font-display text-xl sm:text-2xl font-bold text-slate-950 tracking-tight leading-snug hover:text-indigo-700 transition-colors cursor-pointer"
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
                            {item.specs?.areaSqFt ? `${item.specs.areaSqFt} sq.ft` : "1,000 sq.ft"}
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">Area</span>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-slate-900">
                            {item.specs?.bedrooms ? `${item.specs.bedrooms} Bed / ${item.specs.bathrooms || 2} Bath` : "2 Bed / 2 Bath"}
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">Layout</span>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-slate-900 font-capitalize">
                            {item.specs?.furnishedStatus || "Fully Furnished"}
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">Furnishing</span>
                        </div>
                      </div>

                      {/* Footer Row */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-700 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                            {ownerInitials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{ownerName}</div>
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
                                if (window.confirm(`Are you sure you want to remove "${item.title}" from rentals?`)) {
                                  try {
                                    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
                                    const res = await fetch(`${apiUrl}/api/properties/by-id/${item._id}?ownerEmail=${encodeURIComponent(userEmail)}`, {
                                      method: "DELETE",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ ownerEmail: userEmail })
                                    });
                                    if (res.ok) {
                                      handleRentalDeleted(item._id);
                                    } else {
                                      alert("Failed to remove rental listing.");
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
                            title="Remove listing"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            <span>Remove</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedDossierProperty(item)}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-700 text-indigo-700 hover:text-white transition-all text-xs font-semibold inline-flex items-center gap-1 cursor-pointer group"
                          >
                            <span>View Details</span>
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

        {/* Pagination */}
        <div className="pt-6 flex items-center justify-between border-t border-slate-200/80 text-xs text-slate-500 font-medium">
          <span>Showing {filteredRentals.length} of {rentalsList.length} verified rentals</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed" disabled>
              Previous
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-indigo-700 text-white font-bold">1</span>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
              Next
            </button>
          </div>
        </div>
      </section>

      {/* RENTAL TRUST PROTOCOL BLOCK */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-8">
        <div className="bg-indigo-950 text-white rounded-3xl p-8 sm:p-12 border border-indigo-900 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
              The Tenant Protection Protocol
            </span>
            <h2 className="font-display text-2xl sm:text-4xl text-white font-bold leading-tight">
              "Renting should be transparent, safe, and free from exploitation."
            </h2>
            <p className="text-indigo-300 font-normal text-sm sm:text-base leading-relaxed max-w-2xl">
              Houserve verifies each landlord's identity, conducts property condition audits, and provides a legally binding digital lease — protecting tenants from unauthorized rent hikes and surprise deductions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-indigo-900">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div className="font-mono text-xs text-indigo-400 font-semibold">01 / Owner Verification</div>
              <h4 className="font-display font-bold text-sm text-white">KYC & Background Check</h4>
              <p className="text-xs text-indigo-400 leading-relaxed font-normal">
                All landlords are Aadhaar-verified, with police clearance certificates validated before listing.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[18px]">home_repair_service</span>
              </div>
              <div className="font-mono text-xs text-indigo-400 font-semibold">02 / Property Audit</div>
              <h4 className="font-display font-bold text-sm text-white">Condition & Safety Inspection</h4>
              <p className="text-xs text-indigo-400 leading-relaxed font-normal">
                Houserve™ engineers assess structural integrity, plumbing, electrical safety, and habitability standards.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[18px]">contract</span>
              </div>
              <div className="font-mono text-xs text-indigo-400 font-semibold">03 / Digital Lease</div>
              <h4 className="font-display font-bold text-sm text-white">Legally Binding Agreement</h4>
              <p className="text-xs text-indigo-400 leading-relaxed font-normal">
                eStamped lease agreements with clear escalation caps, security deposit rules, and exit clauses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING BANNER */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-4 pb-16">
        <div className="border border-slate-200/80 rounded-3xl p-8 sm:p-12 bg-white flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-[0_1px_3px_0_rgba(15,23,42,0.04),0_10px_24px_-6px_rgba(15,23,42,0.03)]">
          <div className="max-w-xl space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              For Landlords
            </span>
            <h3 className="font-display text-2xl sm:text-3xl text-slate-950 font-bold leading-snug">
              Have a property to rent out?
            </h3>
            <p className="text-slate-500 font-normal text-xs sm:text-sm leading-relaxed">
              List your property for free, reach pre-screened tenants, and manage lease agreements — all without paying a single rupee in brokerage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setShowPostModal(true)}
              type="button"
              className="px-6 py-3 bg-indigo-700 text-white text-xs font-semibold tracking-wide rounded-xl text-center hover:bg-indigo-800 transition-colors shadow-sm cursor-pointer"
            >
              List Your Rental Free
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-slate-100 text-slate-900 text-xs font-semibold tracking-wide rounded-xl text-center hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
            >
              Rent Calculator
            </button>
          </div>
        </div>
      </section>

      {/* POST PROPERTY MODAL */}
      {showPostModal && (
        <PostPropertyModal
          onClose={() => setShowPostModal(false)}
          onSuccess={handleRentalCreated}
        />
      )}

      {/* MANAGE LISTINGS MODAL */}
      {showManageModal && (
        <ManageListingsModal
          onClose={() => setShowManageModal(false)}
          onPropertyDeleted={handleRentalDeleted}
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
