import React, { useState } from 'react';
import { FlavorId, ToppingId } from '../types';
import { FLAVORS, POPULAR_COMBOS, PRICE_NO_TOPPING, PRICE_WITH_TOPPING, formatIDR } from '../data/mochiData';
import { KawaiiMochiIllustration } from './KawaiiMochiIllustration';
import { soundFX } from '../utils/audio';
import { Sparkles, Star, Plus, Heart, Eye } from 'lucide-react';

interface FlavorCatalogProps {
  onSelectForCustomize: (flavorId: FlavorId, toppingId: ToppingId) => void;
  onQuickAdd: (flavorId: FlavorId, toppingId: ToppingId, price: number) => void;
}

export const FlavorCatalog: React.FC<FlavorCatalogProps> = ({
  onSelectForCustomize,
  onQuickAdd,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'fruity' | 'classic' | 'rich'>('all');

  const flavorList = Object.values(FLAVORS);

  return (
    <div className="space-y-12">
      
      {/* SECTION 1: POPULAR CHEF COMBINATIONS */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F5] border border-[#FBCFE8] text-xs font-semibold text-[#DB2777] mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trending & Best Sellers</span>
            </div>
            <h3 className="font-fredoka text-2xl sm:text-3xl text-[#5C3D2E] font-bold">
              Kombinasi Mochi Terfavorit 🌸
            </h3>
          </div>
          <p className="text-xs text-[#8C5D43]">
            Paling banyak dipesan minggu ini
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_COMBOS.map((combo, idx) => {
            const flavor = FLAVORS[combo.flavorId];
            const isTopped = combo.toppingId !== 'none';
            const price = isTopped ? PRICE_WITH_TOPPING : PRICE_NO_TOPPING;

            return (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 border border-[#FCE7F3] hover:border-[#F472B6] transition-all hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badge & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#FFF0F5] text-[#DB2777] text-[11px] font-bold border border-[#FBCFE8]">
                      {combo.badge}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span>{combo.rating}</span>
                    </div>
                  </div>

                  {/* 2D Cute Mochi Preview */}
                  <div className="flex items-center justify-center py-3">
                    <KawaiiMochiIllustration
                      flavorId={combo.flavorId}
                      toppingId={combo.toppingId}
                      size="md"
                      interactive={true}
                    />
                  </div>

                  {/* Title & Description */}
                  <div className="text-center mt-1">
                    <h4 className="font-fredoka text-base font-bold text-[#5C3D2E] group-hover:text-[#DB2777] transition-colors">
                      {combo.title}
                    </h4>
                    <p className="text-xs text-[#8C5D43]/80 mt-0.5">
                      Rasa {flavor.name} • {combo.toppingId === 'none' ? 'Polos Tradisional' : `Topping ${combo.toppingId}`}
                    </p>
                  </div>
                </div>

                {/* Price & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-[#FCE7F3] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#8C5D43]/70 uppercase font-semibold block">Harga</span>
                    <span className="font-fredoka text-base font-bold text-[#E11D48]">
                      {formatIDR(price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        soundFX.playPop(500);
                        onSelectForCustomize(combo.flavorId, combo.toppingId);
                      }}
                      className="p-2 rounded-full bg-[#FFF5EA] hover:bg-[#FFE8EE] text-[#8C5D43] border border-[#F7D6C8] transition-colors"
                      title="Kustomisasi"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playSparkle();
                        onQuickAdd(combo.flavorId, combo.toppingId, price);
                      }}
                      className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[#FFB8C6] to-[#F472B6] hover:from-[#F472B6] hover:to-[#EC4899] text-white text-xs font-fredoka font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pesan</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: EXPLORE ALL 5 FLAVORS */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] border border-[#FDE68A] text-xs font-semibold text-[#854D0E] mb-1.5">
              <Heart className="w-3.5 h-3.5 fill-[#854D0E]" />
              <span>Menu Utama Mochi</span>
            </div>
            <h3 className="font-fredoka text-2xl sm:text-3xl text-[#5C3D2E] font-bold">
              5 Pilihan Rasa Mochi Khas Mochiku 🍡
            </h3>
          </div>
          <p className="text-xs text-[#8C5D43]">
            Tersedia pilihan <strong>Polos (Rp 2.000)</strong> atau dengan <strong>Topping (Rp 5.000)</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flavorList.map((flavor) => {
            return (
              <div
                key={flavor.id}
                className="bg-white/85 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#FCE7F3] hover:border-[#F472B6] transition-all hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#8C5D43] bg-[#FFF0F5] px-2.5 py-1 rounded-full border border-[#FCE7F3]">
                        {flavor.japaneseName}
                      </span>
                      <h4 className="font-fredoka text-xl font-bold text-[#5C3D2E] mt-2">
                        {flavor.name}
                      </h4>
                      <p className="text-xs text-[#DB2777] font-semibold mt-0.5">
                        {flavor.tagline}
                      </p>
                    </div>
                    <span className="text-3xl">{flavor.iconEmoji}</span>
                  </div>

                  {/* 2D Cute Character Illustration */}
                  <div className="flex items-center justify-center my-4 py-2">
                    <KawaiiMochiIllustration
                      flavorId={flavor.id}
                      toppingId="none"
                      size="md"
                      interactive={true}
                    />
                  </div>

                  {/* Flavor Description */}
                  <p className="text-xs text-[#8C5D43]/90 leading-relaxed">
                    {flavor.description}
                  </p>

                  {/* Sweetness & Chewiness Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-2xl bg-[#FFF9F5] border border-[#FCE7F3] text-xs">
                    <div>
                      <span className="text-[10px] text-[#8C5D43]/80 uppercase font-semibold">Tingkat Manis</span>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full ${
                              level <= flavor.sweetness ? 'bg-[#FF85A2]' : 'bg-[#E5E7EB]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8C5D43]/80 uppercase font-semibold">Kenyal Mochi</span>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full ${
                              level <= flavor.chewiness ? 'bg-[#3B7A4C]' : 'bg-[#E5E7EB]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Pricing & Actions */}
                <div className="mt-5 pt-4 border-t border-[#FCE7F3] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#8C5D43]">Polos Tanpa Topping:</span>
                    <span className="text-[#5C3D2E] font-fredoka font-bold text-sm">
                      {formatIDR(PRICE_NO_TOPPING)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#DB2777]">Dengan Topping Spesial:</span>
                    <span className="text-[#DB2777] font-fredoka font-bold text-sm">
                      {formatIDR(PRICE_WITH_TOPPING)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        soundFX.playSparkle();
                        onQuickAdd(flavor.id, 'none', PRICE_NO_TOPPING);
                      }}
                      className="py-2 px-3 rounded-2xl bg-[#FFF5EA] hover:bg-[#FDEED9] border border-[#F7D6C8] text-[#8C5D43] text-xs font-bold font-fredoka transition-all text-center"
                    >
                      + Polos ({formatIDR(PRICE_NO_TOPPING)})
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playPop(520);
                        onSelectForCustomize(flavor.id, 'marshmallow');
                      }}
                      className="py-2 px-3 rounded-2xl bg-gradient-to-r from-[#FFB8C6] to-[#F472B6] hover:from-[#F472B6] hover:to-[#EC4899] text-white text-xs font-bold font-fredoka transition-all text-center shadow-2xs"
                    >
                      Kustom Topping ✨
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
