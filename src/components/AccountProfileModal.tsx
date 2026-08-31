import React, { useState } from 'react';
import { UserAccount, FlavorId } from '../types';
import { FLAVORS } from '../data/mochiData';
import { soundFX } from '../utils/audio';
import { GoogleIcon } from './AuthModal';
import confetti from 'canvas-confetti';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Gift,
  Award,
  LogOut,
  Check,
  Heart,
  Star,
  Edit2,
  Save,
  Tag,
  ShieldCheck,
} from 'lucide-react';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onUpdateUser: (updated: UserAccount) => void;
  onLogout: () => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.defaultAddress || '');
  const [favoriteFlavor, setFavoriteFlavor] = useState<FlavorId>(user?.favoriteFlavor || 'strawberry');
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState('');

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setAddress(user.defaultAddress || '');
      setFavoriteFlavor(user.favoriteFlavor || 'strawberry');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playSuccess();
    const updated: UserAccount = {
      ...user,
      name,
      phone,
      defaultAddress: address,
      favoriteFlavor,
      avatarEmoji: favoriteFlavor === 'matcha' ? '🍵' : favoriteFlavor === 'mango' ? '🥭' : favoriteFlavor === 'oreo' ? '🍪' : favoriteFlavor === 'chocolate' ? '🍫' : '🍓',
    };
    onUpdateUser(updated);
    setIsEditing(false);
  };

  const handleRedeemPoints = (cost: number, perkName: string) => {
    if (user.points < cost) {
      soundFX.playPop(300);
      setRedeemSuccessMsg(`Poin Anda belum cukup untuk ${perkName} (Butuh ${cost} Pts)`);
      setTimeout(() => setRedeemSuccessMsg(''), 3000);
      return;
    }

    soundFX.playSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFB8C6', '#F472B6', '#FDE49E'],
      });
    } catch {
      // ignore
    }

    const updated: UserAccount = {
      ...user,
      points: user.points - cost,
    };
    onUpdateUser(updated);
    setRedeemSuccessMsg(`🎉 Berhasil menukar ${cost} Pts untuk ${perkName}! Kode Voucher: MOCHI-${Math.floor(1000 + Math.random() * 9000)}`);
    setTimeout(() => setRedeemSuccessMsg(''), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3E2723]/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full border-2 border-[#FCE7F3] shadow-2xl overflow-hidden relative">
        
        {/* Top Header with Avatar */}
        <div className="p-6 bg-gradient-to-br from-[#FFF0F5] via-[#FFF5EA] to-[#FFE4EC] border-b border-[#FCE7F3] relative">
          <button
            onClick={() => {
              soundFX.playPop(400);
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#8C5D43] transition-colors border border-[#FCE7F3] shadow-2xs cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            {user.pictureUrl ? (
              <img
                src={user.pictureUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-3xl object-cover border-2 border-[#F472B6] shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-3xl bg-white border-2 border-[#F472B6] shadow-md flex items-center justify-center text-3xl shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>
                {user.avatarEmoji || '🍓'}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFD1DC] text-[#9D174D] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {user.memberTier}
                </span>
                <span className="text-[11px] text-[#8C5D43]/80">Member sejak {user.joinedDate}</span>
              </div>
              
              <h3 className="font-fredoka text-xl sm:text-2xl font-bold text-[#5C3D2E] truncate mt-0.5">
                {user.name}
              </h3>
              
              <p className="text-xs text-[#8C5D43] truncate flex items-center gap-1.5 mt-0.5">
                {user.authProvider === 'google' && (
                  <span className="inline-flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-[10px] font-bold text-slate-700 shrink-0 shadow-2xs">
                    <GoogleIcon className="w-3 h-3" />
                    <span>Google</span>
                  </span>
                )}
                <span className="truncate">{user.email}</span>
              </p>
            </div>
          </div>

          {/* Points Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-[#FBCFE8] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FFF0F5] text-[#DB2777]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C5D43] block">Mochi Points Wallet</span>
                <span className="font-fredoka text-lg font-bold text-[#E11D48]">{user.points} Poin</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-[#3B7A4C] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✨ Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto space-y-5">
          
          {redeemSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{redeemSuccessMsg}</span>
            </div>
          )}

          {/* Points Redemption Options */}
          <div>
            <h4 className="text-xs font-fredoka font-bold text-[#5C3D2E] flex items-center gap-1.5 mb-2.5">
              <Gift className="w-4 h-4 text-[#F472B6]" />
              <span>Tukar Mochi Points:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#FFF9F5] border border-[#FCE7F3] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5C3D2E]">Topping Gratis</span>
                    <span className="text-[11px] font-bold text-[#DB2777] bg-pink-100 px-2 py-0.5 rounded-full">25 Pts</span>
                  </div>
                  <p className="text-[11px] text-[#8C5D43]/80 mt-1">
                    Free Marshmallow / Oreo / Regal pada pesanan berikutnya.
                  </p>
                </div>
                <button
                  onClick={() => handleRedeemPoints(25, 'Topping Gratis')}
                  disabled={user.points < 25}
                  className="mt-2.5 w-full py-1.5 rounded-xl bg-gradient-to-r from-[#FFB8C6] to-[#F472B6] hover:from-[#F472B6] hover:to-[#EC4899] disabled:opacity-40 text-white font-fredoka font-bold text-[11px] transition-all cursor-pointer"
                >
                  Tukar 25 Pts
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#FFF9F5] border border-[#FCE7F3] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5C3D2E]">Diskon Rp 10.000</span>
                    <span className="text-[11px] font-bold text-[#DB2777] bg-pink-100 px-2 py-0.5 rounded-full">50 Pts</span>
                  </div>
                  <p className="text-[11px] text-[#8C5D43]/80 mt-1">
                    Potongan harga langsung untuk semua box & mochi bundle.
                  </p>
                </div>
                <button
                  onClick={() => handleRedeemPoints(50, 'Diskon Rp 10.000')}
                  disabled={user.points < 50}
                  className="mt-2.5 w-full py-1.5 rounded-xl bg-gradient-to-r from-[#FFB8C6] to-[#F472B6] hover:from-[#F472B6] hover:to-[#EC4899] disabled:opacity-40 text-white font-fredoka font-bold text-[11px] transition-all cursor-pointer"
                >
                  Tukar 50 Pts
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details & Edit Section */}
          <div className="pt-3 border-t border-[#FCE7F3]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-fredoka font-bold text-[#5C3D2E] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#F472B6]" />
                <span>Informasi & Alamat Default</span>
              </h4>
              
              {!isEditing && (
                <button
                  onClick={() => {
                    soundFX.playPop(500);
                    setIsEditing(true);
                  }}
                  className="text-xs font-bold text-[#DB2777] hover:text-[#BE185D] flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Ubah</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#5C3D2E] block mb-1">Nama Lengkap:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#F0E6DF] focus:border-[#F472B6] text-xs text-[#5C3D2E] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#5C3D2E] block mb-1">No. WhatsApp / HP:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#F0E6DF] focus:border-[#F472B6] text-xs text-[#5C3D2E] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#5C3D2E] block mb-1">Alamat Lengkap Pengiriman:</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#F0E6DF] focus:border-[#F472B6] text-xs text-[#5C3D2E] outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#F472B6] hover:bg-[#EC4899] text-white font-fredoka font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6DF] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#5C3D2E]">
                  <Phone className="w-3.5 h-3.5 text-[#F472B6] shrink-0" />
                  <span>{user.phone || 'Belum ditambahkan'}</span>
                </div>
                <div className="flex items-start gap-2 text-[#5C3D2E]">
                  <MapPin className="w-3.5 h-3.5 text-[#F472B6] shrink-0 mt-0.5" />
                  <span>{user.defaultAddress || 'Belum ada alamat pengiriman default'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#5C3D2E] pt-1">
                  <Heart className="w-3.5 h-3.5 text-[#F472B6] shrink-0" />
                  <span>Mochi Favorit: <strong>{FLAVORS[user.favoriteFlavor || 'strawberry']?.name}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Member Exclusive Benefits */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FFF8E7] to-[#FFF0F5] border border-[#FDE68A] text-xs text-[#854D0E] space-y-1.5">
            <span className="font-bold flex items-center gap-1.5 text-[#78350F]">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Keuntungan Member Aktif:
            </span>
            <ul className="space-y-1 pl-4 list-disc text-[11px] text-[#8C5D43]">
              <li>Auto-fill data pengiriman instan saat checkout</li>
              <li>Mendapatkan 5 Mochi Points setiap pesanan Rp 10.000</li>
              <li>Prioritas antrean pesanan & kurir pengiriman cepat</li>
            </ul>
          </div>

          {/* Logout Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                soundFX.playPop(420);
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-fredoka font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun (Log Out)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
