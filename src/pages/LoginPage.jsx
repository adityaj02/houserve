import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import VideoBackground from "../components/background/VideoBackground";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { signInWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setErrorMessage("");
    try {
      await signInWithGoogle(credentialResponse.credential);
      window.location.href = "/";
    } catch (err) {
      setErrorMessage(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage("Google sign-in was cancelled or failed. Please try again.");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
      <VideoBackground theme="dark" blur={0} brightness={0.85} opacity={1} />
      
      {/* Subtle background overlay */}
      <div className="absolute inset-0 bg-black/35 pointer-events-none z-[1]" />

      <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[32px] border border-white/20 !bg-slate-950/85 p-8 text-white shadow-2xl backdrop-blur-2xl sm:p-10 md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 flex justify-center">
            <img 
              src="/Assets/LOGO.png" 
              alt="Houserve Logo" 
              className="w-20 h-20 object-contain drop-shadow-2xl" 
            />
          </div>

          <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-white">Welcome Back</h2>
          <p className="mb-8 text-sm font-medium text-slate-300">
            Sign in with your Google account to continue to Houserve.
          </p>

          {errorMessage && (
            <p className="mb-4 text-xs font-semibold text-red-300" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col items-center gap-3 w-full">
            {loading ? (
              <div className="flex items-center gap-3 py-3 text-xs font-bold uppercase tracking-widest text-slate-300">
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderTopColor: "white",
                  animation: "spin 0.8s linear infinite"
                }} />
                Signing you in…
              </div>
            ) : (
              <>
                {/* Google Sign-In — works for all Google accounts */}
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="signin_with"
                  width="300"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Sign in with any Google account
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
