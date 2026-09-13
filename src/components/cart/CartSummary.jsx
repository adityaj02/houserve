import { useMemo, useState, useEffect, useCallback } from "react";
import useLocation from "../../hooks/useLocation";
import { getThemeTokens } from "../../styles/theme";

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function buildTimeSlots(selectedDate) {
    if (!selectedDate) return [];

    const now = new Date();
    const selectedStart = new Date(`${selectedDate}T00:00:00`);
    const selectedEnd = new Date(`${selectedDate}T23:59:59`);

    if (Number.isNaN(selectedStart.getTime())) return [];

    const slots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    const isToday = now >= selectedStart && now <= selectedEnd;
    const currentHour = now.getHours();

    return slots.map((time) => {
        const [hour, min] = time.split(':').map(Number);
        const isPast = isToday && hour < currentHour + 2;
        const isUnavailable = time === "12:00" || time === "15:00";
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';

        return {
            value: time,
            label: `${hour12}:${min === 0 ? '00' : min} ${ampm}`,
            isFull: isUnavailable || isPast,
        };
    });
}

function isResolvedLocation(value) {
    return Boolean(
        value &&
        value !== "Detecting..." &&
        value !== "Location unavailable" &&
        value !== "Unable to detect location" &&
        !String(value).toLowerCase().includes("denied")
    );
}

