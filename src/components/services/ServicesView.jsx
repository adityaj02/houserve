import { useEffect, useMemo, useState } from "react";
import { fetchServices as apiFetchServices } from "../../lib/api";
import { SERVICES as SERVICES_DATA } from "../../data/services";
import { getThemeTokens } from "../../styles/theme";

const FALLBACK_IMAGES = {
  plumbing: "/Assets/plumbing.png",
  electrical: "/Assets/electrical.png",
  carpentry: "/Assets/carpentry.png",
  painting: "/Assets/painting.png",
  "ac service": "/Assets/ac-service.png",
  building: "/Assets/building.png",
  property: "/Assets/property.png",
  facility: "/Assets/facility.png",
  cleaning: "/Assets/facility.png",
};

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}



export default function ServicesView({ addToCart, isInCart, setCurrentView, theme, initialSearch = "" }) {
  const colors = getThemeTokens(theme);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch.trim().toLowerCase());
  const [activeCategory, setActiveCategory] = useState("All");
  const [heroIndex, setHeroIndex] = useState(0);

  const handleBookNow = (service) => {
    addToCart?.(service);
    setCurrentView?.("cart");
  };

  async function fetchServices() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetchServices();
      if (data?.length) {
        setServices(data.map((row, index) => ({
          service_id: row.serviceId || row._id,
          name: row.name,
          description: row.description || "Verified, background-checked local professionals delivered on demand.",
          price: Number(row.price || 0),
          img: FALLBACK_IMAGES[String(row.name || "").toLowerCase()] || row.imageUrl || `/Assets/${String(row.name || "").toLowerCase().replace(/\s+/g, '-')}.png`,
          rating: row.rating || (4.7 + ((index % 4) * 0.1)).toFixed(1),
          prosCount: 18 + index * 3,
          availableToday: index % 5 !== 4,
          badge: index % 3 === 0 ? "Popular" : index % 3 === 1 ? "Fast Response" : "Top Rated",
          themeColor: row.themeColor || '#d97706',
          lightColor: row.lightColor || '#fef3c7',
        })));
      } else {
        // Fallback to local data if API returns empty
        setServices(SERVICES_DATA.map((row, index) => ({
          service_id: row.id,
          name: row.title,
          description: row.desc,
          price: Number(row.price || 0),
          img: row.img || FALLBACK_IMAGES[row.title.toLowerCase()] || "/Assets/facility.png",
          rating: row.rating || (4.7 + ((index % 4) * 0.1)).toFixed(1),
          prosCount: 18 + index * 3,
          availableToday: index % 5 !== 4,
          badge: index % 3 === 0 ? "Popular" : index % 3 === 1 ? "Fast Response" : "Top Rated",
          themeColor: row.themeColor || '#d97706',
          lightColor: row.lightColor || '#fef3c7',
        })));
      }
    } catch {
      // Backend offline — silently use local fallback data
      setServices(SERVICES_DATA.map((row, index) => ({
        service_id: row.id,
        name: row.title,
        description: row.desc,
        price: Number(row.price || 0),
        img: row.img || FALLBACK_IMAGES[row.title.toLowerCase()] || "/Assets/facility.png",
        rating: row.rating || (4.7 + ((index % 4) * 0.1)).toFixed(1),
        prosCount: 18 + index * 3,
        availableToday: index % 5 !== 4,
        badge: index % 3 === 0 ? "Popular" : index % 3 === 1 ? "Fast Response" : "Top Rated",
        themeColor: row.themeColor || '#d97706',
        lightColor: row.lightColor || '#fef3c7',
      })));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchQuery(searchText.trim().toLowerCase());
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [searchText]);

  useEffect(() => {
    if (services.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % services.slice(0, 3).length);
    }, 5000);

    return () => window.clearTimeout(interval);
  }, [services]);

  const categories = useMemo(() => {
    const uniqueNames = [...new Set(services.map((service) => service.name).filter(Boolean))];
    return ["All", ...uniqueNames];
  }, [services]);

  const featuredServices = useMemo(() => services.slice(0, 3), [services]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        !searchQuery ||
        service.name.toLowerCase().includes(searchQuery) ||
        service.description.toLowerCase().includes(searchQuery);
      const matchesCategory = activeCategory === "All" || service.name === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, searchQuery, services]);

  useEffect(() => {
    if (!featuredServices.length) {
      setHeroIndex(0);
      return;
    }

    if (heroIndex >= featuredServices.length) {
      setHeroIndex(0);
    }
  }, [featuredServices, heroIndex]);

  function clearFilters() {
    setSearchText("");
    setSearchQuery("");
    setActiveCategory("All");
  }

  return (
    <div className="relative min-h-screen px-4 lg:px-20 py-10 transition-colors duration-500 bg-[#f7f9fb] text-slate-900">
      <div className="relative mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between text-left">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#0f172a] block mb-1">
                Houserve Directory
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-slate-950">
                Home Services
              </h1>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                  activeCategory === category 
                    ? 'bg-[#0f172a] text-white shadow-sm' 
                    : 'bg-[#f3f4f6] text-slate-700 hover:bg-white border border-[#e5e7eb]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        {loading ? <LoadingState theme={theme} /> : null}
        {!loading && error ? <ErrorState onRetry={fetchServices} theme={theme} /> : null}

        {!loading && !error ? (
          <>
            {!!featuredServices.length && activeCategory === "All" && !searchQuery ? (
              <FeaturedHero
                featuredServices={featuredServices}
                heroIndex={heroIndex}
                setHeroIndex={setHeroIndex}
                onBook={handleBookNow}
                theme={theme}
              />
            ) : null}

            {filteredServices.length === 0 ? (
              <EmptyState onClear={clearFilters} theme={theme} />
            ) : (
              <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.service_id}
                    service={service}
                    addToCart={addToCart}
                    isInCart={Boolean(isInCart?.(service.service_id))}
                    onBook={() => handleBookNow(service)}
                    theme={theme}
                  />
                ))}
              </section>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function LoadingState({ theme }) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className={`relative h-[400px] overflow-hidden rounded-3xl border animate-pulse ${
            theme === 'dark' ? 'border-[#292524] bg-[#1c1917]' : 'border-[#e7e5e4] bg-white'
          }`}
        />
      ))}
    </section>
  );
}

