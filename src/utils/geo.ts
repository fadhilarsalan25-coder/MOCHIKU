import { StoreLocation } from '../types';

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance nicely (e.g. 850 m or 3.4 km)
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} meter`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Calculates estimated instant delivery time based on distance
 */
export function estimateDeliveryMinutes(km: number): { minTime: number; maxTime: number; label: string } {
  // Prep time: 10 mins, Travel: approx 3 mins per km
  const basePrep = 10;
  const travelMin = Math.round(km * 2.5);
  const minTime = Math.max(15, basePrep + travelMin);
  const maxTime = minTime + 10;
  return {
    minTime,
    maxTime,
    label: `${minTime} - ${maxTime} menit`,
  };
}

/**
 * Estimates delivery fee in IDR based on km distance
 */
export function estimateDeliveryFee(km: number): number {
  if (km <= 3) return 8000; // Flat Rp 8.000 for <= 3km
  if (km <= 10) return 8000 + Math.round((km - 3) * 2000);
  if (km <= 25) return 22000 + Math.round((km - 10) * 2500);
  return 60000; // Far distance
}

/**
 * Finds the closest store to a given location and sorts all stores by distance
 */
export function getStoresSortedByDistance(
  stores: StoreLocation[],
  userLat: number,
  userLng: number
): { store: StoreLocation; distanceKm: number }[] {
  return stores
    .map((store) => ({
      store,
      distanceKm: calculateDistanceKm(userLat, userLng, store.lat, store.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
