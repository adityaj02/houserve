import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import VideoBackground from "../components/background/VideoBackground";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleEnter = async () => {
    setLoading(true);
    await signInWithGoogle();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
      <VideoBackground theme="dark" blur={0} brightness={0.85} opacity={1} />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none z-[1]" />

      <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[32px] border border-white/20 bg-slate-950/80 p-8 text-white shadow-2xl backdrop-blur-2xl sm:p-10 md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img
              src="/Assets/LOGO.png"
              alt="Houserve Logo"
              className="w-20 h-20 object-contain drop-shadow-2xl"
            />
          </div>

          <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-white">
            Welcome to Houserve
          </h2>
          <p className="mb-10 text-sm font-medium text-slate-400">
            Premium home services — trusted, fast, and verified.
          </p>

          {/* Enter Button */}
          {loading ? (
            <div className="flex items-center gap-3 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderTopColor: "white",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Entering…
            </div>
          ) : (
            <button
              onClick={handleEnter}
              className="group relative w-full max-w-[280px] py-4 px-6 rounded-full bg-white text-slate-900 text-sm font-black uppercase tracking-widest shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-white/20 hover:shadow-2xl active:scale-95 cursor-pointer overflow-hidden"
            >
              {/* shimmer */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base leading-none">
                  arrow_forward
                </span>
                Enter
              </span>
            </button>
          )}
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
