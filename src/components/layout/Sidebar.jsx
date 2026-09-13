import { getThemeTokens } from "../../styles/theme";

export default function Sidebar({ currentView, setCurrentView, theme, onLogout, bookingsCount, onBackToHouseServe }) {
    const colors = getThemeTokens(theme);

    const items = [
        { icon: "roofing", label: "HouseServe", view: "HouseServe", isHouseServe: true },
        { icon: "home", label: "Home", view: "home" },
        { icon: "grid_view", label: "Services", view: "services" },
        { icon: "receipt_long", label: "My Bookings", view: "bookings", badge: bookingsCount },
        { icon: "article", label: "Blog", view: "blog" },
        { icon: "info", label: "About", view: "about" },
        { icon: "alternate_email", label: "Contact", view: "contact" },
    ];

    return (
        <aside className={`hidden md:flex w-20 lg:w-64 h-screen border-r z-[100] flex-col justify-between py-8 px-4 shrink-0 fixed left-0 top-0 backdrop-blur-xl shadow-sm transition-all duration-300 ${
            theme === 'dark' 
                ? 'bg-[#1c1917]/90 border-[#292524]' 
                : 'bg-[#f7f9fb]/90 border-[#e2e8f0]'
        }`}>
            <div className="flex flex-col gap-8">
                {/* Logo Branding */}
                <div 
                    className="flex items-center gap-3 px-2 lg:px-4 cursor-pointer group" 
                    onClick={() => {
                        if (onBackToHouseServe) onBackToHouseServe();
                        else setCurrentView("home");
                    }}
                >
                    <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                        <img src="/Assets/LOGO.png" alt="VideoScrub Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="hidden lg:flex flex-col">
                        <span className="font-display font-bold text-xl leading-tight text-[#0f172a]">
                            VideoScrub<span className="text-[#0f172a] font-sans not-italic font-bold">.</span>
                        </span>
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-[#45464d]">
                            Delhi NCR
                        </span>
                    </div>
                </div>

                {/* Nav Items */}
                <div className="flex flex-col gap-1.5">
                    {items.map((item, i) => {
                        const isActive = currentView === item.view;

                        return (
                            <button
                                key={i}
                                onClick={() => {
                                    if (item.isHouseServe && onBackToHouseServe) {
                                        onBackToHouseServe();
                                    } else {
                                        setCurrentView(item.view);
                                    }
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group text-left ${
                                    isActive
                                        ? 'bg-[#0f172a] text-white font-medium shadow-sm'
                                        : theme === 'dark'
                                            ? 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
                                            : 'text-slate-600 hover:bg-[#f2f4f6] hover:text-slate-950'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-xl transition-transform group-hover:scale-110 ${
                                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#0f172a]'
                                }`}>
                                    {item.icon}
                                </span>
                                <span className="hidden lg:block text-xs font-semibold tracking-wide flex-grow">
                                    {item.label}
                                </span>
                                {item.badge > 0 && (
                                    <span className={`hidden lg:flex px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                        isActive ? 'bg-white text-[#0f172a]' : 'bg-[#0f172a] text-white'
                                    }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* User / Logout Section */}
            <div className="flex flex-col w-full pt-4 border-t border-stone-200 dark:border-stone-800">
                <button 
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onLogout?.();
                    }} 
                    className="flex items-center gap-3.5 px-3 py-3 rounded-2xl text-stone-600 dark:text-stone-300 hover:bg-rose-500/10 hover:text-rose-600 transition-colors text-left group cursor-pointer"
                >
                    <span className="material-symbols-outlined text-xl text-stone-600 dark:text-stone-300 group-hover:text-rose-600 transition-colors">
                        logout
                    </span>
                    <span className="hidden lg:block text-xs font-semibold tracking-wide">
                        Log Out
                    </span>
                </button>
            </div>
        </aside>
    );
}
