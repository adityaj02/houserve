import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function LoginFlow({ onClose }) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage("");
    try {
      await signInWithGoogle(credentialResponse.credential);
      onClose?.();
    } catch (err) {
      setMessage(err.message || "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setMessage("Google sign-in was cancelled or failed. Please try again.");
  };

  return (
    <div className="glass login-card" style={{ textAlign: "center" }}>
      {/* Logo / Brand mark */}
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: "#292524",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
      }}>
        <span style={{ color: "white", fontSize: 26, fontWeight: 900, fontFamily: "serif" }}>H</span>
      </div>

      <h2 className="login-title" style={{ textAlign: "center" }}>Welcome Back</h2>

      <p className="company-brief" style={{ textAlign: "center" }}>
        Sign in with your Google account to continue to Houserve.
      </p>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 8 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(120,113,108,0.7)", fontSize: 14 }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: "2px solid rgba(217,119,6,0.3)",
              borderTopColor: "#d97706",
              animation: "spin 0.8s linear infinite"
            }} />
            Signing you in…
          </div>
        ) : (
          <>
            {/* Google Sign-In button — works for ALL users */}
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              size="large"
              text="signin_with"
              width="320"
            />

            <p style={{ fontSize: 11, color: "rgba(120,113,108,0.5)", marginTop: 4 }}>
              Sign in with any Google account
            </p>
          </>
        )}
      </div>

      {message && (
        <p style={{ marginTop: 14, color: "#dc2626", fontSize: 13, textAlign: "center" }}>
          {message}
        </p>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
