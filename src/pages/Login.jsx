import { useAuth } from "../context/AuthContext";

export default function Login({ close }) {
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    await signInWithGoogle();
    if (close) close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[20px]">
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[32px] border border-white/20 !bg-slate-950/90 p-6 text-white shadow-2xl shadow-black/80 sm:p-10 md:p-12 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner">
            <span className="material-symbols-outlined text-3xl">roofing</span>
          </div>

          <h2 className="mb-2 text-2xl font-black tracking-tighter sm:text-3xl">Welcome to Houserve</h2>
          <p className="mb-8 text-sm text-white/60">
            Sign in to access your account, bookings, and verified services.
          </p>

          <button
            type="button"
            onClick={handleSignIn}
            className="w-full max-w-[300px] py-3.5 px-4 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            <span>Continue as Aditya</span>
          </button>

          <div className="mt-8">
            <button onClick={close} className="text-xs uppercase tracking-widest text-white/60 transition-colors hover:text-white cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
