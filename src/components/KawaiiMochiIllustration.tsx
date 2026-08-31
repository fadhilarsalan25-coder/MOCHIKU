import React, { useState } from 'react';
import { FlavorId, ToppingId } from '../types';
import { FLAVORS } from '../data/mochiData';
import { soundFX } from '../utils/audio';

interface KawaiiMochiIllustrationProps {
  flavorId: FlavorId;
  toppingId: ToppingId;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
  onSquish?: () => void;
  className?: string;
}

export const KawaiiMochiIllustration: React.FC<KawaiiMochiIllustrationProps> = ({
  flavorId,
  toppingId,
  size = 'md',
  interactive = true,
  onSquish,
  className = '',
}) => {
  const [isSquished, setIsSquished] = useState(false);
  const [expression, setExpression] = useState<'happy' | 'starry' | 'wink'>('happy');

  const flavor = FLAVORS[flavorId] || FLAVORS.strawberry;

  // Sizing definitions
  const dimensions = {
    sm: { width: 70, height: 60, scale: 0.5 },
    md: { width: 130, height: 110, scale: 0.9 },
    lg: { width: 180, height: 150, scale: 1.2 },
    hero: { width: 260, height: 210, scale: 1.8 },
  }[size];

  const handleMochiClick = () => {
    if (!interactive) return;
    setIsSquished(true);
    soundFX.playSquish();
    setExpression((prev) => (prev === 'happy' ? 'starry' : prev === 'starry' ? 'wink' : 'happy'));
    if (onSquish) onSquish();

    setTimeout(() => {
      setIsSquished(false);
    }, 400);
  };

  // Color mapping based on flavor
  const getMochiColors = () => {
    switch (flavorId) {
      case 'matcha':
        return {
          body: '#BBE6C5',
          bodyShadow: '#96CCA2',
          stroke: '#35593C',
          blush: '#FF94A8',
          accentDots: '#7AA884',
          shadowColor: '#2D4832',
        };
      case 'strawberry':
        return {
          body: '#FFB8C6',
          bodyShadow: '#F899AC',
          stroke: '#662232',
          blush: '#FF6584',
          accentDots: '#E5738B',
          shadowColor: '#6B1B2C',
        };
      case 'mango':
        return {
          body: '#FDE49E',
          bodyShadow: '#F7CE65',
          stroke: '#6E440D',
          blush: '#FF8878',
          accentDots: '#DE9C16',
          shadowColor: '#663B00',
        };
      case 'oreo':
        return {
          body: '#DDD8D8',
          bodyShadow: '#BDB6B7',
          stroke: '#2D282A',
          blush: '#FF85A2',
          accentDots: '#473E41',
          shadowColor: '#231E20',
        };
      case 'chocolate':
        return {
          body: '#C99E86',
          bodyShadow: '#A6745A',
          stroke: '#422216',
          blush: '#FF85A2',
          accentDots: '#633722',
          shadowColor: '#36180D',
        };
      default:
        return {
          body: '#FFB8C6',
          bodyShadow: '#F899AC',
          stroke: '#662232',
          blush: '#FF6584',
          accentDots: '#E5738B',
          shadowColor: '#6B1B2C',
        };
    }
  };

  const colors = getMochiColors();

  return (
    <div
      className={`relative flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer group' : ''
      } ${className}`}
      onClick={handleMochiClick}
      title={interactive ? 'Tap to squish me! (っ˘ڡ˘ς)' : flavor.name}
    >
      <div
        className={`transition-all duration-300 transform ${
          isSquished
            ? 'scale-x-125 scale-y-80 translate-y-2'
            : interactive
            ? 'group-hover:scale-105 group-hover:-translate-y-1'
            : ''
        }`}
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <svg
          viewBox="0 0 200 170"
          className="w-full h-full drop-shadow-md overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft inner glow gradient for mochi */}
            <linearGradient id={`mochi-grad-${flavorId}`} x1="30" y1="20" x2="170" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="30%" stopColor={colors.body} />
              <stop offset="100%" stopColor={colors.bodyShadow} />
            </linearGradient>
            
            {/* Chocolate/Sauce Drizzle Gradient */}
            <linearGradient id="choco-drizzle-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D3D27" />
              <stop offset="100%" stopColor="#3E1E12" />
            </linearGradient>
          </defs>

          {/* Ground Soft Shadow */}
          <ellipse
            cx="100"
            cy="154"
            rx={isSquished ? '86' : '72'}
            ry={isSquished ? '14' : '11'}
            fill={colors.shadowColor}
            fillOpacity="0.18"
            className="transition-all duration-300"
          />

          {/* Main Mochi Chubby Body */}
          <path
            d="M32 110 C20 60 55 28 100 28 C145 28 180 60 168 110 C160 144 135 150 100 150 C65 150 40 144 32 110 Z"
            fill={`url(#mochi-grad-${flavorId})`}
            stroke={colors.stroke}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Top light highlight sheen */}
          <path
            d="M58 48 C72 38 102 38 126 44"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />
          <circle cx="138" cy="48" r="3" fill="#FFFFFF" fillOpacity="0.7" />

          {/* Flavor Specific Patterns */}
          {flavorId === 'oreo' && (
            <g opacity="0.6">
              <circle cx="50" cy="85" r="3" fill={colors.accentDots} />
              <circle cx="65" cy="70" r="2.5" fill={colors.accentDots} />
              <circle cx="140" cy="80" r="3.5" fill={colors.accentDots} />
              <circle cx="125" cy="98" r="2" fill={colors.accentDots} />
              <circle cx="82" cy="55" r="2" fill={colors.accentDots} />
              <circle cx="115" cy="62" r="3" fill={colors.accentDots} />
              <circle cx="48" cy="115" r="2.5" fill={colors.accentDots} />
              <circle cx="152" cy="110" r="3" fill={colors.accentDots} />
            </g>
          )}

          {flavorId === 'strawberry' && (
            <g opacity="0.5">
              <ellipse cx="52" cy="78" rx="1.5" ry="2.5" fill={colors.accentDots} />
              <ellipse cx="148" cy="82" rx="1.5" ry="2.5" fill={colors.accentDots} />
              <ellipse cx="68" cy="62" rx="1.2" ry="2" fill={colors.accentDots} />
              <ellipse cx="132" cy="65" rx="1.2" ry="2" fill={colors.accentDots} />
            </g>
          )}

          {flavorId === 'matcha' && (
            <g opacity="0.55">
              <circle cx="52" cy="76" r="1.5" fill={colors.accentDots} />
              <circle cx="62" cy="62" r="1.2" fill={colors.accentDots} />
              <circle cx="145" cy="78" r="1.8" fill={colors.accentDots} />
              <circle cx="136" cy="60" r="1.3" fill={colors.accentDots} />
              <circle cx="100" cy="46" r="1.5" fill={colors.accentDots} />
            </g>
          )}

          {flavorId === 'chocolate' && (
            <path
              d="M56 50 Q75 68 86 52 Q100 72 114 52 Q128 66 144 52"
              stroke="#4E2314"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
          )}

          {/* Kawaii Face Expressions */}
          {expression === 'happy' && !isSquished && (
            <g>
              {/* Big Anime Eyes */}
              <ellipse cx="74" cy="94" rx="6" ry="9" fill={colors.stroke} />
              <ellipse cx="126" cy="94" rx="6" ry="9" fill={colors.stroke} />
              {/* Big sparkles inside eyes */}
              <circle cx="72" cy="90" r="3" fill="#FFFFFF" />
              <circle cx="124" cy="90" r="3" fill="#FFFFFF" />
              <circle cx="76.5" cy="97.5" r="1.4" fill="#FFFFFF" />
              <circle cx="128.5" cy="97.5" r="1.4" fill="#FFFFFF" />
              {/* Cute Kitty Mouth :3 */}
              <path
                d="M91 103 Q96 108 100 103 Q104 108 109 103"
                stroke={colors.stroke}
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {expression === 'starry' && !isSquished && (
            <g>
              {/* Star Eyes ✨ */}
              <path
                d="M74 86 L76 92 L82 94 L76 96 L74 102 L72 96 L66 94 L72 92 Z"
                fill="#FFB703"
                stroke={colors.stroke}
                strokeWidth="1.5"
              />
              <path
                d="M126 86 L128 92 L134 94 L128 96 L126 102 L124 96 L118 94 L124 92 Z"
                fill="#FFB703"
                stroke={colors.stroke}
                strokeWidth="1.5"
              />
              {/* Open Cute Smiling Mouth */}
              <path
                d="M92 101 Q100 115 108 101 Z"
                fill="#FF6584"
                stroke={colors.stroke}
                strokeWidth="2.5"
              />
            </g>
          )}

          {expression === 'wink' && !isSquished && (
            <g>
              {/* Left Winking Eye (Arch) */}
              <path
                d="M66 95 Q74 86 82 95"
                stroke={colors.stroke}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* Right Big Open Eye */}
              <ellipse cx="126" cy="94" rx="6" ry="9" fill={colors.stroke} />
              <circle cx="124" cy="90" r="3" fill="#FFFFFF" />
              <circle cx="128.5" cy="97.5" r="1.4" fill="#FFFFFF" />
              {/* Smile */}
              <path
                d="M93 103 Q100 110 107 103"
                stroke={colors.stroke}
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Squished Expression (> ‿ <) */}
          {isSquished && (
            <g>
              {/* Squished Eye 1 */}
              <path
                d="M66 96 L76 91 L66 86"
                stroke={colors.stroke}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Squished Eye 2 */}
              <path
                d="M134 96 L124 91 L134 86"
                stroke={colors.stroke}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Happy Open Triangle Mouth */}
              <path
                d="M92 101 Q100 114 108 101 Z"
                fill="#FF6584"
                stroke={colors.stroke}
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Rosy Kawaii Blushing Cheeks */}
          <ellipse
            cx={isSquished ? '54' : '58'}
            cy="104"
            rx={isSquished ? '11' : '9'}
            ry={isSquished ? '6' : '5'}
            fill={colors.blush}
            fillOpacity="0.75"
          />
          <ellipse
            cx={isSquished ? '146' : '142'}
            cy="104"
            rx={isSquished ? '11' : '9'}
            ry={isSquished ? '6' : '5'}
            fill={colors.blush}
            fillOpacity="0.75"
          />
          {/* Subtle blush highlight stripes */}
          <line x1="55" y1="102" x2="61" y2="106" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
          <line x1="139" y1="102" x2="145" y2="106" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />

          {/* TOPPINGS RENDERING */}

          {/* 1. MARSHMALLOW TOPPING */}
          {toppingId === 'marshmallow' && (
            <g className="transition-all duration-300">
              {/* Honey / Glaze drip on top */}
              <path
                d="M84 28 Q92 38 100 28 Q108 38 116 28"
                stroke="#FFB703"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Left Pink Marshmallow */}
              <g transform="translate(68, 8) rotate(-10)">
                <rect x="0" y="0" width="24" height="20" rx="7" fill="#FFE2EC" stroke="#5C3D2E" strokeWidth="2.5" />
                <circle cx="7" cy="8" r="1.5" fill="#5C3D2E" />
                <circle cx="17" cy="8" r="1.5" fill="#5C3D2E" />
                <ellipse cx="4" cy="11" rx="2" ry="1.2" fill="#FF85A2" />
                <ellipse cx="20" cy="11" rx="2" ry="1.2" fill="#FF85A2" />
                <path d="M10 11 Q12 13 14 11" stroke="#5C3D2E" strokeWidth="1.2" strokeLinecap="round" />
              </g>

              {/* Center White Cloud Marshmallow */}
              <g transform="translate(88, 2)">
                <rect x="0" y="0" width="26" height="22" rx="8" fill="#FFFFFF" stroke="#5C3D2E" strokeWidth="2.8" />
                <circle cx="8" cy="9" r="1.6" fill="#5C3D2E" />
                <circle cx="18" cy="9" r="1.6" fill="#5C3D2E" />
                <ellipse cx="5" cy="12" rx="2.2" ry="1.2" fill="#FF85A2" />
                <ellipse cx="21" cy="12" rx="2.2" ry="1.2" fill="#FF85A2" />
                <path d="M11 12 Q13 15 15 12" stroke="#5C3D2E" strokeWidth="1.4" strokeLinecap="round" />
              </g>

              {/* Right Yellow Marshmallow */}
              <g transform="translate(112, 10) rotate(12)">
                <rect x="0" y="0" width="22" height="19" rx="6" fill="#FFF2B2" stroke="#5C3D2E" strokeWidth="2.5" />
                <circle cx="6" cy="8" r="1.4" fill="#5C3D2E" />
                <circle cx="16" cy="8" r="1.4" fill="#5C3D2E" />
                <ellipse cx="4" cy="10" rx="1.8" ry="1" fill="#FFAA80" />
                <ellipse cx="18" cy="10" rx="1.8" ry="1" fill="#FFAA80" />
                <path d="M9 10 Q11 12 13 10" stroke="#5C3D2E" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </g>
          )}

          {/* 2. OREO TOPPING */}
          {toppingId === 'oreo' && (
            <g className="transition-all duration-300">
              {/* Big Mini Oreo Biscuit on top center */}
              <g transform="translate(80, 2) rotate(-6)">
                {/* Oreo Biscuit Base */}
                <ellipse cx="20" cy="16" rx="20" ry="12" fill="#2E282A" stroke="#1A1718" strokeWidth="2.5" />
                {/* White Vanilla Cream Layer */}
                <ellipse cx="20" cy="14" rx="18" ry="8" fill="#FFFFFF" />
                {/* Top Cookie Disk with emboss pattern */}
                <ellipse cx="20" cy="11" rx="19" ry="11" fill="#3D3538" stroke="#1A1718" strokeWidth="2.2" />
                {/* Oreo pattern dots */}
                <circle cx="14" cy="9" r="1.2" fill="#66595D" />
                <circle cx="20" cy="7" r="1.2" fill="#66595D" />
                <circle cx="26" cy="9" r="1.2" fill="#66595D" />
                <circle cx="20" cy="13" r="1.5" fill="#66595D" />
                {/* Kawaii Face on Oreo */}
                <circle cx="16" cy="11" r="1.3" fill="#FFFFFF" />
                <circle cx="24" cy="11" r="1.3" fill="#FFFFFF" />
                <ellipse cx="13" cy="12.5" rx="1.5" ry="0.8" fill="#FF85A2" />
                <ellipse cx="27" cy="12.5" rx="1.5" ry="0.8" fill="#FF85A2" />
              </g>

              {/* Oreo Crumbles sprinkled on top of mochi */}
              <rect x="62" y="24" width="7" height="6" rx="2" fill="#2E282A" transform="rotate(15 62 24)" />
              <rect x="74" y="18" width="5" height="5" rx="1.5" fill="#3D3538" transform="rotate(-20 74 18)" />
              <rect x="124" y="20" width="7" height="5" rx="2" fill="#2E282A" transform="rotate(30 124 20)" />
              <rect x="135" y="27" width="5" height="4" rx="1" fill="#3D3538" transform="rotate(-15 135 27)" />
              <circle cx="68" cy="34" r="2" fill="#2E282A" />
              <circle cx="128" cy="32" r="2.2" fill="#2E282A" />
            </g>
          )}

          {/* 3. BISCUIT / COOKIE TOPPING */}
          {toppingId === 'biscuit' && (
            <g className="transition-all duration-300">
              {/* Cute Butter Cookie on top */}
              <g transform="translate(82, 4) rotate(8)">
                {/* Waffle / Biscuit body */}
                <rect x="0" y="0" width="34" height="24" rx="5" fill="#E6A85C" stroke="#7A4918" strokeWidth="2.5" />
                {/* Biscuit indent pattern dots */}
                <circle cx="7" cy="6" r="1.5" fill="#B3782E" />
                <circle cx="17" cy="6" r="1.5" fill="#B3782E" />
                <circle cx="27" cy="6" r="1.5" fill="#B3782E" />
                <circle cx="7" cy="17" r="1.5" fill="#B3782E" />
                <circle cx="17" cy="17" r="1.5" fill="#B3782E" />
                <circle cx="27" cy="17" r="1.5" fill="#B3782E" />
                {/* Butter Pat on cookie */}
                <rect x="13" y="8" width="8" height="7" rx="2" fill="#FFF385" stroke="#D1A721" strokeWidth="1.2" />
                {/* Cute smile on biscuit */}
                <circle cx="10" cy="12" r="1.2" fill="#7A4918" />
                <circle cx="24" cy="12" r="1.2" fill="#7A4918" />
                <ellipse cx="7" cy="13" rx="1.5" ry="0.8" fill="#FF85A2" />
                <ellipse cx="27" cy="13" rx="1.5" ry="0.8" fill="#FF85A2" />
              </g>

              {/* Golden Biscuit Crumb sprinkle */}
              <polygon points="62,24 66,21 68,26" fill="#E6A85C" />
              <polygon points="126,22 130,19 132,25" fill="#F0BA6F" />
              <circle cx="70" cy="30" r="2.2" fill="#E6A85C" />
              <circle cx="122" cy="30" r="2" fill="#C48535" />
              <circle cx="134" cy="28" r="1.5" fill="#E6A85C" />
            </g>
          )}

          {/* 4. ORIGINAL (NO TOPPING) - Delicate Sparkle Sugar Dust */}
          {toppingId === 'none' && (
            <g className="transition-all duration-300">
              <path
                d="M95 18 L97 22 L101 24 L97 26 L95 30 L93 26 L89 24 L93 22 Z"
                fill="#FFF9E6"
                stroke="#E5BA5A"
                strokeWidth="1"
              />
              <circle cx="80" cy="24" r="1.5" fill="#FFFFFF" />
              <circle cx="114" cy="22" r="1.8" fill="#FFFFFF" />
              <circle cx="106" cy="32" r="1.2" fill="#FFFFFF" />
            </g>
          )}
        </svg>

        {/* Squish Hearts & Sparkles FX on interaction */}
        {isSquished && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none animate-bounce">
            <span className="text-pink-500 text-lg">💖</span>
            <span className="text-amber-400 text-sm">✨</span>
            <span className="text-rose-400 text-base">🌸</span>
          </div>
        )}
      </div>
    </div>
  );
};
