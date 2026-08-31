import React from 'react';
import { OrderRecord } from '../types';
import { FLAVORS, TOPPINGS, formatIDR } from '../data/mochiData';
import { soundFX } from '../utils/audio';
import { CheckCircle2, Heart, Copy, ArrowLeft, Sparkles, MapPin, Receipt, Share2 } from 'lucide-react';

interface OrderSuccessModalProps {
  order: OrderRecord | null;
  onClose: () => void;
  onNewOrder: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onNewOrder,
}) => {
  if (!order) return null;

  const handleCopyReceipt = () => {
    soundFX.playSparkle();
    const receiptText = `=== MOCHIKU RECEIPT ===\nOrder ID: ${order.orderId}\nNama: ${order.customer.name}\nTotal: ${formatIDR(order.total)}\nStatus: Diterima & Sedang Disiapkan!`;
    navigator.clipboard?.writeText(receiptText);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3E2723]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      
      <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full border-2 border-[#FCE7F3] shadow-2xl overflow-hidden p-6 sm:p-8 animate-scale-up text-center">
        
        {/* Top Celebration Icon */}
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-full bg-[#FFF0F5] border-2 border-[#FBCFE8] flex items-center justify-center text-4xl mx-auto shadow-sm animate-bounce">
            🍡
          </div>
          <span className="absolute -top-1 -right-1 text-2xl">✨</span>
        </div>

        <h3 className="font-pacifico text-2xl sm:text-3xl text-[#5C3D2E]">
          Arigatou Gozaimasu!
        </h3>
        <p className="font-fredoka text-sm text-[#DB2777] font-semibold mt-1">
          Pesanan Mochiku Berhasil Dibuat 💖
        </p>

        {/* Order Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F8EE] text-[#065F46] border border-[#A7F3D0] text-xs font-bold mt-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Nomor Pesanan: {order.orderId}</span>
        </div>

        {/* Kawaii Receipt Card */}
        <div className="mt-5 p-4 rounded-2xl bg-white border border-[#FCE7F3] shadow-inner text-left space-y-3">
          <div className="flex items-center justify-between border-b border-[#FCE7F3] pb-2">
            <span className="text-xs font-bold text-[#5C3D2E] flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-[#F472B6]" />
              <span>Rincian Pembelian</span>
            </span>
            <span className="text-[11px] text-[#8C5D43]">{order.createdAt}</span>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {order.items.map((item, idx) => {
              const flavor = FLAVORS[item.flavorId];
              const topping = TOPPINGS[item.toppingId];
              return (
                <div key={idx} className="text-xs flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-[#5C3D2E]">
                      {item.quantity}x {item.bundleTitle || flavor.name}
                    </span>
                    <div className="text-[10px] text-[#DB2777]">
                      {topping.shortName}
                    </div>
                  </div>
                  <span className="font-semibold text-[#5C3D2E]">
                    {formatIDR(item.unitPrice * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="border-t border-dashed border-[#FCE7F3] pt-2 space-y-1 text-xs">
            <div className="flex justify-between text-[#8C5D43]">
              <span>Pengiriman / Ambil:</span>
              <span className="font-semibold">{order.customer.orderType === 'delivery' ? 'Kurir Instan' : 'Pickup di Outlet'}</span>
            </div>
            <div className="flex justify-between text-[#8C5D43]">
              <span>Pembayaran:</span>
              <span className="font-semibold uppercase">{order.customer.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm font-fredoka font-bold text-[#5C3D2E] pt-1">
              <span>Total Akhir:</span>
              <span className="text-[#E11D48] text-base">{formatIDR(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer Note if any */}
        <p className="text-[11px] text-[#8C5D43] mt-3">
          Mochi akan disiapkan segar dan empuk khusus untukmu! Silakan simpan di suhu sejuk.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleCopyReceipt}
            className="flex-1 py-2.5 px-3 rounded-full bg-[#FFF5EA] hover:bg-[#FFE8EE] border border-[#F7D6C8] text-[#8C5D43] text-xs font-fredoka font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Bukti</span>
          </button>

          <button
            onClick={() => {
              soundFX.playPop(520);
              onNewOrder();
            }}
            className="flex-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#FF94A8] to-[#F472B6] hover:from-[#F472B6] hover:to-[#DB2777] text-white text-xs font-fredoka font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pesan Lagi</span>
          </button>
        </div>

      </div>

    </div>
  );
};