function ErrorState({ onRetry, theme }) {
  return (
    <section className={`flex min-h-[300px] flex-col items-center justify-center rounded-3xl border text-center p-8 ${
        theme === 'dark' ? 'bg-[#1c1917] border-[#292524]' : 'bg-white border-[#e7e5e4]'
    }`}>
      <span className="material-symbols-outlined text-4xl text-rose-500 mb-3">error</span>
      <h2 className="text-xl font-serif italic text-stone-900 dark:text-stone-100">Could not load services</h2>
      <p className="mt-1 text-xs text-stone-500 mb-6">Please check your network connection and try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-white shadow-md"
      >
        Try again
      </button>
    </section>
  );
}

function EmptyState({ onClear, theme }) {
  return (
    <section className={`flex min-h-[280px] flex-col items-center justify-center rounded-3xl border text-center p-8 ${
        theme === 'dark' ? 'bg-[#1c1917] border-[#292524]' : 'bg-white border-[#e7e5e4]'
    }`}>
      <span className="material-symbols-outlined text-4xl text-stone-400 mb-3">search_off</span>
      <p className="text-lg font-serif italic text-stone-900 dark:text-stone-100">No matching services found</p>
      <p className="mt-1 text-xs text-stone-500 mb-6">Try searching for a different keyword or category.</p>
      <button
        type="button"
        onClick={onClear}
        className="px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        Clear filters
      </button>
    </section>
  );
}

