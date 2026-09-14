import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const PRESET_IMAGES = [
  {
    name: "Architectural Penthouse",
    url: "https://lh3.googleusercontent.com/aida/AEtjO1WA_HYwonXRMIcrpXCn_pQttTKI1yex5Tu25f3uLBgVKlkq_1O4DrWVf_QXZhoYK8FSsqOE59fiu1w8yjAj4ha1OWMLWzDqGyFJcpcjj-giAc1HiMGpYLHfRO1XI6iKYXkKjGIv6czNYxLDluEagNDMgLImlvCJW1KwTk3cg8ES8-V6u4doc5sp1ndHB3QCHm_1VpTOzmI5ozXpYTEf3U7z0S3e3joD02Z3d_CBO-iUKiwLQVLRnQYEhnRd"
  },
  {
    name: "Skyline High-Rise Deck",
    url: "https://lh3.googleusercontent.com/aida/AEtjO1WzVbeCP9HXE5JkMrKioiIv1jyqSey-IvYn3dXOGtSZAdoiH0Rk1BYBOBfVcATf9f8giSDai4Q884U8RUqRiREvBrVkUKG2QrClQlGv89nkTybuh9OskCZqZCzEmoOPjZt7lY2_c4tbkv6ZBKSU2UYBHPJy83vr8iADdQUA5gZV-WXri63BJ977EGy3bHOq2b91es25pAn2xePgShrYHgMy9zN9lpxz7_xhiMucun-mNvzDzo4_HqNYqbmG"
  },
  {
    name: "Indigenous Courtyard Villa",
    url: "https://lh3.googleusercontent.com/aida/AEtjO1XNkK32Cy8n4jA6pdvJrq01rDvO56ujzZ6f1i6uBAoHuklOOw-NM6gA6-3MIIq7eiP1O8iBQcEtYUPBbEfuG1bvdAJyrTMZzqfKXDmKQFRbn79JLWM4xxvzZAC7r1e2k8Cdlh8fb1c90HDMr1abPkedrPw7A4-rPupG6_sEm7N3x8X1XJLuz_hbBPfV4pDlS-KgFBd88_OOi3YakPnW-CYeYQyfkzqu6QVk5uZU9ExZg94SRg9n0774eNv0"
  },
  {
    name: "Modern Urban Living",
    url: "https://lh3.googleusercontent.com/aida/AEtjO1UNHhGAq8LtpkTfD4HyFXATW_D3k627sg-OQ8rC1WEsEVfq8wOdt1tu1oLpuzCg3Z4DbJD_oTK2J2fGYK9jhNZeaTHpCjUpnI-WsPqQdK_epAFn969dSOJa0Ek_4dpTfmyrhGY6hLz8uDCbUTNGJh0ugQVu6gKxhH40yDQwP2yvU2um83AYGEO_YcEeGaZNDQUzetdeA73YOq4fK9mbzXXxFEMWCKUiHKMptRTAZmr5kszl5QPO9OIJl5Xq"
  }
];

const AMENITIES_OPTIONS = [
  "Direct Seller Deed",
  "A-Khata",
  "Zero Brokerage",
  "100% Freehold",
  "Private Plunge Pool",
  "Rooftop Solar",
  "Italian Marble",
  "Power Backup",
  "24/7 Security",
  "Gym & Clubhouse"
];

