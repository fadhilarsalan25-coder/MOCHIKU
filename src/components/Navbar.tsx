import React from 'react';
import { ShoppingBag, Volume2, VolumeX, Sparkles, Heart, User, LogIn, UserPlus } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { UserAccount } from '../types';

interface NavbarProps {
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenInfo?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: (mode: 'signup' | 'signin') => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItemCount,
  onOpenCart,
  soundEnabled,
  onToggleSound,
  currentUser,
  onOpenAuth,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#FCE7F3] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        
        {/* Left Side: Brand Logo & Status badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <h1 className="font-pacifico text-2xl sm:text-3xl tracking-wide select-none drop-shadow-xs flex items-center">
              <span className="text-[#FF85A2] hover:text-[#FF6584] transition-colors">MOCHI</span>
              <span className="text-[#F5DEB3] hover:text-[#E8CD9B] bg-[#5C3D2E] px-1.5 py-0.5 rounded-lg ml-0.5 text-lg sm:text-xl shadow-inner inline-block -rotate-2">
                KU
              </span>
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF0F5] border border-[#FBCFE8] text-xs font-semibold text-[#8B4513] shadow-2xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="hidden md:inline">Freshly Handcrafted Daily</span>
            <span className="md:hidden">Open</span>
          </div>

          {/* Quick Map Link */}
          <button
            onClick={() => {
              const mapEl = document.getElementById('mochiku-map-locator');
              if (mapEl) {
                mapEl.scrollIntoView({ behavior: 'smooth' });
                soundFX.playPop(480);
              }
            }}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF0F5] hover:bg-[#FFE4EE] border border-[#FBCFE8] text-xs font-semibold text-[#DB2777] shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <span>📍 Outlet GPS</span>
          </button>
        </div>

        {/* Right Side: Account Actions (Sign Up / Get Started, Profile), Audio toggle & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* USER ACCOUNT SECTION */}
          {currentUser ? (
            /* Logged in member badge */
            <button
              onClick={() => {
                soundFX.playPop(520);
                onOpenProfile();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-[#FFF0F5] border border-[#FBCFE8] shadow-2xs transition-all active:scale-95 cursor-pointer group"
              title="Buka Profil Member Mochi Club"
            >
              {currentUser.pictureUrl ? (
                <img
                  src={currentUser.pictureUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-[#F472B6] shadow-2xs shrink-0"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-[#FFE4EC] text-sm flex items-center justify-center border border-[#F472B6] shrink-0">
                  {currentUser.avatarEmoji || '🍓'}
                </span>
              )}
              <div className="text-left hidden xs:block">
                <span className="text-xs font-fredoka font-bold text-[#5C3D2E] block truncate max-w-[90px] sm:max-w-[130px] leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#DB2777] font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  {currentUser.points} Pts
                </span>
              </div>
            </button>
          ) : (
            /* Guest auth buttons: Sign In & Sign Up / Get Started */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  soundFX.playPop(480);
                  onOpenAuth('signin');
                }}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-fredoka font-bold text-[#8C5D43] hover:text-[#5C3D2E] hover:bg-[#FFF5EA] transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>

              {/* PRIMARY GET STARTED / SIGN UP BUTTON */}
              <button
                id="navbar-signup-btn"
                onClick={() => {
                  soundFX.playPop(550);
                  onOpenAuth('signup');
                }}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#FF85A2] via-[#F472B6] to-[#EC4899] hover:from-[#F472B6] hover:to-[#DB2777] text-white font-fredoka font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer group"
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Get Started</span>
                <span className="hidden sm:inline text-[11px] bg-white/20 px-1.5 py-0.2 rounded-full">
                  +50 Pts
                </span>
              </button>
            </div>
          )}

          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              onToggleSound();
              soundFX.playPop(600);
            }}
            className="p-2 rounded-full bg-[#FFF5EA] hover:bg-[#FFE8EE] text-[#8C5D43] transition-all border border-[#F7D6C8] shadow-2xs active:scale-95 cursor-pointer"
            title={soundEnabled ? 'Mute cute sounds' : 'Enable cute sounds'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#F472B6]" /> : <VolumeX className="w-4 h-4 text-[#A8A29E]" />}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => {
              soundFX.playPop(520);
              onOpenCart();
            }}
            className="relative flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#FFB8C6] to-[#F472B6] hover:from-[#F472B6] hover:to-[#EC4899] text-white font-fredoka font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 group cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 transition-transform group-hover:-rotate-12" />
            <span className="hidden xs:inline">Keranjang</span>
            
            {cartItemCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-bold bg-[#FFFDF9] text-[#E11D48] rounded-full shadow-inner animate-pulse">
                {cartItemCount}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};

