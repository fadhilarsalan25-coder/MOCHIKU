import React from 'react';
import { PRESET_BUNDLES, FLAVORS, TOPPINGS, formatIDR } from '../data/mochiData';
import { PresetBundle } from '../types';
import { soundFX } from '../utils/audio';
import { Gift, Sparkles, Plus, Check } from 'lucide-react';

interface BundleBoxesProps {
  onAddBundle: (bundle: PresetBundle) => void;
}

export const BundleBoxes: React.FC<BundleBoxesProps> = ({ onAddBundle }) => {
  return (
    <div className="bg-gradient-to-r from-[#FFF5F7] via-[#FFFDF9] to-[#FFF0F5] rounded-3xl p-6 sm:p-8 border-2 border-[#FCE7F3] shadow-md">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F5] border border-[#FBCFE8] text-xs font-semibold text-[#DB2777] mb-1.5">
            <Gift className="w-3.5 h-3.5" />
            <span>Paket Hemat & Kotak Hadiah</span>
          </div>
          <h3 className="font-fredoka text-2xl sm:text-3xl text-[#5C3D2E] font-bold">
            Mochiku Gift Box Bundles 🎁
          </h3>
        </div>
        <p className="text-xs text-[#8C5D43]">
          Sudah termasuk packaging aesthetic & pita kawaii!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRESET_BUNDLES.map((bundle) => {
          const savings = bundle.originalPrice - bundle.discountPrice;

          return (
            <div
              key={bundle.id}
              className="bg-white rounded-3xl p-5 border border-[#FCE7F3] hover:border-[#F472B6] transition-all hover:shadow-lg flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-[#DB2777] bg-[#FFF0F5] px-2.5 py-1 rounded-full border border-[#FBCFE8]">
                  {bundle.badge}
                </span>
                <span className="text-2xl">{bundle.icon}</span>
              </div>

              <div>
                <h4 className="font-fredoka text-lg font-bold text-[#5C3D2E] group-hover:text-[#DB2777] transition-colors">
                  {bundle.title}
                </h4>
                <p className="text-xs text-[#8C5D43]/90 mt-1 leading-relaxed">
                  {bundle.description}
                </p>

                {/* Bundle Item Pill tags */}
                <div className="flex flex-wrap gap-1.5 my-4">
                  {bundle.items.map((item, idx) => {
                    const flavor = FLAVORS[item.flavorId];
                    const topping = TOPPINGS[item.toppingId];
                    return (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-[#FFF9F5] text-[#5C3D2E] px-2 py-1 rounded-full border border-[#FCE7F3] flex items-center gap-1"
                      >
                        <span>{flavor.iconEmoji}</span>
                        <span>{flavor.name.split(' ')[0]}</span>
                        <span className="text-[#DB2777]">({topping.shortName.split(' ')[0]})</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="pt-3 border-t border-[#FCE7F3] flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-fredoka text-lg font-bold text-[#E11D48]">
                      {formatIDR(bundle.discountPrice)}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      {formatIDR(bundle.originalPrice)}
                    </span>
                  </div>
                  {savings > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600">
                      Hemat {formatIDR(savings)} ✨
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    soundFX.playSparkle();
                    onAddBundle(bundle);
                  }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FFB8C6] to-[#F472B6] hover:from-[#F472B6] hover:to-[#EC4899] text-white text-xs font-fredoka font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Pesan Paket</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
