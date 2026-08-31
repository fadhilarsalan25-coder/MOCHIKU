import React from 'react';
import { CartItem } from '../types';
import { FLAVORS, TOPPINGS, formatIDR } from '../data/mochiData';
import { KawaiiMochiIllustration } from './KawaiiMochiIllustration';
import { soundFX } from '../utils/audio';
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles, ArrowRight, Heart } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3E2723]/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => {
          soundFX.playPop(400);
          onClose();
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFDF9] border-l-2 border-[#FCE7F3] shadow-2xl flex flex-col justify-between">
          
          {/* DRAWER HEADER */}
          <div className="p-5 border-b border-[#FCE7F3] bg-gradient-to-r from-[#FFF0F5] to-[#FFF8E7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-[#FFD1DC] text-[#DB2777]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-fredoka text-lg font-bold text-[#5C3D2E]">
                  Keranjang Mochi ({totalItemCount})
                </h3>
                <p className="text-[11px] text-[#8C5D43]">
                  MOCHIKU • Fresh & Kawaii
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundFX.playPop(420);
                onClose();
              }}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-[#8C5D43] transition-colors border border-[#FCE7F3]"
              aria-label="Close cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* DRAWER BODY: ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 mb-4 rounded-full bg-[#FFF0F5] border border-[#FBCFE8] flex items-center justify-center text-4xl animate-bounce">
                  🍡
                </div>
                <h4 className="font-fredoka text-lg font-bold text-[#5C3D2E]">
                  Keranjangmu Masih Kosong!
                </h4>
                <p className="text-xs text-[#8C5D43]/80 max-w-xs mt-1 leading-relaxed">
                  Yuk pilih rasa mochi matcha, strawberry, mango, oreo, atau cokelat favoritmu dengan topping lezat!
                </p>
                <button
                  onClick={() => {
                    soundFX.playPop(520);
                    onClose();
                  }}
                  className="mt-6 px-6 py-2.5 rounded-full bg-[#F472B6] hover:bg-[#DB2777] text-white font-fredoka text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  Mulai Pilih Mochi ✨
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const flavor = FLAVORS[item.flavorId];
                const topping = TOPPINGS[item.toppingId];
                const itemTotal = item.unitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#FCE7F3] shadow-xs flex items-center gap-3.5 hover:border-[#FBCFE8] transition-all"
                  >
                    {/* Cute Mini Mochi Illustration */}
                    <div className="shrink-0 bg-[#FFF9F5] p-1.5 rounded-xl border border-[#FCE7F3]">
                      <KawaiiMochiIllustration
                        flavorId={item.flavorId}
                        toppingId={item.toppingId}
                        size="sm"
                        interactive={false}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="font-fredoka text-sm font-bold text-[#5C3D2E] truncate">
                          {item.bundleTitle || flavor.name}
                        </h5>
                        <button
                          onClick={() => {
                            soundFX.playPop(340);
                            onRemoveItem(item.id);
                          }}
                          className="text-[#A89F91] hover:text-[#E11D48] p-1 transition-colors"
                          title="Hapus item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#DB2777] font-semibold mt-0.5 flex items-center gap-1">
                        <span>{topping.shortName}</span>
                        <span className="text-[#8C5D43]/60">•</span>
                        <span className="text-[#8C5D43]">
                          {formatIDR(item.unitPrice)}/pcs
                        </span>
                      </div>

                      {item.customNote && (
                        <p className="text-[10px] text-[#8C5D43]/70 italic mt-0.5 truncate">
                          &quot;{item.customNote}&quot;
                        </p>
                      )}

                      {/* Quantity & Subtotal */}
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-[#FFF9F5] px-2 py-1 rounded-full border border-[#FCE7F3]">
                          <button
                            onClick={() => {
                              soundFX.playPop(380);
                              onUpdateQuantity(item.id, -1);
                            }}
                            className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#5C3D2E] hover:bg-[#FFE4E6] text-xs transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-fredoka text-xs font-bold text-[#5C3D2E] min-w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              soundFX.playPop(480);
                              onUpdateQuantity(item.id, 1);
                            }}
                            className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#5C3D2E] hover:bg-[#FFE4E6] text-xs transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-fredoka text-sm font-bold text-[#5C3D2E]">
                          {formatIDR(itemTotal)}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* DRAWER FOOTER: SUMMARY & CHECKOUT */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-[#FCE7F3] bg-[#FFF9F5] space-y-4">
              
              {/* Cute Promo / Free sticker perk note */}
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#FFF0F5] border border-[#FBCFE8] text-xs text-[#DB2777]">
                <Sparkles className="w-4 h-4 shrink-0 text-[#F472B6]" />
                <span className="text-[11px] font-medium">
                  Free Cute Mochiku Sticker + Chilled Ice Gel Pack included! 💖
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#8C5D43]">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItemCount} pcs)</span>
                  <span className="font-semibold text-[#5C3D2E]">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kotak Kemasan & Tas Kawaii</span>
                  <span className="text-emerald-600 font-semibold">GRATIS</span>
                </div>
                <div className="pt-2 border-t border-[#FCE7F3] flex justify-between items-baseline">
                  <span className="font-fredoka text-sm font-bold text-[#5C3D2E]">Total Pembayaran</span>
                  <span className="font-fredoka text-xl font-bold text-[#E11D48]">
                    {formatIDR(subtotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  soundFX.playSparkle();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#FF94A8] via-[#F472B6] to-[#EC4899] hover:from-[#F472B6] hover:to-[#DB2777] text-white font-fredoka font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
