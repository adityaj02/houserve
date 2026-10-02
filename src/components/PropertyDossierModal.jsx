import React, { useState } from "react";
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

export default function PropertyDossierModal({ property, onClose, onOpenLogin }) {
  const auth = useAuth();
  const user = auth?.user;

  if (!property) return null;

  const imageSrc =
    property.images && property.images.length > 0
      ? property.images[0]
      : "https://lh3.googleusercontent.com/aida/AEtjO1WA_HYwonXRMIcrpXCn_pQttTKI1yex5Tu25f3uLBgVKlkq_1O4DrWVf_QXZhoYK8FSsqOE59fiu1w8yjAj4ha1OWMLWzDqGyFJcpcjj-giAc1HiMGpYLHfRO1XI6iKYXkKjGIv6czNYxLDluEagNDMgLImlvCJW1KwTk3cg8ES8-V6u4doc5sp1ndHB3QCHm_1VpTOzmI5ozXpYTEf3U7z0S3e3joD02Z3d_CBO-iUKiwLQVLRnQYEhnRd";

  const locationText = `${property.location?.address || ""}${
    property.location?.city ? ` · ${property.location.city}` : ""
  }`;

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");

  const isFormValid = buyerName.trim() && buyerPhone.trim() && buyerEmail.trim();
  // Build WhatsApp Inquiry Message URL sharing property & user details
  const whatsappMessage = `*ONEHOME PROPERTY DOSSIER & INQUIRY* 🏡

*PROPERTY DETAILS:*
• Title: ${property.title}
• Location: ${locationText || "Metro Enclave"}
• Price: ${formatPrice(property.price)}
• Specs: ${property.specs?.bedrooms || 3} Bed / ${property.specs?.bathrooms || 2} Bath (${property.specs?.areaSqFt || 1200} sq.ft)
• Status: ${property.specs?.furnishedStatus || "Available"}
• Title Audit: № ${property.slug ? property.slug.substring(0, 12).toUpperCase() : "HS-DEED"}

*BUYER DETAILS:*
• Name: ${buyerName}
• Phone: ${buyerPhone}
• Email: ${buyerEmail}

I would like to examine the verified title dossier and schedule an architectural site visit for this residence.`;

  const whatsappUrl = `https://api.whatsapp.com/send/?phone=919811797407&text=${encodeURIComponent(
    whatsappMessage
  )}&type=phone_number&app_absent=0`;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200/80 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 flex items-start justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] uppercase tracking-wider font-semibold mb-2">
              <span>Cadastral Title Dossier</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              {property.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-mono">
              <span>Audit № {property.slug ? property.slug.substring(0, 14).toUpperCase() : "HS-DEED"}</span>
              <span>· Verified Freehold</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Image & Price Header */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-slate-100 border border-slate-200 shadow-xs">
            <img src={imageSrc} alt={property.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur text-white p-4 rounded-xl flex items-center justify-between border border-slate-800">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Listing Price</span>
                <span className="text-2xl font-bold font-display">{formatPrice(property.price)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Location</span>
                <span className="text-xs font-semibold text-white">{locationText || "Metro Hub"}</span>
              </div>
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Built-Up Area</span>
              <span className="block text-sm font-bold text-slate-900 mt-0.5">{property.specs?.areaSqFt || 1200} sq.ft</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Bedrooms</span>
              <span className="block text-sm font-bold text-slate-900 mt-0.5">{property.specs?.bedrooms || 3} Beds</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Bathrooms</span>
              <span className="block text-sm font-bold text-slate-900 mt-0.5">{property.specs?.bathrooms || 2} Baths</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Furnishing</span>
              <span className="block text-sm font-bold text-slate-900 mt-0.5 capitalize">{property.specs?.furnishedStatus || "Semi-Furnished"}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Architectural Description</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Deed Badges & Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feat, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Seller & Buyer Shared Details Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Seller Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <span className="material-symbols-outlined text-[16px] text-slate-950">verified</span>
                <span>Verified Direct Seller</span>
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-950">{property.seller?.name || "Direct Resident Owner"}</div>
                <div className="text-xs text-slate-500">{property.seller?.phone || "+91 98117 97407"}</div>
                <div className="text-xs text-slate-500">{property.seller?.email || "seller@onehome.in"}</div>
              </div>
            </div>

            {/* Buyer Details Form */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">person_pin</span>
                <span>Your Inquirer Details</span>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-200/60 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="tel"
                  placeholder="Your Contact Number"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-200/60 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-200/60 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 font-medium text-center sm:text-left">
            Direct WhatsApp connection sharing property & buyer credentials to +91 98117 97407.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer w-full sm:w-auto"
            >
              Close
            </button>
            <a
              href={isFormValid ? whatsappUrl : "#"}
              target={isFormValid ? "_blank" : undefined}
              rel={isFormValid ? "noopener noreferrer" : undefined}
              onClick={(e) => {
                if (!isFormValid) {
                  e.preventDefault();
                  alert("Please enter your Name, Phone, and Email to inquire.");
                }
              }}
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 ${isFormValid ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer' : 'bg-emerald-400 cursor-not-allowed opacity-80'}`}
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Inquire via WhatsApp →</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
