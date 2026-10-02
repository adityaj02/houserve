import React, { useState } from "react";

export default function ManageListingsModal({ onClose, onPropertyDeleted }) {
  const [step, setStep] = useState("form"); // "form" | "listings"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [myProperties, setMyProperties] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email.trim() || !phone.trim()) {
      setErrorMsg("Please enter both email and contact number.");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(
        `${apiUrl}/api/properties/my-listings?email=${encodeURIComponent(email.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "No listings found for these credentials.");
      }

      const data = await res.json();
      setMyProperties(data || []);
      setStep("listings");
    } catch (err) {
      setErrorMsg(err.message || "Unable to verify. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propId, propTitle) => {
    if (!window.confirm(`Delete "${propTitle}" permanently?`)) return;

    setDeletingId(propId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/properties/by-id/${propId}?ownerEmail=${encodeURIComponent(email.trim())}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerEmail: email.trim(), ownerPhone: phone.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete listing.");
      }

      setMyProperties((prev) => prev.filter((p) => p._id !== propId));
      setSuccessMsg(`"${propTitle}" deleted successfully.`);
      if (onPropertyDeleted) onPropertyDeleted(propId);
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete listing.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 flex items-start justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] uppercase tracking-wider font-semibold mb-2">
              <span>Owner Dashboard</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Manage &amp; Delete My Listings
            </h2>
            <p className="text-xs text-slate-400 mt-1">Verify with your registered email &amp; phone number</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {step === "form" ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Enter the <strong>email ID</strong> and <strong>contact number</strong> you used when posting your property to view and manage your listings.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">manage_search</span>
                    <span>View My Listings</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-0.5">
                    Listings for {email}
                  </h3>
                  {myProperties.length > 0 && (
                    <p className="text-[11px] text-slate-500">{myProperties.length} active listing{myProperties.length !== 1 ? "s" : ""} found</p>
                  )}
                </div>
                <button
                  onClick={() => { setStep("form"); setMyProperties([]); setSuccessMsg(""); setErrorMsg(""); }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline cursor-pointer"
                >
                  ← Change Details
                </button>
              </div>

              {myProperties.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
                  <span className="material-symbols-outlined text-slate-400 text-[32px]">home_work</span>
                  <p className="text-xs font-semibold text-slate-900">No active listings found for these credentials.</p>
                  <p className="text-[11px] text-slate-500">Make sure the email and phone match exactly what you entered when posting.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myProperties.map((item) => {
                    const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
                    const expireDate = item.expiresAt
                      ? new Date(item.expiresAt)
                      : new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                    const daysLeft = Math.max(
                      0,
                      Math.ceil((expireDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    );

                    return (
                      <div
                        key={item._id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-950">{item.title}</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">timer</span>
                              <span>Auto-Deletes in {daysLeft} days</span>
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {item.location?.address || item.location?.city} · {item.price ? `₹${item.price.toLocaleString("en-IN")}` : ""}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Expires on {expireDate.toLocaleDateString("en-IN")}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(item._id, item.title)}
                          disabled={deletingId === item._id}
                          className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span>{deletingId === item._id ? "Deleting..." : "Delete Listing"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