export default function PostPropertyModal({ onClose, onSuccess }) {
  const auth = useAuth();
  const user = auth?.user;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    type: "apartment",
    status: "available",
    city: "Bengaluru",
    address: "",
    state: "Karnataka",
    pincode: "",
    price: "",
    areaSqFt: "",
    bedrooms: 3,
    bathrooms: 2,
    furnishedStatus: "semi-furnished",
    description: "",
    selectedFeatures: ["Direct Seller Deed", "100% Freehold"],
    imageUrl: PRESET_IMAGES[0].url,
    customImageUrl: "",
    sellerName: user?.name || "",
    sellerPhone: user?.phone || "",
    sellerEmail: user?.email || "",
    sellerLineage: "Direct Resident Owner"
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        sellerName: prev.sellerName || user.name || "",
        sellerEmail: prev.sellerEmail || user.email || "",
        sellerPhone: prev.sellerPhone || user.phone || ""
      }));
    }
  }, [user]);

  // Compress an image File to a base64 JPEG string (max 1200px, 70% quality)
  const compressImage = (file) =>
    new Promise((resolve, reject) => {
      const MAX_PX = 1200;
      const QUALITY = 0.72;
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (evt) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let { width, height } = img;
          if (width > MAX_PX || height > MAX_PX) {
            if (width > height) {
              height = Math.round((height * MAX_PX) / width);
              width = MAX_PX;
            } else {
              width = Math.round((width * MAX_PX) / height);
              height = MAX_PX;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", QUALITY));
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFeature = (feature) => {
    setFormData((prev) => {
      const exists = prev.selectedFeatures.includes(feature);
      const updated = exists
        ? prev.selectedFeatures.filter((f) => f !== feature)
        : [...prev.selectedFeatures, feature];
      return { ...prev, selectedFeatures: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.title || !formData.price || !formData.address) {
      setErrorMsg("Please fill in property title, expected price, and address.");
      return;
    }

    setLoading(true);

    const finalImageUrl = formData.uploadedFileUrl || formData.customImageUrl.trim() || formData.imageUrl;

    const payload = {
      title: formData.title,
      description: formData.description || "Architectural freehold residence verified with direct seller deed.",
      price: Number(formData.price),
      type: formData.type,
      status: formData.status,
      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      },
      specs: {
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        areaSqFt: Number(formData.areaSqFt) || 1200,
        furnishedStatus: formData.furnishedStatus
      },
      features: formData.selectedFeatures,
      images: [finalImageUrl],
      seller: {
        name: formData.sellerName || "Resident Owner",
        phone: formData.sellerPhone || "+91 98000 00000",
        email: formData.sellerEmail || "owner@onehome.in"
      }
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      const res = await fetch(`${apiUrl}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to post property.");
      }

      const createdProperty = await res.json();
      setLoading(false);
      if (onSuccess) onSuccess(createdProperty);
      if (onClose) onClose();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || "Something went wrong while posting property.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200/80 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 flex items-start justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] uppercase tracking-wider font-semibold mb-2">
              <span>No-Broker Direct Listing</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Post Freehold Residence
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              List directly with zero brokerage fee. Verified cadastral title & structural inspection.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* SECTION 1: PROPERTY IDENTITY */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              1. Property Identity & Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Duplex Penthouse with Private Plunge Pool"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Property Category
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950 bg-white"
                >
                  <option value="apartment">Apartment / Flat</option>
                  <option value="villa">Independent Villa</option>
                  <option value="independent-house">Independent House</option>
                  <option value="commercial">Commercial Space</option>
                  <option value="plot">Freehold Land / Plot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Listing Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950 bg-white"
                >
                  <option value="available">Available (For Direct Deed)</option>
                  <option value="pending">Pending Audit</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: LOCATION & ADDRESS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              2. Location & Enclave
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  City / Metro Hub *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950 bg-white"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Gurugram">Gurugram / NCR</option>
                  <option value="New Delhi">New Delhi</option>
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Locality / Society / Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Defence Colony, Indiranagar"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PRICING & SPECS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              3. Pricing & Layout Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Expected Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 42000000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Built-up Area (sq.ft)
                </label>
                <input
                  type="number"
                  name="areaSqFt"
                  value={formData.areaSqFt}
                  onChange={handleChange}
                  placeholder="e.g. 3850"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Furnishing Status
                </label>
                <select
                  name="furnishedStatus"
                  value={formData.furnishedStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950 bg-white"
                >
                  <option value="fully-furnished">Fully Furnished</option>
                  <option value="semi-furnished">Semi Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Bedrooms
                </label>
                <select
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>{num} Bedrooms</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Bathrooms
                </label>
                <select
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>{num} Bathrooms</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: FEATURES & BADGES */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              4. Architectural Features & Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_OPTIONS.map((feat) => {
                const isSelected = formData.selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-950 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {feat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: PROPERTY IMAGES & FILE UPLOAD */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              5. Architectural Photography & Image Upload
            </h3>

            {/* Direct Device File Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-2">
                Upload Property Photo from Device:
              </label>

              {formData.uploadedFileUrl ? (
                /* Uploaded Image Live Preview Card */
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 p-2 text-white shadow-sm flex items-center gap-4">
                  <img
                    src={formData.uploadedFileUrl}
                    alt="Uploaded property preview"
                    className="w-24 h-24 rounded-xl object-cover border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Photo Ready for Deed</span>
                    </div>
                    <p className="text-xs font-semibold truncate text-white">
                      {formData.uploadedFileName || "Uploaded Property Image"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Successfully attached to property dossier.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, uploadedFileUrl: "", uploadedFileName: "" }))}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white text-xs font-semibold transition-colors cursor-pointer mr-2 shrink-0 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                /* Drag & Drop File Zone */
                <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-950 rounded-2xl p-6 text-center transition-all bg-slate-50/50 hover:bg-slate-50 cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        // Guard: reject files over 15 MB before even compressing
                        if (file.size > 15 * 1024 * 1024) {
                          setErrorMsg("Image too large. Please choose a file under 15 MB.");
                          return;
                        }
                        setErrorMsg("");
                        try {
                          const compressed = await compressImage(file);
                          setFormData((prev) => ({
                            ...prev,
                            uploadedFileUrl: compressed,
                            uploadedFileName: file.name,
                            customImageUrl: ""
                          }));
                        } catch {
                          setErrorMsg("Failed to process image. Please try a different file.");
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 tracking-tight">
                    Click to browse or drop property image here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    Supports PNG, JPG, WEBP · Auto-compressed before upload
                  </p>
                </div>
              )}
            </div>

            {/* Presets Gallery */}
            <div>
              <span className="block text-xs font-semibold text-slate-900 mb-2">
                Or Select from Architectural Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_IMAGES.map((img, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        imageUrl: img.url,
                        customImageUrl: "",
                        uploadedFileUrl: "",
                        uploadedFileName: ""
                      }))
                    }
                    className={`relative rounded-xl overflow-hidden aspect-[4/3] cursor-pointer border-2 transition-all ${
                      formData.imageUrl === img.url && !formData.customImageUrl && !formData.uploadedFileUrl
                        ? "border-slate-950 ring-2 ring-slate-950/20 opacity-100"
                        : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 text-white text-[9px] font-semibold px-2 py-1 truncate">
                      {img.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                Custom Image URL (Optional)
              </label>
              <input
                type="url"
                name="customImageUrl"
                value={formData.customImageUrl}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value) {
                    setFormData((prev) => ({ ...prev, uploadedFileUrl: "", uploadedFileName: "" }));
                  }
                }}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
              />
            </div>
          </div>

          {/* SECTION 6: OWNER CONTACT DETAILS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              6. Owner Contact & Deed Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  name="sellerName"
                  value={formData.sellerName}
                  onChange={handleChange}
                  placeholder="e.g. Sunita Rao"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="sellerPhone"
                  value={formData.sellerPhone}
                  onChange={handleChange}
                  placeholder="+91 98450 00000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="sellerEmail"
                  value={formData.sellerEmail}
                  onChange={handleChange}
                  placeholder="owner@onehome.in"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <span>Posting Property...</span>
              ) : (
                <>
                  <span>Submit & Verify Deed</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
