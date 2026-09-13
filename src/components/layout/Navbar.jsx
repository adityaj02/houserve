import { DASHBOARD_FILTERS, getThemeTokens } from "../../styles/theme";

export default function Navbar({ location, toggleTheme, theme, setCurrentView, userInitials = "B", activeFilter, setActiveFilter, onLogout, onViewProfile, onBackToHouserve }) {
    const colors = getThemeTokens(theme);

    return (
        <nav className={`w-full px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-3 lg:gap-6 z-[120] shrink-0 sticky top-0 backdrop-blur-xl border-b min-h-[56px] lg:min-h-16 transition-all duration-300 ${colors.isDark ? 'bg-warm-950/85 border-white/10' : 'bg-white/85 border-stone-200/80'} shadow-[0_4px_20px_rgba(180,160,140,0.08)]`}>
            {/* Brand */}
            <div 
              className="flex items-center gap-3 text-left min-w-0 cursor-pointer group"
              onClick={() => {
                if (onBackToHouserve) onBackToHouserve();
                else setCurrentView('home');
              }}
            >
                <div className="relative w-10 h-10 rounded-full bg-transparent shadow-sm shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                    <img src="/Assets/LOGO.png" alt="VideoScrub Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col min-w-0">
                    <h2 className={`text-base font-bold tracking-tight ${colors.text}`}>VideoScrub</h2>
                    <div className="hidden lg:flex items-center gap-2 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${location === 'Detecting...' ? 'bg-slate-400' : 'bg-emerald-500'} animate-pulse`}></div>
                        <span className={`text-[9px] uppercase tracking-[0.15em] font-mono font-medium truncate ${colors.subtext}`}>{location}</span>
                    </div>
                </div>
            </div>

            {/* Center: Filter Chips */}
            <div className="hidden xl:flex justify-center">
                <div className={`flex items-center gap-1.5 p-1 rounded-full border backdrop-blur-xl ${colors.isDark ? 'border-white/10' : 'border-[#e2e8f0]'}`}>
                    {DASHBOARD_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter && setActiveFilter(filter.value)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition-all ${activeFilter === filter.value ? colors.activeChip : colors.inactiveChip}`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-2 lg:gap-3 relative text-right">
                {onBackToHouserve && (
                    <button
                        onClick={onBackToHouserve}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-950 text-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[15px]">roofing</span>
                        <span className="hidden sm:inline">Houserve</span>
                    </button>
                )}
                <a className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-mono ${colors.subtext} hover:text-slate-900 transition-colors`} href="tel:+919811797407">
                    <span className="material-symbols-outlined text-[15px] text-slate-700">call</span>
                    <span>+91 9811797407</span>
                </a>
                <button
                    onClick={() => setCurrentView('services')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 group active:scale-95 transition-all ${colors.primaryButton}`}
                >
                    <span>Book Pro</span>
                    <span className="text-white transition-transform group-hover:translate-x-0.5">→</span>
                </button>
                <div className="relative group">
                    <div onClick={onViewProfile} className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center cursor-pointer transition-all border ${colors.isDark ? 'bg-white/10 border-white/10' : 'bg-stone-100 border-stone-200/80'}`} aria-label="User initials">
                        <span className={`text-[11px] lg:text-[12px] font-bold ${colors.text}`}>{userInitials}</span>
                        <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 shadow-sm lg:hidden ${colors.isDark ? "border-warm-950" : "border-white"}`}></div>
                    </div>
                    <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible duration-200 z-[100] hidden lg:block backdrop-blur-xl ${colors.isDark ? 'bg-warm-950 border-white/10' : 'bg-white border-stone-200/80'}`}>
                        <button onClick={onViewProfile} className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${colors.text} ${colors.hoverSurface}`}>Account Profile</button>
                        <button onClick={() => setCurrentView('bookings')} className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${colors.text} ${colors.hoverSurface}`}>My Bookings</button>
                        <hr className={`my-1 border-t ${colors.border}`} />
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onLogout?.();
                            }} 
                            className="w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
