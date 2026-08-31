import { FlavorId, FlavorInfo, PresetBundle, ToppingId, ToppingInfo } from '../types';

export const PRICE_NO_TOPPING = 2000;
export const PRICE_WITH_TOPPING = 5000;

export const formatIDR = (amount: number): string => {
  return 'Rp ' + amount.toLocaleString('id-ID');
};

export const FLAVORS: Record<FlavorId, FlavorInfo> = {
  matcha: {
    id: 'matcha',
    name: 'Matcha Uji',
    japaneseName: '宇治抹茶',
    description: 'Authentic Japanese green tea with earthy richness & delicate sweetness.',
    color: '#B5E2C2',
    gradient: 'from-[#D4F2DE] via-[#B5E2C2] to-[#88C999]',
    accentColor: '#3B7A4C',
    textColor: '#274F32',
    tagline: 'Pure Zen & Serenity',
    sweetness: 3,
    chewiness: 5,
    bgPatternColor: '#E6F7ED',
    iconEmoji: '🍵',
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry Ichigo',
    japaneseName: '苺ベリー',
    description: 'Fresh Japanese strawberry essence with soft floral and sweet berry notes.',
    color: '#FFB8C6',
    gradient: 'from-[#FFE0E6] via-[#FFB8C6] to-[#F88EA4]',
    accentColor: '#C43658',
    textColor: '#8C1B37',
    tagline: 'Sweet Berry Romance',
    sweetness: 4,
    chewiness: 5,
    bgPatternColor: '#FFF0F3',
    iconEmoji: '🍓',
  },
  mango: {
    id: 'mango',
    name: 'Sunny Mango',
    japaneseName: '完熟マンゴー',
    description: 'Tropical golden mango puree enveloped in tender, pillowy rice dough.',
    color: '#FDE49E',
    gradient: 'from-[#FFF3C7] via-[#FDE49E] to-[#F8CA5B]',
    accentColor: '#C9770A',
    textColor: '#874D02',
    tagline: 'Tropical Sunshine Joy',
    sweetness: 5,
    chewiness: 4,
    bgPatternColor: '#FEF9E7',
    iconEmoji: '🥭',
  },
  oreo: {
    id: 'oreo',
    name: 'Cookies & Cream Oreo',
    japaneseName: 'クッキー＆クリーム',
    description: 'Crushed dark cocoa cookies blended with a silky sweet vanilla cream heart.',
    color: '#D1CDCE',
    gradient: 'from-[#EBE9EA] via-[#D1CDCE] to-[#999496]',
    accentColor: '#363435',
    textColor: '#1F1E1E',
    tagline: 'Crunchy Cream Delight',
    sweetness: 4,
    chewiness: 5,
    bgPatternColor: '#F5F4F5',
    iconEmoji: '🍪',
  },
  chocolate: {
    id: 'chocolate',
    name: 'Belgian Chocolate',
    japaneseName: '濃厚チョコ',
    description: 'Decadent, velvety dark & milk chocolate ganache with a melt-in-your-mouth center.',
    color: '#C49A82',
    gradient: 'from-[#E5D0C2] via-[#C49A82] to-[#8C5D43]',
    accentColor: '#5C331E',
    textColor: '#3D1E0E',
    tagline: 'Melted Cocoa Heaven',
    sweetness: 4,
    chewiness: 5,
    bgPatternColor: '#F7EFEA',
    iconEmoji: '🍫',
  },
};

export const TOPPINGS: Record<ToppingId, ToppingInfo> = {
  none: {
    id: 'none',
    name: 'Original (No Topping)',
    shortName: 'Polos / Original',
    description: 'Silky smooth, dusted with traditional fine kinako/sweet rice flour.',
    price: 0,
    color: '#FDFBF7',
    emoji: '✨',
    textureLabel: 'Silky & Elastic',
  },
  marshmallow: {
    id: 'marshmallow',
    name: 'Fluffy Marshmallow',
    shortName: 'Marshmallow',
    description: 'Soft, bouncy pastel mini marshmallows crowned with honey glaze drizzle.',
    price: 3000, // effectively makes total Rp 5000
    color: '#FFE4EE',
    emoji: '🍡',
    textureLabel: 'Ultra Cloud Fluffy',
  },
  oreo: {
    id: 'oreo',
    name: 'Oreo Crumbles',
    shortName: 'Oreo Crumbs',
    description: 'Finely crushed dark cocoa biscuit crumbs providing an irresistible crunch.',
    price: 3000,
    color: '#3B3638',
    emoji: '🍪',
    textureLabel: 'Crunchy Dark Cocoa',
  },
  biscuit: {
    id: 'biscuit',
    name: 'Butter Biscuit / Cookie',
    shortName: 'Cookie Crunch',
    description: 'Golden caramelized butter cookie dust that adds a nutty, rich biscuit crunch.',
    price: 3000,
    color: '#E8B97A',
    emoji: '🧇',
    textureLabel: 'Golden Butter Crisp',
  },
};

