export type FlavorId = 'matcha' | 'strawberry' | 'mango' | 'oreo' | 'chocolate';

export type ToppingId = 'none' | 'marshmallow' | 'oreo' | 'biscuit';

export interface FlavorInfo {
  id: FlavorId;
  name: string;
  japaneseName: string;
  description: string;
  color: string;
  gradient: string;
  accentColor: string;
  textColor: string;
  tagline: string;
  sweetness: number; // 1-5
  chewiness: number; // 1-5
  bgPatternColor: string;
  iconEmoji: string;
}

export interface ToppingInfo {
  id: ToppingId;
  name: string;
  shortName: string;
  description: string;
  price: number; // Rp 0 if none, Rp 3000 added or flat 5000
  color: string;
  emoji: string;
  textureLabel: string;
}

export interface CustomMochi {
  id: string;
  flavorId: FlavorId;
  toppingId: ToppingId;
  quantity: number;
  unitPrice: number; // 2000 or 5000
  customNote?: string;
  isGiftBox?: boolean;
}

export interface CartItem {
  id: string;
  flavorId: FlavorId;
  toppingId: ToppingId;
  quantity: number;
  unitPrice: number;
  customNote?: string;
  bundleTitle?: string;
}

export interface PresetBundle {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  items: { flavorId: FlavorId; toppingId: ToppingId; count: number }[];
  totalPieces: number;
  discountPrice: number;
  originalPrice: number;
  icon: string;
  bgGradient: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  defaultAddress?: string;
  favoriteFlavor?: FlavorId;
  points: number;
  memberTier: 'Kawaii Bronze' | 'Silver (Mochi Lover)' | 'Gold (VIP Mochi Master)';
  avatarEmoji: string;
  pictureUrl?: string;
  authProvider?: 'google' | 'email';
  joinedDate: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  orderType: 'delivery' | 'pickup';
  paymentMethod: 'qris' | 'gopay' | 'ovo' | 'shopeepay' | 'cash';
  notes?: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  openHours: string;
  status: 'open' | 'busy' | 'closed';
  isFlagship?: boolean;
  rating: number;
  reviewCount: number;
  deliveryRadiusKm: number;
}

export interface UserLocationState {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  addressName?: string;
  isTracking: boolean;
  error?: string;
  loading: boolean;
}

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  packagingFee: number;
  total: number;
  status: 'confirmed' | 'preparing' | 'ready';
}
