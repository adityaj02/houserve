import React from "react";
import { getThemeTokens } from "../../styles/theme";

export default function MobileBottomNav({ currentView, setCurrentView, theme, bookingsCount }) {
    const items = [
        { id: "home", label: "Home", icon: "home" },
        { id: "services", label: "Services", icon: "grid_view" },
        { id: "bookings", label: "Bookings", icon: "receipt_long", badge: bookingsCount },
        { id: "blog", label: "Blog", icon: "article" },
        { id: "contact", label: "Contact", icon: "alternate_email" },
    ];
    const colors = getThemeTokens(theme);

    return (
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-[110] backdrop-blur-xl border-t px-4 pb-4 pt-2.5 flex justify-between items-center shadow-sm ${
            theme === 'dark' 
                ? 'bg-[#1c1917]/95 border-[#292524]' 
                : 'bg-[#f7f9fb]/95 border-[#e2e8f0]'
        }`}>
            {items.map((item) => {
                const isActive = currentView === item.id || (item.id === "profile" && currentView === "account");
                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            setCurrentView(item.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex flex-col items-center gap-1 relative flex-1 py-1 transition-transform active:scale-95"
                    >
                        <span className={`material-symbols-outlined text-2xl transition-all duration-200 ${
                            isActive ? "text-[#0f172a] font-semibold scale-110" : "text-slate-500 opacity-80"
                        }`}>
                            {item.icon}
                        </span>
                        <span className={`text-[10px] font-semibold tracking-tight ${
                            isActive ? "text-[#0f172a] font-bold" : "text-slate-500"
                        }`}>
                            {item.label}
                        </span>
                        {isActive && (
                            <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#0f172a] rounded-full shadow-sm" />
                        )}
                        {item.badge > 0 && (
                            <div className="absolute -top-0.5 right-[18%] bg-[#0f172a] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow">
                                {item.badge}
                            </div>
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
