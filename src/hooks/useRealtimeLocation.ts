import { useState, useEffect, useCallback, useRef } from 'react';
import { UserLocationState } from '../types';

// Default fallback location (Jakarta Pusat / Thamrin)
const DEFAULT_LAT = -6.1950;
const DEFAULT_LNG = 106.8208;

export function useRealtimeLocation() {
  const [location, setLocation] = useState<UserLocationState>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    accuracy: 15,
    timestamp: Date.now(),
    addressName: 'Grand Indonesia, Jakarta',
    isTracking: false,
    loading: false,
    error: undefined,
  });

  const watchIdRef = useRef<number | null>(null);

  // Reverse geocoding helper via client or fallback
  const fetchAddressName = useCallback(async (lat: number, lng: number) => {
    try {
      // Friendly local identifier based on proximity
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'id' } }
      );
      if (res.ok) {
        const data = await res.json();
        const road = data.address?.road || data.address?.suburb || data.address?.city_district || '';
        const city = data.address?.city || data.address?.town || data.address?.municipality || 'Indonesia';
        return road ? `${road}, ${city}` : data.display_name?.split(',').slice(0, 2).join(',') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    } catch {
      // Fallback
    }
    return `Koordinat (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }, []);

  // One-time fetch of current real-time GPS location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolokasi tidak didukung oleh browser Anda.',
        loading: false,
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: undefined }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const address = await fetchAddressName(latitude, longitude);
        setLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy || 10,
          timestamp: pos.timestamp,
          addressName: address,
          isTracking: true,
          loading: false,
          error: undefined,
        });
      },
      (err) => {
        let msg = 'Gagal mengakses lokasi GPS.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Izin lokasi ditolak. Silakan izinkan akses lokasi di peramban Anda.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Sinyal GPS lokasi tidak terdeteksi saat ini.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Waktu permintaan lokasi GPS habis.';
        }
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: msg,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [fetchAddressName]);

  // Start continuous real-time watch
  const startLiveTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setLocation((prev) => ({ ...prev, isTracking: true, loading: true }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocation((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          accuracy: accuracy || 10,
          timestamp: pos.timestamp,
          isTracking: true,
          loading: false,
          error: undefined,
        }));
      },
      (err) => {
        console.warn('Live location watch warning:', err.message);
        setLocation((prev) => ({
          ...prev,
          isTracking: false,
          loading: false,
          error: 'Pelacakan real-time terhenti. Periksa izin lokasi.',
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000,
      }
    );
  }, []);

  // Stop tracking
  const stopLiveTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocation((prev) => ({ ...prev, isTracking: false }));
  }, []);

  // Manual city jump for quick testing / mock
  const setManualLocation = useCallback(
    async (lat: number, lng: number, label: string) => {
      stopLiveTracking();
      setLocation({
        lat,
        lng,
        accuracy: 10,
        timestamp: Date.now(),
        addressName: label,
        isTracking: false,
        loading: false,
        error: undefined,
      });
    },
    [stopLiveTracking]
  );

  // Auto-attempt geolocation on mount
  useEffect(() => {
    getCurrentLocation();
    startLiveTracking();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [getCurrentLocation, startLiveTracking]);

  return {
    location,
    getCurrentLocation,
    startLiveTracking,
    stopLiveTracking,
    setManualLocation,
  };
}