export default function CartSummary({
    cartItems,
    removeFromCart,
    theme,
    setCurrentView,
    onConfirmBooking,
    isCheckoutAvailable,
    checkoutMessage,
    submitting,
    bookingSuccess,
    bookingMetadata,
    onClearAll,
    profile,
    onViewBookings,
}) {
    const [checkoutStep, setCheckoutStep] = useState(() => Number(localStorage.getItem("checkout_step") || 0));
    const [selectedDate, setSelectedDate] = useState(() => localStorage.getItem("checkout_date") || "");
    const [selectedTime, setSelectedTime] = useState(() => localStorage.getItem("checkout_time") || "");
    const [addressDetails, setAddressDetails] = useState(() => {
        try {
            const stored = localStorage.getItem("checkout_address_details");
            return stored ? JSON.parse(stored) : {
                address: profile?.location || "",
                city: "New Delhi",
                pincode: ""
            };
        } catch {
            return { address: "", city: "New Delhi", pincode: "" };
        }
    });
    const [paymentMethod, setPaymentMethod] = useState("pay_on_service");
    const [localError, setLocalError] = useState("");
    const colors = getThemeTokens(theme);
    const { isLoading: isLocating, refreshLocation } = useLocation({ autoStart: false });

    const handleAutoDetect = useCallback(async () => {
        const nextLocation = await refreshLocation();
        if (isResolvedLocation(nextLocation)) {
            setAddressDetails((prev) => ({ ...prev, address: nextLocation }));
        }
    }, [refreshLocation]);

    useEffect(() => {
        localStorage.setItem("checkout_step", String(checkoutStep));
    }, [checkoutStep]);

    useEffect(() => {
        localStorage.setItem("checkout_date", selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        localStorage.setItem("checkout_time", selectedTime);
    }, [selectedTime]);

    const resolvedAddress = addressDetails.address || profile?.location || "";

    useEffect(() => {
        localStorage.setItem("checkout_address_details", JSON.stringify({ ...addressDetails, address: resolvedAddress }));
    }, [addressDetails, resolvedAddress]);

    const PLATFORM_FEE_PER_ITEM = 29;

    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0),
        [cartItems]
    );

    const platformFees = useMemo(
        () => cartItems.length * PLATFORM_FEE_PER_ITEM,
        [cartItems.length]
    );

    const totalPrice = useMemo(
        () => subtotal + platformFees,
        [subtotal, platformFees]
    );

    const dateOptions = useMemo(() => {
        return Array.from({ length: 7 }).map((_, index) => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() + index);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');

            return {
                value: `${yyyy}-${mm}-${dd}`,
                label: index === 0 ? "Today" : index === 1 ? "Tomorrow" : date.toLocaleDateString('en-IN', { weekday: 'short' }),
                fullDate: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            };
        });
    }, []);

    const timeSlots = useMemo(() => buildTimeSlots(selectedDate), [selectedDate]);

    const handleNext = () => {
        setLocalError("");

        if (checkoutStep === 0) {
            if (cartItems.length === 0) return setLocalError("Your cart is empty.");
            if (!isCheckoutAvailable && checkoutMessage) return setLocalError(checkoutMessage);
            setCheckoutStep(1);
            return;
        }

        if (checkoutStep === 1) {
            if (!selectedDate || !selectedTime) return setLocalError("Please select both date and time.");
            setCheckoutStep(2);
            return;
        }

        if (checkoutStep === 2) {
            if (!resolvedAddress.trim()) return setLocalError("Please enter your complete service address.");
            if (!addressDetails.pincode.trim()) return setLocalError("Pincode is required.");
            setCheckoutStep(3);
        }
    };

    const openWhatsApp = (customMeta = null) => {
        const meta = customMeta || bookingMetadata;
        const bookingId = meta?.order_id || meta?.id || meta?._id || 'PENDING';
        const serviceNames = cartItems.map((item) => item.name || item.title).filter(Boolean).join(', ') || meta?.cart_items?.map(i => i.name || i.title).filter(Boolean).join(', ') || meta?.service_name || 'Houserve Pro Service';
        const date = meta?.date || selectedDate || 'Flexible';
        const time = meta?.time || selectedTime || '10:00 AM';
        const cityStr = addressDetails.city ? `, ${addressDetails.city}` : '';
        const pinStr = addressDetails.pincode ? ` - ${addressDetails.pincode}` : '';
        const fullAddress = `${resolvedAddress}${cityStr}${pinStr}`;
        const address = meta?.address || fullAddress || profile?.location || 'Address on file';
        const price = meta?.total_price ? `₹${meta.total_price}` : formatCurrency(totalPrice);
        const name = profile?.name || 'Valued Customer';
        const phone = profile?.phone || 'On file';
        const email = profile?.email || '';

        const message = `🚨 *NEW HOUSERVE BOOKING REQUEST* 🚨\n\n` +
            `👤 *Customer Name:* ${name}\n` +
            `📞 *Contact Number:* ${phone}\n` +
            (email ? `✉️ *Email:* ${email}\n` : '') +
            `📍 *Location:* ${address}\n\n` +
            `🛠️ *Service(s) Booked:* ${serviceNames}\n` +
            `💰 *Total Price:* ${price}\n` +
            `📅 *Scheduled Date:* ${date}\n` +
            `⏰ *Scheduled Time:* ${time}\n` +
            `💳 *Payment Method:* ${paymentMethod === 'pay_on_service' ? 'Pay After Service' : paymentMethod === 'upi' ? 'UPI' : 'Card'}\n` +
            `🆔 *Booking ID:* #${String(bookingId).slice(0, 8).toUpperCase()}\n\n` +
            `Please confirm technician dispatch to this location.`;

        const url = `https://wa.me/919811797407?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const onSubmit = async () => {
        setLocalError("");

        if (cartItems.length === 0) return setLocalError("Your cart is empty.");
        if (!selectedDate || !selectedTime || !resolvedAddress) return setLocalError("Missing booking details. Please complete date, time and address.");

        const cityStr = addressDetails.city ? `, ${addressDetails.city}` : '';
        const pinStr = addressDetails.pincode ? ` - ${addressDetails.pincode}` : '';
        const fullAddress = `${resolvedAddress}${cityStr}${pinStr}`;
        
        const res = await onConfirmBooking?.({ date: selectedDate, time: selectedTime, address: fullAddress, paymentMethod });
        if (res?.error) {
            setLocalError(res.error);
        } else {
            // Instantly open WhatsApp with complete booking details pinned to owner
            openWhatsApp(res?.metadata);
        }
    };

    if (bookingSuccess) {
        return (
            <div className="flex-grow flex flex-col items-center justify-start py-10 px-4 lg:px-20 text-left">
                <div className={`w-full max-w-2xl p-8 lg:p-12 rounded-3xl lg:rounded-[40px] border shadow-2xl overflow-hidden relative ${
                    theme === 'dark' ? 'bg-[#1c1917] border-[#292524] text-stone-100' : 'bg-[#faf8f5] border-[#e7e5e4] text-stone-900'
                }`}>
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-emerald-600">verified</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-serif italic text-center text-stone-900 dark:text-stone-100 mb-3">
                        Booking Confirmed!
                    </h2>
                    <p className="text-center text-sm font-medium text-slate-600 mb-2">
                        Your service is scheduled for <span className="text-slate-950 font-bold">{bookingMetadata?.date}</span> at <span className="text-slate-950 font-bold">{bookingMetadata?.time}</span>
                    </p>
                    <p className="text-center text-xs font-bold uppercase tracking-widest text-stone-400 mb-8">
                        Booking ID: #{String(bookingMetadata?.order_id || 'PENDING').slice(0, 8).toUpperCase()}
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={openWhatsApp} 
                            className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#25D366]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">chat</span>
                            <span>Message Support on WhatsApp</span>
                        </button>
                        <button 
                            onClick={() => { setCheckoutStep(0); if (typeof onViewBookings === 'function') onViewBookings(); else setCurrentView('bookings'); }} 
                            className="w-full py-4 rounded-2xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] font-bold text-xs uppercase tracking-wider text-[#0f172a] transition-colors"
                        >
                            View My Bookings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex-grow flex flex-col items-center justify-start py-8 px-4 lg:px-20 animate-in fade-in duration-300 text-left ${
            theme === 'dark' ? 'text-stone-100' : 'text-stone-900'
        }`}>
            <div className={`w-full max-w-4xl p-6 sm:p-10 lg:p-12 rounded-3xl lg:rounded-[40px] border shadow-xl relative ${
                theme === 'dark' ? 'bg-[#1c1917] border-[#292524]' : 'bg-[#f7f9fb] border-[#e2e8f0]'
            }`}>
                {/* Steps Indicator */}
                {checkoutStep > 0 && (
                    <div className="mb-10 w-full max-w-xs mx-auto flex items-center justify-between">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex flex-col items-center gap-2 flex-1 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-colors ${
                                    checkoutStep >= step 
                                        ? "bg-[#0f172a] text-white shadow-sm" 
                                        : "bg-slate-200 text-slate-500"
                                }`}>
                                    {checkoutStep > step ? '✓' : step}
                                </div>
                                {step < 3 && (
                                    <div className={`absolute left-1/2 top-4 w-full h-[2px] ${
                                        checkoutStep > step ? "bg-[#0f172a]" : "bg-slate-200"
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    {checkoutStep > 0 && (
                        <button 
                            onClick={() => setCheckoutStep(checkoutStep - 1)} 
                            className="w-10 h-10 rounded-2xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] flex items-center justify-center text-[#0f172a] transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </button>
                    )}
                    <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-900 block mb-0.5">
                            {checkoutStep === 0 ? 'Review & Checkout' : `Step ${checkoutStep} of 3`}
                        </span>
                        <h2 className="text-3xl lg:text-5xl font-display font-bold text-slate-950">
                            {checkoutStep === 0 ? 'Order Summary' : checkoutStep === 1 ? 'Select Date & Slot' : checkoutStep === 2 ? 'Service Location' : 'Payment & Confirm'}
                        </h2>
                    </div>
                </div>

                {/* STEP 0: Cart Items */}
                {checkoutStep === 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-slate-950">Your Cart Items</h3>
                                {cartItems.length > 0 && (
                                    <span className="px-2.5 py-0.5 bg-[#0f172a] text-white text-[10px] font-bold rounded-full">
                                        {cartItems.length}
                                    </span>
                                )}
                            </div>
                            {cartItems.length > 0 && typeof onClearAll === "function" && (
                                <button 
                                    onClick={onClearAll} 
                                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {cartItems.length === 0 ? (
                                <div className="py-16 text-center text-slate-500 font-medium">Your service cart is empty</div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.service_id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-slate-100 p-2">
                                            <img src={item.img} className="w-full h-full object-contain" alt={item.name} />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-sm text-slate-950">{item.name}</h4>
                                            <p className="text-xs font-semibold text-slate-900">₹{item.price} <span className="text-slate-400 font-normal">+ ₹{PLATFORM_FEE_PER_ITEM} fee</span></p>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.service_id)} 
                                            className="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="mt-8 space-y-4 pt-6 border-t border-slate-200">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                                        <span>Subtotal</span>
                                        <span className="text-slate-950 font-bold">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                                        <span>Platform & Safety Fee</span>
                                        <span className="text-slate-950 font-bold">{formatCurrency(platformFees)}</span>
                                    </div>
                                    <div className="h-px w-full bg-slate-200 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-base text-slate-950">Total Amount</span>
                                        <span className="text-2xl font-bold text-slate-950">{formatCurrency(totalPrice)}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleNext} 
                                    className="w-full py-4 rounded-lg font-bold text-xs uppercase tracking-wider bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-sm transition-all active:scale-95"
                                >
                                    Proceed to Schedule Slot
                                </button>
                            </div>
                        )}
                        {localError && <p className="text-center text-xs text-rose-500 font-bold">{localError}</p>}
                    </div>
                )}

                {/* STEP 1: Date & Time */}
                {checkoutStep === 1 && (
                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">Select Date</label>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {dateOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setSelectedDate(opt.value); setSelectedTime(""); }}
                                        className={`shrink-0 px-5 py-3.5 rounded-2xl border flex flex-col items-center gap-0.5 transition-all ${
                                            selectedDate === opt.value 
                                                ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm" 
                                                : "bg-white border-slate-200 text-slate-700"
                                        }`}
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{opt.label}</span>
                                        <span className="text-sm font-bold">{opt.fullDate}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedDate && (
                            <div>
                                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">Select Arrival Time</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot.value}
                                            disabled={slot.isFull}
                                            onClick={() => setSelectedTime(slot.value)}
                                            className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                                                slot.isFull 
                                                    ? 'opacity-30 cursor-not-allowed border-slate-200' 
                                                    : selectedTime === slot.value 
                                                        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm' 
                                                        : 'bg-white border-slate-200 text-slate-700 hover:border-[#0f172a]'
                                            }`}
                                        >
                                            {slot.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-200">
                            <button 
                                onClick={handleNext} 
                                disabled={!selectedDate || !selectedTime} 
                                className="w-full py-4 rounded-lg font-bold text-xs uppercase tracking-wider bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                Continue to Address
                            </button>
                            {localError && <p className="text-center text-xs text-rose-500 font-bold mt-3">{localError}</p>}
                        </div>
                    </div>
                )}

                {/* STEP 2: Address */}
                {checkoutStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Service Location</label>
                            <button 
                                onClick={handleAutoDetect} 
                                className="text-xs font-bold text-slate-900 hover:text-slate-950 flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">my_location</span>
                                <span>{isLocating ? "Detecting..." : "Auto-Detect Location"}</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                value={resolvedAddress}
                                onChange={(e) => setAddressDetails((prev) => ({ ...prev, address: e.target.value }))}
                                placeholder="House No, Floor, Flat Name, Street Address..."
                                rows={3}
                                className="w-full rounded-xl p-4 text-sm font-medium outline-none border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-[#0f172a] transition-all resize-none"
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">City</span>
                                    <input
                                        type="text"
                                        value={addressDetails.city}
                                        onChange={(e) => setAddressDetails((prev) => ({ ...prev, city: e.target.value }))}
                                        className="bg-transparent outline-none font-semibold text-sm text-slate-950"
                                    />
                                </div>
                                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Pincode</span>
                                    <input
                                        type="text"
                                        placeholder="1100xx"
                                        value={addressDetails.pincode}
                                        onChange={(e) => setAddressDetails((prev) => ({ ...prev, pincode: e.target.value }))}
                                        className="bg-transparent outline-none font-semibold text-sm text-slate-950"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleNext} 
                            disabled={!resolvedAddress || !addressDetails.pincode} 
                            className="w-full py-4 rounded-lg font-bold text-xs uppercase tracking-wider bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            Final Order Review
                        </button>
                        {localError && <p className="text-center text-xs text-rose-500 font-bold mt-2">{localError}</p>}
                    </div>
                )}

                {/* STEP 3: Confirm & Pay */}
                {checkoutStep === 3 && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl border border-slate-200 bg-white">
                            <h4 className="text-xs uppercase font-bold text-slate-400 mb-4">Order Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-slate-500">Services ({cartItems.length})</span>
                                    <span className="text-slate-950 font-bold">{formatCurrency(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-slate-500">Scheduled Time</span>
                                    <span className="text-slate-950 font-bold">{selectedDate} at {selectedTime}</span>
                                </div>
                                <div className="flex flex-col gap-0.5 pt-1">
                                    <span className="text-xs text-slate-500 font-semibold">Service Location</span>
                                    <span className="text-xs font-bold text-slate-950 line-clamp-1">{resolvedAddress}, {addressDetails.city}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs uppercase font-bold text-slate-400 mb-3 block">Payment Method</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                {[
                                    { id: 'upi', label: 'UPI / QR Code', icon: 'qr_code_2' },
                                    { id: 'card', label: 'Card Payment', icon: 'credit_card' },
                                    { id: 'pay_on_service', label: 'Pay After Service', icon: 'payments' },
                                ].map((option) => {
                                    const isSelected = paymentMethod === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(option.id)}
                                            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                isSelected 
                                                    ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md scale-[1.02]" 
                                                    : "bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] hover:border-slate-400"
                                            }`}
                                        >
                                            <span className={`material-symbols-outlined text-2xl ${isSelected ? "text-white" : "text-[#0f172a]"}`}>{option.icon}</span>
                                            <span className="text-[11px] font-bold tracking-tight">{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Sub-view details for selected payment option */}
                            {paymentMethod === 'upi' && (
                                <div className="p-4 rounded-2xl border border-[#e2e8f0] bg-white space-y-3 mb-4 animate-in fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-white flex items-center justify-center font-bold">
                                            <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#0f172a]">Instant UPI / QR Payment</p>
                                            <p className="text-[11px] font-medium text-slate-500">GPay, PhonePe, Paytm, BHIM or any UPI app</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-[#f2f4f6] rounded-xl border border-[#e2e8f0] flex items-center justify-between text-xs font-semibold text-[#0f172a]">
                                        <span>UPI ID: <strong className="font-bold">houserve@icici</strong></span>
                                        <span className="text-[10px] uppercase tracking-wider font-bold bg-[#0f172a] text-white px-2 py-0.5 rounded-full">Verified</span>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'card' && (
                                <div className="p-4 rounded-2xl border border-[#e2e8f0] bg-white space-y-3 mb-4 animate-in fade-in">
                                    <p className="text-xs font-bold text-[#0f172a]">Credit / Debit Card</p>
                                    <div className="space-y-2">
                                        <input 
                                            type="text" 
                                            placeholder="Card Number (4532 •••• •••• 8921)" 
                                            className="w-full p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-xs font-semibold outline-none focus:border-[#0f172a]"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="MM / YY" 
                                                className="w-full p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-xs font-semibold outline-none focus:border-[#0f172a]"
                                            />
                                            <input 
                                                type="password" 
                                                maxLength={4}
                                                placeholder="CVV" 
                                                className="w-full p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-xs font-semibold outline-none focus:border-[#0f172a]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'pay_on_service' && (
                                <div className="p-4 rounded-2xl border border-[#e2e8f0] bg-white space-y-2 mb-4 animate-in fade-in">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-600 text-lg">verified_user</span>
                                        <p className="text-xs font-bold text-[#0f172a]">Pay After Service Completion</p>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                                        Pay via Cash, GPay, or UPI directly to the verified service professional after work is completed to your satisfaction.
                                    </p>
                                </div>
                            )}
                        </div>

                        <button 
                            type="button"
                            onClick={onSubmit} 
                            disabled={submitting} 
                            className="w-full py-4 rounded-lg font-bold text-xs uppercase tracking-wider bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-sm disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            <span>{submitting ? 'Confirming Order...' : 'Place Booking Now'}</span>
                        </button>
                        {(localError || checkoutMessage) && (
                            <p className="text-center text-xs text-rose-500 font-bold mt-2">
                                {localError || checkoutMessage}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