function FeaturedHero({ featuredServices, heroIndex, setHeroIndex, onBook, theme }) {
  const service = featuredServices[heroIndex] || featuredServices[0];
  if (!service) return null;

  return (
    <section className={`relative mb-12 overflow-hidden rounded-3xl lg:rounded-[36px] border shadow-xl transition-all duration-500 ${
        theme === 'dark' ? 'bg-[#1c1917] border-[#292524]' : 'bg-stone-900 border-stone-800 text-white'
    }`}>
      <div className="relative w-full min-h-[380px] flex flex-col md:grid md:grid-cols-2">
        <div className="relative h-64 md:h-full overflow-hidden order-1 md:order-2 bg-stone-950 flex items-center justify-center p-8">
          <img
            src={service.img}
            alt={service.name}
            className="h-full w-full object-contain filter drop-shadow-2xl transition duration-700 hover:scale-105"
          />
        </div>
        
        <div className="p-8 lg:p-12 flex flex-col justify-center order-2 md:order-1 relative z-10 text-left">
          <div className="flex gap-2 mb-6">
            <span className="bg-[#0f172a] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Featured Service
            </span>
            <span className="bg-stone-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-stone-300 border border-stone-700">
              Verified Pros
            </span>
          </div>
          
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-2">
            Starting from {formatPrice(service.price)}
          </p>
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-white leading-tight mb-4">
            {service.name}
          </h2>
          <p className="text-stone-300 text-sm lg:text-base leading-relaxed mb-8 max-w-md font-medium">
            {service.description}
          </p>
          
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={() => onBook(service)} 
              className="px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">add_task</span>
              <span>Book Now</span>
            </button>
            <span className="text-xs font-semibold text-stone-400">
              {service.prosCount}+ Experts Available
            </span>
          </div>
        </div>
      </div>

      {featuredServices.length > 1 && (
        <div className="absolute bottom-6 right-8 z-20 flex gap-2">
          {featuredServices.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setHeroIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === heroIndex ? "w-8 bg-white" : "w-2 bg-stone-600 hover:bg-stone-500"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ServiceCard({ service, addToCart, isInCart, onBook, theme }) {
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addToCart?.(service);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article className={`group flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        theme === 'dark' 
            ? 'border-[#292524] bg-[#1c1917]' 
            : 'border-[#e2e8f0] bg-white'
    }`}>
      <div 
        className="relative h-[220px] overflow-hidden flex items-center justify-center transition-all duration-300" 
        style={{ backgroundColor: theme === 'dark' ? `${service.themeColor || '#0f172a'}15` : '#f2f4f6' }}
      >
        <img
          src={service.img}
          alt={service.name}
          className="h-full w-full object-cover filter group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <div className="bg-[#0f172a]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-bold">
            {service.badge}
          </div>
        </div>

        <div className="absolute top-3 right-3 bg-[#0f172a]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-xs text-white" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span>{service.rating}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 text-left">
        <h3 className="line-clamp-1 text-lg font-bold text-slate-900 group-hover:text-[#0f172a] transition-colors mb-1">
          {service.name}
        </h3>
        
        <p className="text-xs font-semibold text-slate-700 mb-2">
          Starts from {formatPrice(service.price)}
        </p>

        <p className="line-clamp-2 text-xs leading-relaxed font-medium text-slate-600 mb-6">
          {service.description}
        </p>

        <div className="mt-auto flex gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); handleAddToCart(); }}
            className="flex-1 rounded-lg border border-[#e2e8f0] bg-white py-3 text-xs font-semibold text-[#0f172a] hover:bg-[#f8fafc] transition-colors"
          >
            {added ? "Added!" : isInCart ? "In Cart" : "+ Add Cart"}
          </button>
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onBook(); }}
            className="flex-1 rounded-lg py-3 text-xs font-bold uppercase tracking-wider bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-sm transition-all active:scale-95"
          >
            Book Now
          </button>
        </div>
      </div>
    </article>
  );
}
