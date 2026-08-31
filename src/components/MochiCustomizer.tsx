import React, { useState } from 'react';
import { FlavorId, ToppingId } from '../types';
import { FLAVORS, TOPPINGS, PRICE_NO_TOPPING, PRICE_WITH_TOPPING, formatIDR } from '../data/mochiData';
import { KawaiiMochiIllustration } from './KawaiiMochiIllustration';
import { soundFX } from '../utils/audio';
import { Sparkles, Plus, Minus, Heart, Check, ShoppingBag, Info, Wand2 } from 'lucide-react';

interface MochiCustomizerProps {
  onAddToCart: (item: {
    flavorId: FlavorId;
    toppingId: ToppingId;
    quantity: number;
    unitPrice: number;
    customNote?: string;
  }) => void;
  initialFlavor?: FlavorId;
  initialTopping?: ToppingId;
}

export const MochiCustomizer: React.FC<MochiCustomizerProps> = ({
  onAddToCart,
  initialFlavor = 'strawberry',
  initialTopping = 'marshmallow',
}) => {
  const [selectedFlavor, setSelectedFlavor] = useState<FlavorId>(initialFlavor);
  const [selectedTopping, setSelectedTopping] = useState<ToppingId>(initialTopping);
  const [quantity, setQuantity] = useState<number>(1);
  const [customNote, setCustomNote] = useState<string>('');
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [squishCount, setSquishCount] = useState<number>(0);

  const flavor = FLAVORS[selectedFlavor];
  const topping = TOPPINGS[selectedTopping];

  const unitPrice = selectedTopping === 'none' ? PRICE_NO_TOPPING : PRICE_WITH_TOPPING;
  const totalPrice = unitPrice * quantity;

  const handleFlavorSelect = (fId: FlavorId) => {
    setSelectedFlavor(fId);
    soundFX.playPop(480);
  };

  const handleToppingSelect = (tId: ToppingId) => {
    setSelectedTopping(tId);
    soundFX.playSparkle();
  };

  const handleSquish = () => {
    setSquishCount((prev) => prev + 1);
  };

  const handleAdd = () => {
    onAddToCart({
      flavorId: selectedFlavor,
      toppingId: selectedTopping,
      quantity,
      unitPrice,
      customNote: customNote.trim() ? customNote.trim() : undefined,
    });

    soundFX.playSparkle();
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleRandomize = () => {
    const flavorKeys = Object.keys(FLAVORS) as FlavorId[];
    const toppingKeys = Object.keys(TOPPINGS) as ToppingId[];
    const randomFlavor = flavorKeys[Math.floor(Math.random() * flavorKeys.length)];
    const randomTopping = toppingKeys[Math.floor(Math.random() * toppingKeys.length)];
    setSelectedFlavor(randomFlavor);
    setSelectedTopping(randomTopping);
    soundFX.playSparkle();
  };

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-2 border-[#FCE7F3] shadow-lg relative overflow-hidden">
      
      {/* Decorative Pastel Ribbon & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F5] border border-[#FBCFE8] text-xs font-semibold text-[#DB2777] mb-1.5">
            <Heart className="w-3.5 h-3.5 fill-[#DB2777]" />
            <span>Interactive Mochi Studio</span>
          </div>
          <h2 className="font-fredoka text-2xl sm:text-3xl text-[#5C3D2E] font-bold">
            Create Your Dream Mochi ✨
          </h2>
          <p className="text-sm text-[#8C5D43]/90 mt-0.5">
            Pilih rasa favorit & topping manis kesukaanmu!
          </p>
        </div>

        <button
          onClick={handleRandomize}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF8E7] hover:bg-[#FDE68A] border border-[#FCD34D] text-xs font-semibold text-[#854D0E] transition-colors shadow-2xs active:scale-95"
          title="Surprise me with a cute combo!"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Acak Rasa (Surprise Me)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT COLUMN: Kawaii Mochi Live Canvas & Interaction */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-[#FFF5F7] via-[#FFFDF9] to-[#FDF6F0] border border-[#FCE7F3] shadow-inner relative">
          
          {/* Price Tag Pill */}
          <div className="absolute top-4 left-4 z-10">
            <div className="px-3.5 py-1.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#FBCFE8] shadow-xs">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C5D43]/70 block">Harga Satuan</span>
              <span className="font-fredoka text-lg font-bold text-[#E11D48]">
                {formatIDR(unitPrice)}
              </span>
            </div>
          </div>

          {/* Flavor & Japanese Name Top Right */}
          <div className="absolute top-4 right-4 text-right z-10">
            <span className="text-xs font-bold text-[#8C5D43] bg-white/80 px-2.5 py-1 rounded-full border border-[#FCE7F3] shadow-2xs">
              {flavor.japaneseName}
            </span>
          </div>

          {/* Big Interactive 2D Kawaii Mochi */}
          <div className="my-6 relative py-4">
            <KawaiiMochiIllustration
              flavorId={selectedFlavor}
              toppingId={selectedTopping}
              size="hero"
              interactive={true}
              onSquish={handleSquish}
            />
          </div>

          {/* Interactive Squish Instruction */}
          <div className="text-center mt-2">
            <p className="text-xs text-[#8C5D43] font-medium flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F472B6] animate-spin" style={{ animationDuration: '4s' }} />
              <span>Sentuh mochi untuk meremasnya!</span>
              {squishCount > 0 && (
                <span className="text-[11px] font-bold text-[#E11D48] bg-[#FFE4E6] px-2 py-0.5 rounded-full">
                  {squishCount}x squished 💖
                </span>
              )}
            </p>
            <div className="mt-2 text-xs font-semibold text-[#5C3D2E]">
              {flavor.name} • <span className="text-[#DB2777]">{topping.shortName}</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Customization Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* STEP 1: Select Flavor */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-sm font-fredoka font-bold text-[#5C3D2E] flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFE4E6] text-[#E11D48] text-xs font-bold">1</span>
                <span>Pilih Varian Rasa Mochi</span>
              </label>
              <span className="text-xs font-medium text-[#8C5D43]">5 Pilihan Rasa</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(FLAVORS) as FlavorId[]).map((fId) => {
                const f = FLAVORS[fId];
                const isSelected = selectedFlavor === fId;
                return (
                  <button
                    key={fId}
                    onClick={() => handleFlavorSelect(fId)}
                    className={`relative p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#F472B6] bg-[#FFF0F5] shadow-sm scale-[1.02]'
                        : 'border-[#F0E6DF] bg-[#FFFDF9] hover:border-[#FBCFE8] hover:bg-[#FFF5F7]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{f.iconEmoji}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#F472B6] text-white flex items-center justify-center text-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-[#5C3D2E] leading-tight">
                        {f.name.replace(/ .*/, '')}
                      </div>
                      <div className="text-[10px] text-[#8C5D43]/80 truncate">
                        {f.japaneseName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Select Topping (with direct price indication) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-sm font-fredoka font-bold text-[#5C3D2E] flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFE4E6] text-[#E11D48] text-xs font-bold">2</span>
                <span>Pilih Topping Spesial</span>
              </label>
              <span className="text-xs text-[#8C5D43] bg-[#FFF8E7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                Topping = Rp 5.000
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(TOPPINGS) as ToppingId[]).map((tId) => {
                const t = TOPPINGS[tId];
                const isSelected = selectedTopping === tId;
                const priceForThis = tId === 'none' ? PRICE_NO_TOPPING : PRICE_WITH_TOPPING;

                return (
                  <button
                    key={tId}
                    onClick={() => handleToppingSelect(tId)}
                    className={`relative p-3 rounded-2xl border-2 transition-all text-left flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#F472B6] bg-[#FFF0F5] shadow-sm'
                        : 'border-[#F0E6DF] bg-[#FFFDF9] hover:border-[#FBCFE8] hover:bg-[#FFF5F7]'
                    }`}
                  >
                    <div className="text-2xl pt-0.5">{t.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#5C3D2E] truncate">{t.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#F472B6] shrink-0" />}
                      </div>
                      <p className="text-[11px] text-[#8C5D43]/80 line-clamp-1 mt-0.5">
                        {t.description}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${tId === 'none' ? 'text-emerald-700' : 'text-[#DB2777]'}`}>
                          {formatIDR(priceForThis)}
                        </span>
                        {tId === 'none' && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded">
                            Hemat
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Quantity & Sweet Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            
            {/* Quantity Stepper */}
            <div className="sm:col-span-5 bg-[#FFF9F5] p-3 rounded-2xl border border-[#FCE7F3] flex items-center justify-between">
              <span className="text-xs font-bold text-[#5C3D2E]">Jumlah:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (quantity > 1) {
                      setQuantity((q) => q - 1);
                      soundFX.playPop(380);
                    }
                  }}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-full bg-white border border-[#FBCFE8] flex items-center justify-center text-[#5C3D2E] hover:bg-[#FFE4E6] disabled:opacity-40 transition-colors shadow-2xs"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-fredoka text-lg font-bold text-[#5C3D2E]">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    setQuantity((q) => q + 1);
                    soundFX.playPop(520);
                  }}
                  className="w-8 h-8 rounded-full bg-white border border-[#FBCFE8] flex items-center justify-center text-[#5C3D2E] hover:bg-[#FFE4E6] transition-colors shadow-2xs"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Optional Note */}
            <div className="sm:col-span-7">
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Catatan (cth: jangan terlalu manis, topping pisah)"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#F0E6DF] focus:border-[#F472B6] focus:bg-white text-xs text-[#5C3D2E] outline-none transition-all placeholder:text-[#A89F91]"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON & PRICE FOOTER */}
          <div className="pt-2 border-t border-[#FCE7F3] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#8C5D43] font-medium block">Total Pembelian:</span>
              <div className="flex items-baseline gap-2">
                <span className="font-fredoka text-2xl font-bold text-[#5C3D2E]">
                  {formatIDR(totalPrice)}
                </span>
                <span className="text-xs text-[#8C5D43]">
                  ({quantity}x {formatIDR(unitPrice)})
                </span>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className={`w-full sm:w-auto px-7 py-3.5 rounded-full font-fredoka font-bold text-base transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-95 ${
                addedAnimation
                  ? 'bg-emerald-500 text-white scale-105'
                  : 'bg-gradient-to-r from-[#FF94A8] via-[#F472B6] to-[#EC4899] hover:from-[#F472B6] hover:to-[#DB2777] text-white shadow-[#F472B6]/25'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-5 h-5 animate-bounce" />
                  <span>Berhasil Ditambahkan! 💖</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Tambah ke Keranjang</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
