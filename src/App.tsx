import React, { useState, useEffect } from 'react';
import { CartItem, FlavorId, PresetBundle, ToppingId, OrderRecord, StoreLocation, UserAccount } from './types';
import { FLAVORS, TOPPINGS, PRICE_NO_TOPPING, PRICE_WITH_TOPPING, formatIDR } from './data/mochiData';
import { KawaiiBackground } from './components/KawaiiBackground';
import { Navbar } from './components/Navbar';
import { MochiCustomizer } from './components/MochiCustomizer';
import { FlavorCatalog } from './components/FlavorCatalog';
import { BundleBoxes } from './components/BundleBoxes';
import { GoogleMapsSection } from './components/GoogleMapsSection';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AuthModal } from './components/AuthModal';
import { AccountProfileModal } from './components/AccountProfileModal';
import { useRealtimeLocation } from './hooks/useRealtimeLocation';
import { soundFX } from './utils/audio';
import { auth, logoutFirebaseAuth, formatFirebaseUser } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Sparkles, Heart, Gift, ShoppingBag, Star, ShieldCheck, Flame, Info, UserPlus, UserCheck, ArrowRight } from 'lucide-react';

export default function App() {
  // Real-time GPS location hook
  const { location, getCurrentLocation, setManualLocation } = useRealtimeLocation();

  // User Account state persisted in localStorage
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('mochiku_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  // Auth & Profile Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Cart state persisted to localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mochiku_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default pleasant initial cart item
    return [
      {
        id: 'init-1',
        flavorId: 'strawberry',
        toppingId: 'marshmallow',
        quantity: 2,
        unitPrice: PRICE_WITH_TOPPING,
        customNote: 'Extra dingin & fluffy',
      },
    ];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // If logged in via Firebase Auth, update currentUser
        setCurrentUser((prev) => {
          if (prev && prev.id === fbUser.uid) {
            return {
              ...prev,
              email: fbUser.email || prev.email,
              name: fbUser.displayName || prev.name,
            };
          }
          return formatFirebaseUser(fbUser, prev || undefined);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('mochiku_user', JSON.stringify(currentUser));
        // Also save to accounts store
        const existingRaw = localStorage.getItem('mochiku_accounts_store');
        let accounts: UserAccount[] = existingRaw ? JSON.parse(existingRaw) : [];
        const idx = accounts.findIndex((a) => a.id === currentUser.id);
        if (idx >= 0) {
          accounts[idx] = currentUser;
        } else {
          accounts.push(currentUser);
        }
        localStorage.setItem('mochiku_accounts_store', JSON.stringify(accounts));
      } else {
        localStorage.removeItem('mochiku_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mochiku_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  const handleOpenAuth = (mode: 'signup' | 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutFirebaseAuth();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setIsProfileOpen(false);
  };

  const handleUpdateUser = (updated: UserAccount) => {
    setCurrentUser(updated);
  };

  // Add customized mochi to cart
  const handleAddToCart = (item: {
    flavorId: FlavorId;
    toppingId: ToppingId;
    quantity: number;
    unitPrice: number;
    customNote?: string;
  }) => {
    setCartItems((prev) => {
      // Check if identical item exists
      const existingIdx = prev.findIndex(
        (i) => i.flavorId === item.flavorId && i.toppingId === item.toppingId && i.customNote === item.customNote && !i.bundleTitle
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          ...item,
        };
        return [...prev, newItem];
      }
    });
  };

  // Quick add from catalog
  const handleQuickAdd = (flavorId: FlavorId, toppingId: ToppingId, price: number) => {
    handleAddToCart({
      flavorId,
      toppingId,
      quantity: 1,
      unitPrice: price,
    });
  };

  // Add preset gift bundle
  const handleAddBundle = (bundle: PresetBundle) => {
    setCartItems((prev) => [
      ...prev,
      {
        id: 'bundle-' + Date.now(),
        flavorId: bundle.items[0].flavorId,
        toppingId: bundle.items[0].toppingId,
        quantity: 1,
        unitPrice: bundle.discountPrice,
        bundleTitle: bundle.title,
        customNote: bundle.description,
      },
    ]);
    setIsCartOpen(true);
  };

  // Update item quantity
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle sound
  const handleToggleSound = () => {
    const nextState = soundFX.toggleSound();
    setSoundEnabled(nextState);
  };

  // Jump to customizer with preselected flavor & topping
  const handleSelectForCustomize = (flavorId: FlavorId, toppingId: ToppingId) => {
    const customizerEl = document.getElementById('mochi-studio');
    if (customizerEl) {
      customizerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen relative flex flex-col bg-[#FFF9F5] text-[#5C3D2E] selection:bg-[#FFD1DC]">
      
      {/* 2D Cute Cartoon Kawaii Mochi Background Elements */}
      <KawaiiBackground />

      {/* Navigation Header with Top Right "MOCHIKU" in Pacifico font & Auth */}
      <Navbar
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        
        {/* HERO SECTION: Sweet Kawaii Welcome & Price Banner */}
        <section className="text-center py-6 sm:py-8 max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F5] border border-[#FBCFE8] text-xs sm:text-sm font-semibold text-[#DB2777] mb-4 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#F472B6] animate-spin" style={{ animationDuration: '6s' }} />
            <span>Kenyal, Manis, & Otentik Khas Jepang</span>
            <Heart className="w-3.5 h-3.5 fill-[#DB2777]" />
          </div>

          <h2 className="font-fredoka text-3xl sm:text-5xl font-bold text-[#5C3D2E] tracking-tight leading-tight">
            Sensasi Mochi Jepang <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F472B6] via-[#FF85A2] to-[#8C5D43]">
              Lembut & Topping Melimpah
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#8C5D43]/90 mt-3 max-w-xl mx-auto leading-relaxed">
            Dibuat fresh setiap hari dengan tepung ketan premium. Tersedia 5 varian rasa legendaris dengan pilihan topping renyah dan empuk!
          </p>

          {/* Transparent IDR Price Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-[#B5E2C2] shadow-xs flex items-center gap-2">
              <span className="text-xl">🍵</span>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-[#3B7A4C] block">Mochi Polos</span>
                <span className="font-fredoka text-base font-bold text-[#5C3D2E]">{formatIDR(PRICE_NO_TOPPING)}</span>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-[#FBCFE8] shadow-xs flex items-center gap-2">
              <span className="text-xl">🍡</span>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-[#DB2777] block">Mochi + Topping</span>
                <span className="font-fredoka text-base font-bold text-[#E11D48]">{formatIDR(PRICE_WITH_TOPPING)}</span>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#FFF8E7] border-2 border-[#FDE68A] text-xs font-semibold text-[#854D0E] flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
              <span>Marshmallow • Oreo • Biscuit</span>
            </div>
          </div>

          {/* HERO ACTION BUTTONS: Kustom Mochi & Sign Up / Get Started CTA */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                soundFX.playPop(500);
                const customizerEl = document.getElementById('mochi-studio');
                if (customizerEl) {
                  customizerEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#FF85A2] via-[#F472B6] to-[#EC4899] hover:from-[#F472B6] hover:to-[#DB2777] text-white font-fredoka font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>🍡 Racik Mochi Sendiri</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  soundFX.playPop(520);
                  setIsProfileOpen(true);
                }}
                className="px-5 py-3.5 rounded-full bg-white hover:bg-[#FFF0F5] border-2 border-[#FBCFE8] text-[#DB2777] font-fredoka font-bold text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>{currentUser.avatarEmoji || '🍓'}</span>
                <span>Member Hub: {currentUser.name}</span>
                <span className="text-xs bg-pink-100 text-[#9D174D] px-2 py-0.5 rounded-full font-bold">
                  {currentUser.points} Pts
                </span>
              </button>
            ) : (
              <button
                id="hero-signup-getstarted-btn"
                onClick={() => {
                  soundFX.playPop(550);
                  handleOpenAuth('signup');
                }}
                className="px-5 py-3.5 rounded-full bg-[#FFF0F5] hover:bg-[#FFE4EE] border-2 border-[#FBCFE8] text-[#DB2777] font-fredoka font-bold text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-2 group"
              >
                <UserPlus className="w-4 h-4 text-[#F472B6] group-hover:scale-110 transition-transform" />
                <span>Sign Up / Get Started</span>
                <span className="text-xs bg-[#FFD1DC] text-[#9D174D] px-2 py-0.5 rounded-full font-bold">
                  🎁 +50 Pts
                </span>
              </button>
            )}
          </div>

        </section>

        {/* SECTION 1: INTERACTIVE MOCHI STUDIO (BUILDER & SQUISH PHYSICS) */}
        <section id="mochi-studio" className="scroll-mt-20">
          <MochiCustomizer
            onAddToCart={(item) => {
              handleAddToCart(item);
            }}
          />
        </section>

        {/* SECTION 2: GIFT BOX & PARTY BUNDLES */}
        <section>
          <BundleBoxes onAddBundle={handleAddBundle} />
        </section>

        {/* SECTION 3: FLAVOR CATALOG & TRENDING COMBOS */}
        <section>
          <FlavorCatalog
            onSelectForCustomize={handleSelectForCustomize}
            onQuickAdd={handleQuickAdd}
          />
        </section>

        {/* SECTION 4: REAL-TIME GOOGLE MAPS STORE LOCATOR & LIVE DELIVERY TRACKER */}
        <section>
          <GoogleMapsSection
            userLocation={location}
            onRefreshLocation={getCurrentLocation}
            onSelectCitySimulation={setManualLocation}
            onSelectStoreForOrder={(store) => {
              // Open cart or scroll to customizer
              setIsCartOpen(true);
            }}
          />
        </section>

        {/* SECTION 5: KAWAII QUALITY PROMISES */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xs border border-[#FCE7F3] flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-[#FFF0F5] text-[#DB2777] text-2xl">
              🌸
            </div>
            <div>
              <h4 className="font-fredoka text-sm font-bold text-[#5C3D2E]">100% Halal & Higienis</h4>
              <p className="text-xs text-[#8C5D43]/80 mt-0.5">
                Menggunakan bahan baku alami tanpa pemanis buatan maupun pengawet.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xs border border-[#FCE7F3] flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-[#FFF8E7] text-[#854D0E] text-2xl">
              ❄️
            </div>
            <div>
              <h4 className="font-fredoka text-sm font-bold text-[#5C3D2E]">Kemasan Chilled Ice</h4>
              <p className="text-xs text-[#8C5D43]/80 mt-0.5">
                Dikemas rapi dengan ice gel pack agar tetap kenyal & dingin sampai tujuan.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xs border border-[#FCE7F3] flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-[#E8F8EE] text-[#065F46] text-2xl">
              ⚡
            </div>
            <div>
              <h4 className="font-fredoka text-sm font-bold text-[#5C3D2E]">Pengiriman Instan</h4>
              <p className="text-xs text-[#8C5D43]/80 mt-0.5">
                Pesan sekarang, dikirim fresh dalam hitungan menit lewat kurir instan / pickup.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-[#FCE7F3] bg-[#FFFDF9]/90 relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex items-center gap-2">
            <span className="font-pacifico text-2xl text-[#FF85A2]">MOCHIKU</span>
            <span className="text-xs text-[#8C5D43]/80">
              • Japanese Kawaii Mochi Artisanal Treats
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#8C5D43]">
            <span>Matcha</span>
            <span>•</span>
            <span>Strawberry</span>
            <span>•</span>
            <span>Mango</span>
            <span>•</span>
            <span>Oreo</span>
            <span>•</span>
            <span>Chocolate</span>
          </div>

          <p className="text-xs text-[#8C5D43]/70">
            © {new Date().getFullYear()} MOCHIKU. Made with love & sweetness 💖
          </p>

        </div>
      </footer>

      {/* Floating Bottom Cart Bar for Mobile */}
      {totalCartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => {
              soundFX.playPop(520);
              setIsCartOpen(true);
            }}
            className="w-full py-3.5 px-5 rounded-full bg-gradient-to-r from-[#FF94A8] via-[#F472B6] to-[#EC4899] text-white font-fredoka font-bold text-sm shadow-xl flex items-center justify-between active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{totalCartCount} Mochi di Keranjang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Lihat Pesanan</span>
              <span>→</span>
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        userLocation={location}
        currentUser={currentUser}
        onOrderComplete={(order) => {
          setIsCheckoutOpen(false);
          setLastOrder(order);
          setCartItems([]); // clear cart on success

          // Award Mochi Points to user if logged in
          if (currentUser) {
            const earnedPoints = Math.max(1, Math.round(order.total / 1000));
            setCurrentUser((prev) =>
              prev
                ? {
                    ...prev,
                    points: prev.points + earnedPoints,
                  }
                : null
            );
          }
        }}
      />

      {/* Order Success Receipt Modal */}
      <OrderSuccessModal
        order={lastOrder}
        onClose={() => setLastOrder(null)}
        onNewOrder={() => {
          setLastOrder(null);
          const customizerEl = document.getElementById('mochi-studio');
          if (customizerEl) {
            customizerEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Sign Up / Sign In / Get Started Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Account Profile & Rewards Modal */}
      <AccountProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
      />

    </div>
  );
}
