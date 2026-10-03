import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import VideoBackground from "../components/background/VideoBackground";
import ThreeScene from "../components/background/ThreeScene";

export default function Profile({ onComplete }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.location) setLocation(user.location);
    }
    setInitialLoading(false);
  }, [user]);

  const trimmedName = useMemo(() => name.trim(), [name]);
  const normalizedPhone = useMemo(() => phone.replace(/\D/g, "").slice(0, 15), [phone]);
  const trimmedLocation = useMemo(() => location.trim(), [location]);

  const saveProfile = async () => {
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!/^\d{10,15}$/.test(normalizedPhone)) {
      setErrorMessage("Please enter a valid contact number.");
      return;
    }

    if (!trimmedLocation) {
      setErrorMessage("Please enter your location.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      if (updateProfile) {
        await updateProfile({
          name: trimmedName,
          phone: normalizedPhone,
          location: trimmedLocation,
        });
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message || "Unable to save profile right now. Please try again.");
      return;
    }

    setLoading(false);
    onComplete?.();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 50, padding: "16px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <VideoBackground theme="dark" blur={20} brightness={0.65} />
      <ThreeScene theme="dark" />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: -10,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "40px 24px",
          borderRadius: "28px",
          background: "rgba(10,10,10,0.64)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Complete Profile</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
            {initialLoading ? "Fetching your details..." : "Almost there! Tell us who you are."}
          </p>
        </div>

        {initialLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
             <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                background: "rgba(0,0,0,0.38)",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />

            <input
              placeholder="Contact Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                background: "rgba(0,0,0,0.38)",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />

            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                background: "rgba(0,0,0,0.38)",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />

            {errorMessage && (
              <p style={{ color: "#fca5a5", fontSize: "13px", margin: 0 }} role="alert">
                {errorMessage}
              </p>
            )}

            <button
              onClick={saveProfile}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "14px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.65 : 1,
              }}
            >
              {loading ? "Saving Profile..." : "Continue to Dashboard →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
