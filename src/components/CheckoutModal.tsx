import React, { useState, useEffect } from 'react';
import { CartItem, CustomerDetails, OrderRecord, UserLocationState, UserAccount } from '../types';
import { FLAVORS, TOPPINGS, formatIDR } from '../data/mochiData';
import { MOCHIKU_STORES } from '../data/storesData';
import { calculateDistanceKm, formatDistance, estimateDeliveryMinutes, estimateDeliveryFee, getStoresSortedByDistance } from '../utils/geo';
import { soundFX } from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, Check, QrCode, CreditCard, Send, MapPin, Phone, User, MessageCircle, Sparkles, Heart, LocateFixed, Radio, Clock, Award } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  userLocation?: UserLocationState;
  currentUser?: UserAccount | null;
  onOrderComplete: (order: OrderRecord) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  userLocation,
  currentUser,
  onOrderComplete,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.defaultAddress || userLocation?.addressName || '');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'gopay' | 'ovo' | 'shopeepay' | 'cash'>('qris');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        setName(currentUser.name);
        setPhone(currentUser.phone);
        if (currentUser.defaultAddress) setAddress(currentUser.defaultAddress);
      } else if (userLocation?.addressName && !address) {
        setAddress(userLocation.addressName);
      }
    }
  }, [isOpen, currentUser]);

  // Compute nearest outlet based on userLocation
  const nearestStoreInfo = userLocation
    ? getStoresSortedByDistance(MOCHIKU_STORES, userLocation.lat, userLocation.lng)[0]
    : null;

  if (!isOpen) return null;

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const packagingFee = 0; // Free
  const total = subtotal + packagingFee;

  const handleUseRealtimeGPS = () => {
    soundFX.playPop(520);
    if (userLocation?.addressName) {
      setAddress(`${userLocation.addressName} (GPS: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`);
    } else if (userLocation) {
      setAddress(`Lokasi GPS Saya (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`);
    }
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    soundFX.playSuccess();

    // Trigger sweet confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFB8C6', '#F472B6', '#A8D5BA', '#FDE49E', '#FFFFFF'],
      });
    } catch {
      // ignore
    }

    const orderRecord: OrderRecord = {
      orderId: 'MCK-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      customer: {
        name,
        phone,
        address: orderType === 'delivery' ? address : 'Ambil di Toko Mochiku (Pickup)',
        orderType,
        paymentMethod,
        notes,
      },
      items: cartItems,
      subtotal,
      packagingFee,
      total,
      status: 'confirmed',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderComplete(orderRecord);
    }, 600);
  };

  const getWhatsAppMessageUrl = () => {
    let text = `*✨ PESANAN MOCHIKU KAWAI✨*\n`;
    text += `Nama: ${name || '-'}\n`;
    text += `No HP: ${phone || '-'}\n`;
    text += `Tipe: ${orderType === 'delivery' ? 'Kirim ke Alamat' : 'Ambil di Toko'}\n`;
    if (orderType === 'delivery' && address) {
      text += `Alamat: ${address}\n`;
    }
    text += `Metode Pembayaran: ${paymentMethod.toUpperCase()}\n\n`;
    text += `*DAFTAR PESANAN:*\n`;
    cartItems.forEach((item, idx) => {
      const flavor = FLAVORS[item.flavorId];
      const topping = TOPPINGS[item.toppingId];
      text += `${idx + 1}. ${flavor.name} (${topping.shortName}) - ${item.quantity} pcs @ ${formatIDR(item.unitPrice)}\n`;
      if (item.customNote) text += `   _Catatan: ${item.customNote}_\n`;
    });
    text += `\n*TOTAL: ${formatIDR(total)}*\n`;
    if (notes) text += `Catatan Tambahan: ${notes}\n`;
    text += `\nTerima kasih Mochiku! (っ˘ڡ˘ς)`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3E2723]/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      
      <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full border-2 border-[#FCE7F3] shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#FFF0F5] via-[#FFF5EA] to-[#FFF0F5] border-b border-[#FCE7F3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[#FFD1DC] text-[#DB2777]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-fredoka text-lg sm:text-xl font-bold text-[#5C3D2E]">
                Konfirmasi Pesanan Mochi 🌸
              </h3>
              <p className="text-xs text-[#8C5D43]">
                Total: <strong className="text-[#E11D48]">{formatIDR(total)}</strong> ({totalItemCount} pcs)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playPop(400);
              onClose();
            }}
            className="p-2 rounded-full bg-white/80 hover:bg-white text-[#8C5D43] transition-colors border border-[#FCE7F3]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCompleteOrder} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {currentUser ? (
            <div className="p-3 rounded-2xl bg-[#FFF0F5] border border-[#FBCFE8] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">{currentUser.avatarEmoji || '🍓'}</span>
                <div>
                  <span className="font-bold text-[#5C3D2E] block">{currentUser.name} ({currentUser.memberTier})</span>
                  <span className="text-[11px] text-[#DB2777]">Mendapatkan +{Math.round(total / 1000)} Mochi Points dari pesanan ini ✨</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-[#FFF8E7] border border-[#FDE68A] flex items-center justify-between text-xs text-[#854D0E]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Belum punya akun? Buat akun untuk dapat <strong>+50 Poin & Diskon 15%</strong></span>
              </div>
            </div>
          )}

          {/* Order Type Toggle */}
          <div>
            <label className="text-xs font-fredoka font-bold text-[#5C3D2E] block mb-2">
              Pilihan Pengambilan:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setOrderType('delivery');
                  soundFX.playPop(460);
                }}
                className={`py-2.5 px-3 rounded-2xl border-2 text-xs font-bold font-fredoka flex items-center justify-center gap-2 transition-all ${
                  orderType === 'delivery'
                    ? 'border-[#F472B6] bg-[#FFF0F5] text-[#DB2777]'
                    : 'border-[#F0E6DF] bg-white text-[#8C5D43]'
                }`}
              >
                <span>🛵 Antar ke Alamat</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderType('pickup');
                  soundFX.playPop(460);
                }}
                className={`py-2.5 px-3 rounded-2xl border-2 text-xs font-bold font-fredoka flex items-center justify-center gap-2 transition-all ${
                  orderType === 'pickup'
                    ? 'border-[#F472B6] bg-[#FFF0F5] text-[#DB2777]'
                    : 'border-[#F0E6DF] bg-white text-[#8C5D43]'
                }`}
              >
                <span>🏪 Ambil di Toko</span>
              </button>
            </div>
          </div>

          {/* Customer Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#5C3D2E] flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-[#F472B6]" />
                <span>Nama Penerima *</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cth: Aisyah / Kevin"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F0E6DF] focus:border-[#F472B6] text-xs text-[#5C3D2E] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5C3D2E] flex items-center gap-1 mb-1">
                <Phone className="w-3.5 h-3.5 text-[#F472B6]" />
                <span>Nomor WhatsApp / HP</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Cth: 0812-3456-7890"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F0E6DF] focus:border-[#F472B6] text-xs text-[#5C3D2E] outline-none"
              />
            </div>

            {orderType === 'delivery' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#5C3D2E] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#F472B6]" />
                    <span>Alamat Lengkap Pengiriman</span>
                  </label>

                  {userLocation && (
                    <button
                      type="button"
                      onClick={handleUseRealtimeGPS}
                      className="px-2 py-0.5 rounded-lg bg-[#FFF0F5] hover:bg-[#FFE4EE] border border-[#FBCFE8] text-[11px] font-fredoka font-bold text-[#DB2777] flex items-center gap-1 transition-all active:scale-95"
                    >
                      <LocateFixed className="w-3 h-3 text-[#F472B6]" />
                      <span>Pakai GPS Saat Ini</span>
                    </button>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, patokan..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F0E6DF] focus:border-[#F472B6] text-xs text-[#5C3D2E] outline-none resize-none"
                />

                {nearestStoreInfo && (
                  <div className="p-2 rounded-xl bg-[#FFF9F5] border border-[#FCE7F3] flex items-center justify-between text-[11px] text-[#8C5D43]">
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                      <span>Outlet Terdekat: <strong>{nearestStoreInfo.store.name}</strong></span>
                    </div>
                    <span className="font-bold text-[#DB2777]">
                      {formatDistance(nearestStoreInfo.distanceKm)} ({estimateDeliveryMinutes(nearestStoreInfo.distanceKm).label})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-fredoka font-bold text-[#5C3D2E] block mb-2">
              Metode Pembayaran:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'qris', name: 'QRIS Instan', icon: '📱', badge: 'Tercepat' },
                { id: 'gopay', name: 'GoPay', icon: '🟢' },
                { id: 'ovo', name: 'OVO', icon: '🟣' },
                { id: 'shopeepay', name: 'ShopeePay', icon: '🟠' },
                { id: 'cash', name: 'Bayar di Toko / COD', icon: '💵' },
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id as typeof paymentMethod);
                      soundFX.playPop(500);
                    }}
                    className={`p-2.5 rounded-xl border-2 text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-[#F472B6] bg-[#FFF0F5] shadow-2xs'
                        : 'border-[#F0E6DF] bg-white hover:border-[#FBCFE8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{m.icon}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#F472B6]" />}
                    </div>
                    <span className="text-[11px] font-bold text-[#5C3D2E] mt-1 truncate">{m.name}</span>
                  </button>
                );
              })}
            </div>

            {/* QRIS Code Mock if QRIS selected */}
            {paymentMethod === 'qris' && (
              <div className="mt-3 p-3.5 rounded-2xl bg-white border border-[#FCE7F3] flex items-center gap-3.5">
                <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-2xs shrink-0">
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="white" />
                    {/* QR Frame Elements */}
                    <rect x="10" y="10" width="30" height="30" rx="4" fill="#5C3D2E" />
                    <rect x="16" y="16" width="18" height="18" fill="white" />
                    <rect x="20" y="20" width="10" height="10" fill="#5C3D2E" />

                    <rect x="60" y="10" width="30" height="30" rx="4" fill="#5C3D2E" />
                    <rect x="66" y="16" width="18" height="18" fill="white" />
                    <rect x="70" y="20" width="10" height="10" fill="#5C3D2E" />

                    <rect x="10" y="60" width="30" height="30" rx="4" fill="#5C3D2E" />
                    <rect x="16" y="66" width="18" height="18" fill="white" />
                    <rect x="20" y="70" width="10" height="10" fill="#5C3D2E" />

                    {/* Cute Center Mochi Icon */}
                    <rect x="44" y="44" width="16" height="16" rx="4" fill="#FFB8C6" />
                    <circle cx="49" cy="51" r="1.5" fill="#5C3D2E" />
                    <circle cx="55" cy="51" r="1.5" fill="#5C3D2E" />

                    {/* Random pixel blocks */}
                    <rect x="48" y="14" width="6" height="6" fill="#5C3D2E" />
                    <rect x="70" y="48" width="6" height="6" fill="#5C3D2E" />
                    <rect x="52" y="70" width="6" height="6" fill="#5C3D2E" />
                    <rect x="76" y="76" width="10" height="6" fill="#5C3D2E" />
                  </svg>
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[#5C3D2E] flex items-center gap-1">
                    <span>Scan QRIS Mochiku</span>
                    <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.2 rounded">NMID: ID10293847</span>
                  </div>
                  <p className="text-[11px] text-[#8C5D43]/80 mt-0.5">
                    Mendukung GoPay, OVO, ShopeePay, BCA, Mandiri, Dana, & seluruh bank.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="text-xs font-semibold text-[#5C3D2E] block mb-1">
              Catatan Khusus Pesanan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cth: Tolong berikan tas pita lucu untuk hadiah ulang tahun"
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F0E6DF] focus:border-[#F472B6] text-xs text-[#5C3D2E] outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-[#FCE7F3] space-y-2.5">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#FF94A8] via-[#F472B6] to-[#EC4899] hover:from-[#F472B6] hover:to-[#DB2777] disabled:opacity-50 text-white font-fredoka font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <span>Memproses Pesanan Manis... 🌸</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Konfirmasi & Bayar ({formatIDR(total)})</span>
                </>
              )}
            </button>

            <a
              href={getWhatsAppMessageUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-full bg-[#E8F8EE] hover:bg-[#D2F3DD] border border-[#A7F3D0] text-[#065F46] font-fredoka font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Kirim Format Pesanan via WhatsApp</span>
            </a>
          </div>

        </form>

      </div>

    </div>
  );
};
