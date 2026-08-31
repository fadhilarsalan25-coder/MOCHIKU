import React from 'react';

export const KawaiiBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Soft gradient aura behind */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FFE4E6]/40 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-28 w-96 h-96 bg-[#FFF0DB]/50 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-[#E8F5E9]/35 rounded-full blur-3xl" />
      <div className="absolute top-2/3 right-1/4 w-80 h-80 bg-[#FFE4EE]/35 rounded-full blur-3xl" />

      {/* 2D Cute Cartoon Mochi Characters Floating in Background */}
      
      {/* Top Left: Strawberry Mochi with Leaf */}
      <div className="absolute top-12 left-4 md:left-12 opacity-40 hover:opacity-80 transition-opacity animate-float">
        <svg width="90" height="75" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <ellipse cx="60" cy="88" rx="42" ry="8" fill="#F472B6" fillOpacity="0.2" />
          {/* Mochi Body */}
          <path
            d="M20 65 C15 35 40 18 60 18 C80 18 105 35 100 65 C95 85 80 88 60 88 C40 88 25 85 20 65 Z"
            fill="#FFB8C6"
            stroke="#5C3D2E"
            strokeWidth="3.5"
          />
          {/* Highlight */}
          <path d="M35 32 C45 25 65 25 75 30" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.8" />
          {/* Kawaii Eyes */}
          <ellipse cx="45" cy="52" rx="3.5" ry="5.5" fill="#3D1E0E" />
          <ellipse cx="75" cy="52" rx="3.5" ry="5.5" fill="#3D1E0E" />
          <circle cx="43.5" cy="49.5" r="1.8" fill="#FFFFFF" />
          <circle cx="73.5" cy="49.5" r="1.8" fill="#FFFFFF" />
          {/* Cheeks */}
          <ellipse cx="36" cy="58" rx="6" ry="3.5" fill="#FF6584" fillOpacity="0.6" />
          <ellipse cx="84" cy="58" rx="6" ry="3.5" fill="#FF6584" fillOpacity="0.6" />
          {/* Mouth */}
          <path d="M54 58 Q60 64 66 58" stroke="#3D1E0E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Strawberry Leaf on head */}
          <path d="M60 18 C56 8 48 10 52 16" fill="#78B159" stroke="#5C3D2E" strokeWidth="2" />
          <path d="M60 18 C64 6 72 8 68 16" fill="#5C9E38" stroke="#5C3D2E" strokeWidth="2" />
        </svg>
      </div>

      {/* Top Center-Right: Matcha Dango Mochi */}
      <div className="absolute top-24 right-1/4 md:right-1/3 opacity-30 animate-float-reverse hidden sm:block">
        <svg width="70" height="65" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="78" rx="36" ry="7" fill="#4E8256" fillOpacity="0.15" />
          <path
            d="M18 55 C14 30 35 15 50 15 C65 15 86 30 82 55 C78 72 68 76 50 76 C32 76 22 72 18 55 Z"
            fill="#B5E2C2"
            stroke="#3B5A40"
            strokeWidth="3"
          />
          {/* Kawaii Winking Face */}
          <path d="M36 46 Q40 42 44 46" stroke="#2D4531" strokeWidth="3" strokeLinecap="round" />
          <circle cx="64" cy="45" r="4.5" fill="#2D4531" />
          <circle cx="62.5" cy="43" r="1.5" fill="#FFFFFF" />
          {/* Blushes */}
          <ellipse cx="28" cy="52" rx="5" ry="3" fill="#FF85A2" fillOpacity="0.5" />
          <ellipse cx="72" cy="52" rx="5" ry="3" fill="#FF85A2" fillOpacity="0.5" />
          {/* Happy Mouth */}
          <path d="M47 50 Q50 56 53 50" stroke="#2D4531" strokeWidth="2" strokeLinecap="round" />
          {/* Tea leaf */}
          <path d="M50 15 C45 6 56 4 52 14" fill="#699E47" stroke="#3B5A40" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Middle Left: Golden Mango Mochi */}
      <div className="absolute top-1/2 left-3 md:left-8 opacity-35 animate-float-reverse">
        <svg width="85" height="75" viewBox="0 0 110 95" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="55" cy="84" rx="38" ry="7" fill="#D48C18" fillOpacity="0.18" />
          <path
            d="M16 60 C12 32 35 18 55 18 C75 18 98 32 94 60 C90 78 75 82 55 82 C35 82 20 78 16 60 Z"
            fill="#FDE49E"
            stroke="#8A5A1C"
            strokeWidth="3"
          />
          <ellipse cx="42" cy="48" rx="3" ry="5" fill="#573609" />
          <ellipse cx="68" cy="48" rx="3" ry="5" fill="#573609" />
          <circle cx="41" cy="46" r="1.5" fill="#FFFFFF" />
          <circle cx="67" cy="46" r="1.5" fill="#FFFFFF" />
          <ellipse cx="32" cy="54" rx="5.5" ry="3" fill="#F87171" fillOpacity="0.5" />
          <ellipse cx="78" cy="54" rx="5.5" ry="3" fill="#F87171" fillOpacity="0.5" />
          <path d="M51 54 Q55 60 59 54" stroke="#573609" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Bottom Right: Chocolate Mochi with Marshmallow crown */}
      <div className="absolute bottom-16 right-4 md:right-16 opacity-40 animate-float">
        <svg width="95" height="85" viewBox="0 0 120 105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="60" cy="92" rx="42" ry="8" fill="#3E2723" fillOpacity="0.2" />
          {/* Mochi Body */}
          <path
            d="M20 70 C15 40 40 24 60 24 C80 24 105 40 100 70 C95 90 80 92 60 92 C40 92 25 90 20 70 Z"
            fill="#C49A82"
            stroke="#4A2E2B"
            strokeWidth="3.5"
          />
          {/* Chocolate drizzle */}
          <path
            d="M32 38 Q42 48 48 36 Q56 50 64 36 Q72 46 86 38"
            stroke="#5C331E"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Kawaii Face */}
          <circle cx="46" cy="60" r="4" fill="#3D1E0E" />
          <circle cx="74" cy="60" r="4" fill="#3D1E0E" />
          <circle cx="44.5" cy="58" r="1.5" fill="#FFFFFF" />
          <circle cx="72.5" cy="58" r="1.5" fill="#FFFFFF" />
          <ellipse cx="36" cy="66" rx="5.5" ry="3" fill="#FF85A2" fillOpacity="0.6" />
          <ellipse cx="84" cy="66" rx="5.5" ry="3" fill="#FF85A2" fillOpacity="0.6" />
          <path d="M56 65 Q60 70 64 65" stroke="#3D1E0E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Mini Marshmallow Topping */}
          <rect x="52" y="14" width="16" height="14" rx="4" fill="#FFF0F5" stroke="#4A2E2B" strokeWidth="2" />
          <circle cx="56" cy="20" r="1" fill="#4A2E2B" />
          <circle cx="62" cy="20" r="1" fill="#4A2E2B" />
          <ellipse cx="54" cy="22" rx="1.5" ry="1" fill="#F472B6" />
          <ellipse cx="64" cy="22" rx="1.5" ry="1" fill="#F472B6" />
        </svg>
      </div>

      {/* Floating Sakura & Sparkles */}
      <div className="absolute top-1/4 left-1/3 text-pink-300 text-sm opacity-50 animate-bounce" style={{ animationDuration: '6s' }}>🌸</div>
      <div className="absolute top-2/3 left-1/5 text-pink-300 text-lg opacity-45 animate-pulse" style={{ animationDuration: '4s' }}>✨</div>
      <div className="absolute top-1/5 right-1/6 text-amber-300 text-base opacity-50 animate-bounce" style={{ animationDuration: '7s' }}>⭐</div>
      <div className="absolute bottom-1/3 right-1/3 text-pink-200 text-xl opacity-40 animate-float">🍡</div>
      <div className="absolute bottom-28 left-1/2 text-rose-300 text-sm opacity-50 animate-pulse">🍓</div>
      <div className="absolute top-3/4 left-8 text-pink-300 text-sm opacity-40">🌸</div>
    </div>
  );
};
