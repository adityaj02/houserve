import React from 'react';

const Footer = ({ setActiveView }) => {
  return (
    <footer className="w-full bg-[#05070f] border-t border-white/10 mt-12 pt-16 pb-8 z-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          <div className="md:col-span-4 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border border-white/20 bg-white/5 flex items-center justify-center shadow-sm">
                <span className="font-serif font-bold text-white text-sm">H</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Houserve.in</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm font-medium leading-relaxed">
              Your trusted destination for premium home services, architectural supplies & verified real estate. Delivered direct from certified regional depot hubs in Delhi NCR.
            </p>
            <div className="space-y-3 text-xs text-gray-400 pt-2 font-medium">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[16px] text-gray-500">mail</span>
                <a className="hover:text-white transition-colors" href="mailto:shivskukreja@gmail.com">shivskukreja@gmail.com</a>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[16px] text-gray-500">call</span>
                <a className="hover:text-white transition-colors" href="tel:+919811797407">+91 98117 97407</a>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[16px] text-gray-500 mt-0.5">location_on</span>
                <span>Gurunank Market, Lajpat Nagar 4, New Delhi</span>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 space-y-4 text-xs">
            <span className="font-bold uppercase tracking-wider text-white/90 block mb-4">Product Lines</span>
            <ul className="space-y-3 text-gray-400 font-medium">
              <li><button onClick={() => setActiveView("houserve")} className="hover:text-white transition-colors cursor-pointer">Home Services (Houserve)</button></li>
              <li><a href="https://build-kart-in-is6v.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">BuildKart Depot</a></li>
              <li><button onClick={() => setActiveView("properties")} className="hover:text-white transition-colors cursor-pointer">Buy Properties</button></li>
              <li><button onClick={() => setActiveView("rentals")} className="hover:text-white transition-colors cursor-pointer">Rent Properties</button></li>
              <li><a href="https://build-kart-in-is6v.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Architectural Hardware</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-2 space-y-4 text-xs">
            <span className="font-bold uppercase tracking-wider text-white/90 block mb-4">Company</span>
            <ul className="space-y-3 text-gray-400 font-medium">
              <li><button onClick={() => setActiveView("overview")} className="hover:text-white transition-colors cursor-pointer">About Us</button></li>
              <li><button onClick={() => setActiveView("properties")} className="hover:text-white transition-colors cursor-pointer">Projects & Gallery</button></li>
              <li><a className="hover:text-white transition-colors" href="mailto:shivskukreja@gmail.com">Contact & Enquiry</a></li>
              <li><a className="hover:text-white transition-colors" href="mailto:shivskukreja@gmail.com">Quote Request</a></li>
              <li><span className="text-gray-600">Delhi NCR Depots</span></li>
            </ul>
          </div>
          
          <div className="md:col-span-3 space-y-4">
            <span className="font-bold uppercase tracking-wider text-white/90 block mb-2">Get In Touch</span>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Need a quote or have questions? Reach out via WhatsApp or email — we respond within 2 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg transition-colors shadow-sm" href="https://wa.me/919811797407" target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>WHATSAPP</span>
              </a>
              <a className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition-colors shadow-sm" href="mailto:shivskukreja@gmail.com">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <span>EMAIL</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <p>© 2026 Houserve & BuildKart Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Delhi NCR (HQ)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