export const POPULAR_COMBOS: {
  title: string;
  flavorId: FlavorId;
  toppingId: ToppingId;
  badge: string;
  rating: number;
}[] = [
  {
    title: 'Matcha Cookie Crisp',
    flavorId: 'matcha',
    toppingId: 'biscuit',
    badge: 'Chef Favorite ⭐',
    rating: 4.9,
  },
  {
    title: 'Strawberry Cloud Dream',
    flavorId: 'strawberry',
    toppingId: 'marshmallow',
    badge: 'Best Seller 💖',
    rating: 5.0,
  },
  {
    title: 'Choco Oreo Overload',
    flavorId: 'chocolate',
    toppingId: 'oreo',
    badge: 'Sweet Tooth 🍫',
    rating: 4.9,
  },
  {
    title: 'Pure Sunny Mango',
    flavorId: 'mango',
    toppingId: 'none',
    badge: 'Light & Fresh 🥭',
    rating: 4.8,
  },
  {
    title: 'Oreo Double Magic',
    flavorId: 'oreo',
    toppingId: 'marshmallow',
    badge: 'Kids Love It 🎀',
    rating: 4.9,
  },
];

export const PRESET_BUNDLES: PresetBundle[] = [
  {
    id: 'trio-sweetness',
    title: 'Kawaii Trio Pack',
    subtitle: '3 Delicious Mochi Favorites',
    badge: 'Popular',
    description: '1 Matcha + 1 Strawberry Marshmallow + 1 Choco Cookie',
    items: [
      { flavorId: 'matcha', toppingId: 'none', count: 1 },
      { flavorId: 'strawberry', toppingId: 'marshmallow', count: 1 },
      { flavorId: 'chocolate', toppingId: 'biscuit', count: 1 },
    ],
    totalPieces: 3,
    discountPrice: 11000, // 2000 + 5000 + 5000 = 12000 -> 11000
    originalPrice: 12000,
    icon: '🌸',
    bgGradient: 'from-[#FFE8EE] to-[#FFF3E3]',
  },
  {
    id: 'deluxe-party-box',
    title: 'Mochiku Joy Box (6 pcs)',
    subtitle: 'All 5 Flavors + Extra Special',
    badge: 'Best Value',
    description: 'Full tasting experience with custom crunchy & fluffy toppings in a cute gift box.',
    items: [
      { flavorId: 'matcha', toppingId: 'biscuit', count: 1 },
      { flavorId: 'strawberry', toppingId: 'marshmallow', count: 1 },
      { flavorId: 'mango', toppingId: 'none', count: 1 },
      { flavorId: 'oreo', toppingId: 'oreo', count: 1 },
      { flavorId: 'chocolate', toppingId: 'marshmallow', count: 1 },
      { flavorId: 'strawberry', toppingId: 'none', count: 1 },
    ],
    totalPieces: 6,
    discountPrice: 21000, // 5000*4 + 2000*2 = 24000 -> 21000
    originalPrice: 24000,
    icon: '🎁',
    bgGradient: 'from-[#FDF0EC] via-[#FFE4E9] to-[#F0FDF4]',
  },
  {
    id: 'sweet-toppers-quad',
    title: 'Topping Lover Box (4 pcs)',
    subtitle: '4 Topped Deluxe Mochi',
    badge: 'Deluxe',
    description: '4 premium mochi with your favorite Marshmallow, Oreo, and Biscuit toppings.',
    items: [
      { flavorId: 'strawberry', toppingId: 'marshmallow', count: 1 },
      { flavorId: 'chocolate', toppingId: 'oreo', count: 1 },
      { flavorId: 'matcha', toppingId: 'biscuit', count: 1 },
      { flavorId: 'mango', toppingId: 'marshmallow', count: 1 },
    ],
    totalPieces: 4,
    discountPrice: 18000, // 5000 * 4 = 20000 -> 18000
    originalPrice: 20000,
    icon: '✨',
    bgGradient: 'from-[#FFF7D6] via-[#FFE0EC] to-[#E2F0D9]',
  },
];
