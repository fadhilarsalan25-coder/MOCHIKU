import React, { useState, useEffect, useRef, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MOCHIKU_STORES } from '../data/storesData';
import { StoreLocation, UserLocationState } from '../types';
import { calculateDistanceKm, formatDistance, estimateDeliveryMinutes, estimateDeliveryFee, getStoresSortedByDistance } from '../utils/geo';
import { soundFX } from '../utils/audio';
import { InteractiveLeafletMap } from './InteractiveLeafletMap';
import {
  MapPin,
  Navigation,
  Compass,
  Radio,
  Clock,
  Sparkles,
  Truck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  LocateFixed,
  Key,
  Layers,
  Check,
  X,
  Search,
  Globe2
} from 'lucide-react';

export interface IndonesianCity {
  name: string;
  region: 'Jawa' | 'Sumatera' | 'Kalimantan' | 'Sulawesi' | 'Bali & Nusa Tenggara' | 'Maluku & Papua';
  lat: number;
  lng: number;
  province: string;
}

// 100 Kota Terbesar di Seluruh Penjuru Indonesia
const INDONESIAN_100_CITIES: IndonesianCity[] = [
  // JAWA
  { name: 'Jakarta Pusat', region: 'Jawa', province: 'DKI Jakarta', lat: -6.1805, lng: 106.8284 },
  { name: 'Jakarta Selatan', region: 'Jawa', province: 'DKI Jakarta', lat: -6.2615, lng: 106.8106 },
  { name: 'Jakarta Barat', region: 'Jawa', province: 'DKI Jakarta', lat: -6.1683, lng: 106.7588 },
  { name: 'Jakarta Timur', region: 'Jawa', province: 'DKI Jakarta', lat: -6.2250, lng: 106.9004 },
  { name: 'Jakarta Utara', region: 'Jawa', province: 'DKI Jakarta', lat: -6.1214, lng: 106.7741 },
  { name: 'Surabaya', region: 'Jawa', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521 },
  { name: 'Bandung', region: 'Jawa', province: 'Jawa Barat', lat: -6.9175, lng: 107.6191 },
  { name: 'Bekasi', region: 'Jawa', province: 'Jawa Barat', lat: -6.2383, lng: 106.9756 },
  { name: 'Tangerang', region: 'Jawa', province: 'Banten', lat: -6.1783, lng: 106.6319 },
  { name: 'Tangerang Selatan', region: 'Jawa', province: 'Banten', lat: -6.2886, lng: 106.7179 },
  { name: 'Depok', region: 'Jawa', province: 'Jawa Barat', lat: -6.4025, lng: 106.7942 },
  { name: 'Semarang', region: 'Jawa', province: 'Jawa Tengah', lat: -6.9667, lng: 110.4167 },
  { name: 'Bogor', region: 'Jawa', province: 'Jawa Barat', lat: -6.5971, lng: 106.8060 },
  { name: 'Malang', region: 'Jawa', province: 'Jawa Timur', lat: -7.9666, lng: 112.6326 },
  { name: 'Surakarta (Solo)', region: 'Jawa', province: 'Jawa Tengah', lat: -7.5755, lng: 110.8243 },
  { name: 'Yogyakarta', region: 'Jawa', province: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695 },
  { name: 'Cirebon', region: 'Jawa', province: 'Jawa Barat', lat: -6.7320, lng: 108.5523 },
  { name: 'Sukabumi', region: 'Jawa', province: 'Jawa Barat', lat: -6.9277, lng: 106.9300 },
  { name: 'Tasikmalaya', region: 'Jawa', province: 'Jawa Barat', lat: -7.3274, lng: 108.2207 },
  { name: 'Serang', region: 'Jawa', province: 'Banten', lat: -6.1104, lng: 106.1640 },
  { name: 'Cilegon', region: 'Jawa', province: 'Banten', lat: -6.0174, lng: 106.0538 },
  { name: 'Cimahi', region: 'Jawa', province: 'Jawa Barat', lat: -6.8723, lng: 107.5420 },
  { name: 'Tegal', region: 'Jawa', province: 'Jawa Tengah', lat: -6.8694, lng: 109.1402 },
  { name: 'Pekalongan', region: 'Jawa', province: 'Jawa Tengah', lat: -6.8886, lng: 109.6753 },
  { name: 'Magelang', region: 'Jawa', province: 'Jawa Tengah', lat: -7.4705, lng: 110.2178 },
  { name: 'Salatiga', region: 'Jawa', province: 'Jawa Tengah', lat: -7.3305, lng: 110.5084 },
  { name: 'Kediri', region: 'Jawa', province: 'Jawa Timur', lat: -7.8480, lng: 112.0178 },
  { name: 'Madiun', region: 'Jawa', province: 'Jawa Timur', lat: -7.6298, lng: 111.5239 },
  { name: 'Probolinggo', region: 'Jawa', province: 'Jawa Timur', lat: -7.7543, lng: 113.2159 },
  { name: 'Pasuruan', region: 'Jawa', province: 'Jawa Timur', lat: -7.6453, lng: 112.9075 },
  { name: 'Blitar', region: 'Jawa', province: 'Jawa Timur', lat: -8.0983, lng: 112.1681 },
  { name: 'Batu', region: 'Jawa', province: 'Jawa Timur', lat: -7.8712, lng: 112.5271 },
  { name: 'Banyuwangi', region: 'Jawa', province: 'Jawa Timur', lat: -8.2192, lng: 114.3691 },
  { name: 'Jember', region: 'Jawa', province: 'Jawa Timur', lat: -8.1724, lng: 113.7007 },
  { name: 'Kudus', region: 'Jawa', province: 'Jawa Tengah', lat: -6.8048, lng: 110.8405 },
  { name: 'Purwokerto', region: 'Jawa', province: 'Jawa Tengah', lat: -7.4243, lng: 109.2302 },
  { name: 'Cilacap', region: 'Jawa', province: 'Jawa Tengah', lat: -7.7279, lng: 109.0059 },
  { name: 'Karawang', region: 'Jawa', province: 'Jawa Barat', lat: -6.3073, lng: 107.3077 },
  { name: 'Garut', region: 'Jawa', province: 'Jawa Barat', lat: -7.2278, lng: 107.9087 },

  // SUMATERA
  { name: 'Medan', region: 'Sumatera', province: 'Sumatera Utara', lat: 3.5952, lng: 98.6722 },
  { name: 'Palembang', region: 'Sumatera', province: 'Sumatera Selatan', lat: -2.9909, lng: 104.7565 },
  { name: 'Batam', region: 'Sumatera', province: 'Kepulauan Riau', lat: 1.1301, lng: 104.0529 },
  { name: 'Pekanbaru', region: 'Sumatera', province: 'Riau', lat: 0.5071, lng: 101.4478 },
  { name: 'Bandar Lampung', region: 'Sumatera', province: 'Lampung', lat: -5.4500, lng: 105.2667 },
  { name: 'Padang', region: 'Sumatera', province: 'Sumatera Barat', lat: -0.9471, lng: 100.4172 },
  { name: 'Jambi', region: 'Sumatera', province: 'Jambi', lat: -1.6101, lng: 103.6131 },
  { name: 'Bengkulu', region: 'Sumatera', province: 'Bengkulu', lat: -3.8004, lng: 102.2655 },
  { name: 'Banda Aceh', region: 'Sumatera', province: 'Aceh', lat: 5.5483, lng: 95.3238 },
  { name: 'Pematangsiantar', region: 'Sumatera', province: 'Sumatera Utara', lat: 2.9592, lng: 99.0687 },
  { name: 'Binjai', region: 'Sumatera', province: 'Sumatera Utara', lat: 3.6006, lng: 98.4854 },
  { name: 'Tanjungpinang', region: 'Sumatera', province: 'Kepulauan Riau', lat: 0.9167, lng: 104.4500 },
  { name: 'Pangkalpinang', region: 'Sumatera', province: 'Bangka Belitung', lat: -2.1333, lng: 106.1167 },
  { name: 'Dumai', region: 'Sumatera', province: 'Riau', lat: 1.6667, lng: 101.4500 },
  { name: 'Bukittinggi', region: 'Sumatera', province: 'Sumatera Barat', lat: -0.3056, lng: 100.3692 },
  { name: 'Lubuklinggau', region: 'Sumatera', province: 'Sumatera Selatan', lat: -3.2936, lng: 102.8617 },
  { name: 'Prabumulih', region: 'Sumatera', province: 'Sumatera Selatan', lat: -3.4300, lng: 104.2300 },
  { name: 'Tebing Tinggi', region: 'Sumatera', province: 'Sumatera Utara', lat: 3.3285, lng: 99.1625 },
  { name: 'Padang Sidempuan', region: 'Sumatera', province: 'Sumatera Utara', lat: 1.3734, lng: 99.2734 },
  { name: 'Lhokseumawe', region: 'Sumatera', province: 'Aceh', lat: 5.1801, lng: 97.1407 },
  { name: 'Langsa', region: 'Sumatera', province: 'Aceh', lat: 4.4714, lng: 97.9683 },
  { name: 'Sabang', region: 'Sumatera', province: 'Aceh', lat: 5.8933, lng: 95.3164 },
  { name: 'Payakumbuh', region: 'Sumatera', province: 'Sumatera Barat', lat: -0.2244, lng: 100.6306 },
  { name: 'Pariaman', region: 'Sumatera', province: 'Sumatera Barat', lat: -0.6264, lng: 100.1206 },
  { name: 'Metro', region: 'Sumatera', province: 'Lampung', lat: -5.1136, lng: 105.3067 },

  // KALIMANTAN
  { name: 'Pontianak', region: 'Kalimantan', province: 'Kalimantan Barat', lat: -0.0263, lng: 109.3425 },
  { name: 'Banjarmasin', region: 'Kalimantan', province: 'Kalimantan Selatan', lat: -3.3194, lng: 114.5908 },
  { name: 'Balikpapan', region: 'Kalimantan', province: 'Kalimantan Timur', lat: -1.2379, lng: 116.8289 },
  { name: 'Samarinda', region: 'Kalimantan', province: 'Kalimantan Timur', lat: -0.5022, lng: 117.1536 },
  { name: 'Palangka Raya', region: 'Kalimantan', province: 'Kalimantan Tengah', lat: -2.2161, lng: 113.9139 },
  { name: 'Tarakan', region: 'Kalimantan', province: 'Kalimantan Utara', lat: 3.3270, lng: 117.5786 },
  { name: 'Singkawang', region: 'Kalimantan', province: 'Kalimantan Barat', lat: 0.9064, lng: 108.9868 },
  { name: 'Banjarbaru', region: 'Kalimantan', province: 'Kalimantan Selatan', lat: -3.4402, lng: 114.8306 },
  { name: 'Bontang', region: 'Kalimantan', province: 'Kalimantan Timur', lat: 0.1333, lng: 117.5000 },
  { name: 'Tanjung Selor', region: 'Kalimantan', province: 'Kalimantan Utara', lat: 2.8375, lng: 117.3653 },
  { name: 'Nusantara (IKN)', region: 'Kalimantan', province: 'Kalimantan Timur', lat: -0.9739, lng: 116.7088 },
  { name: 'Sampit', region: 'Kalimantan', province: 'Kalimantan Tengah', lat: -2.5358, lng: 112.9536 },
  { name: 'Pangkalan Bun', region: 'Kalimantan', province: 'Kalimantan Tengah', lat: -2.6833, lng: 111.6167 },
  { name: 'Ketapang', region: 'Kalimantan', province: 'Kalimantan Barat', lat: -1.8344, lng: 109.9806 },

  // SULAWESI
  { name: 'Makassar', region: 'Sulawesi', province: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327 },
  { name: 'Manado', region: 'Sulawesi', province: 'Sulawesi Utara', lat: 1.4748, lng: 124.8421 },
  { name: 'Palu', region: 'Sulawesi', province: 'Sulawesi Tengah', lat: -0.9003, lng: 119.8780 },
  { name: 'Kendari', region: 'Sulawesi', province: 'Sulawesi Tenggara', lat: -3.9985, lng: 122.5126 },
  { name: 'Gorontalo', region: 'Sulawesi', province: 'Gorontalo', lat: 0.5435, lng: 123.0568 },
  { name: 'Bitung', region: 'Sulawesi', province: 'Sulawesi Utara', lat: 1.4451, lng: 125.1889 },
  { name: 'Parepare', region: 'Sulawesi', province: 'Sulawesi Selatan', lat: -4.0139, lng: 119.6247 },
  { name: 'Palopo', region: 'Sulawesi', province: 'Sulawesi Selatan', lat: -2.9944, lng: 120.1969 },
  { name: 'Baubau', region: 'Sulawesi', province: 'Sulawesi Tenggara', lat: -5.4636, lng: 122.6022 },
  { name: 'Kotamobagu', region: 'Sulawesi', province: 'Sulawesi Utara', lat: 0.7303, lng: 124.3139 },
  { name: 'Mamuju', region: 'Sulawesi', province: 'Sulawesi Barat', lat: -2.6770, lng: 118.8890 },
  { name: 'Tomohon', region: 'Sulawesi', province: 'Sulawesi Utara', lat: 1.3283, lng: 124.8392 },

  // BALI & NUSA TENGGARA
  { name: 'Denpasar', region: 'Bali & Nusa Tenggara', province: 'Bali', lat: -8.6705, lng: 115.2126 },
  { name: 'Mataram', region: 'Bali & Nusa Tenggara', province: 'Nusa Tenggara Barat', lat: -8.5833, lng: 116.1167 },
  { name: 'Kupang', region: 'Bali & Nusa Tenggara', province: 'Nusa Tenggara Timur', lat: -10.1772, lng: 123.6070 },
  { name: 'Bima', region: 'Bali & Nusa Tenggara', province: 'Nusa Tenggara Barat', lat: -8.4539, lng: 118.7275 },
  { name: 'Dompu', region: 'Bali & Nusa Tenggara', province: 'Nusa Tenggara Barat', lat: -8.5333, lng: 118.4667 },
  { name: 'Singaraja (Buleleng)', region: 'Bali & Nusa Tenggara', province: 'Bali', lat: -8.1120, lng: 115.0882 },
  { name: 'Ubud', region: 'Bali & Nusa Tenggara', province: 'Bali', lat: -8.5069, lng: 115.2625 },
  { name: 'Kuta (Badung)', region: 'Bali & Nusa Tenggara', province: 'Bali', lat: -8.7233, lng: 115.1725 },
  { name: 'Labuan Bajo', region: 'Bali & Nusa Tenggara', province: 'Nusa Tenggara Timur', lat: -8.4964, lng: 119.8877 },
  { name: 'Ende', region: 'Bali & Nusa Tenggara', province: 'Nusa Tenggara Timur', lat: -8.8432, lng: 121.6623 },
  { name: 'Sumbawa Besar', region: 'Bali & Nusa Tenggara', province: 'Nusa Tenggara Barat', lat: -8.5028, lng: 117.4206 },

  // MALUKU & PAPUA
  { name: 'Ambon', region: 'Maluku & Papua', province: 'Maluku', lat: -3.6547, lng: 128.1906 },
  { name: 'Jayapura', region: 'Maluku & Papua', province: 'Papua', lat: -2.5916, lng: 140.6690 },
  { name: 'Sorong', region: 'Maluku & Papua', province: 'Papua Barat Daya', lat: -0.8762, lng: 131.2558 },
  { name: 'Ternate', region: 'Maluku & Papua', province: 'Maluku Utara', lat: 0.7903, lng: 127.3828 },
  { name: 'Tidore Kepulauan', region: 'Maluku & Papua', province: 'Maluku Utara', lat: 0.6936, lng: 127.4019 },
  { name: 'Tual', region: 'Maluku & Papua', province: 'Maluku', lat: -5.6294, lng: 132.7483 },
  { name: 'Manokwari', region: 'Maluku & Papua', province: 'Papua Barat', lat: -0.8615, lng: 134.0620 },
  { name: 'Merauke', region: 'Maluku & Papua', province: 'Papua Selatan', lat: -8.4991, lng: 140.4017 },
  { name: 'Timika', region: 'Maluku & Papua', province: 'Papua Tengah', lat: -4.5467, lng: 136.8833 },
  { name: 'Biak', region: 'Maluku & Papua', province: 'Papua', lat: -1.1784, lng: 136.0827 },
  { name: 'Nabire', region: 'Maluku & Papua', province: 'Papua Tengah', lat: -3.3667, lng: 135.4833 },
  { name: 'Wamena', region: 'Maluku & Papua', province: 'Papua Pegunungan', lat: -4.0983, lng: 138.9439 },
];

// Get API Key from environment or local storage override
const ENV_GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

interface GoogleMapsSectionProps {
  userLocation: UserLocationState;
  onRefreshLocation: () => void;
  onSelectCitySimulation: (lat: number, lng: number, label: string) => void;
  onSelectStoreForOrder?: (store: StoreLocation) => void;
}

// Subcomponent to handle Google Maps Route rendering
function GoogleRoutePolyline({
  origin,
  destination,
}: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const geometryLib = useMapsLibrary('geometry');
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !destination) {
      if (polyline) {
        polyline.setMap(null);
        setPolyline(null);
      }
      return;
    }

    // Try computing modern routes using Route.computeRoutes
    if (routesLib && (routesLib as any).Route?.computeRoutes) {
      (routesLib as any).Route.computeRoutes({
        origin: origin,
        destination: destination,
        travelMode: (routesLib as any).TravelMode?.DRIVING || 'DRIVING',
      })
        .then((response: any) => {
          if (polyline) polyline.setMap(null);

          if (response.routes && response.routes.length > 0 && response.routes[0].polyline?.encodedPolyline) {
            const encoded = response.routes[0].polyline.encodedPolyline;
            let path: any[] = [];
            if (geometryLib?.encoding?.decodePath) {
              path = geometryLib.encoding.decodePath(encoded);
            } else if ((routesLib as any).Route?.decode) {
              path = (routesLib as any).Route.decode(encoded);
            } else {
              path = [origin, destination];
            }

            const newPoly = new google.maps.Polyline({
              path: path,
              geodesic: true,
              strokeColor: '#DB2777',
              strokeOpacity: 0.85,
              strokeWeight: 5,
              map: map,
            });
            setPolyline(newPoly);

            const bounds = new google.maps.LatLngBounds();
            bounds.extend(origin);
            bounds.extend(destination);
            map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
          } else {
            const direct = new google.maps.Polyline({
              path: [origin, destination],
              geodesic: true,
              strokeColor: '#F472B6',
              strokeOpacity: 0.8,
              strokeWeight: 4,
              map: map,
            });
            setPolyline(direct);
          }
        })
        .catch(() => {
          if (polyline) polyline.setMap(null);
          const direct = new google.maps.Polyline({
            path: [origin, destination],
            geodesic: true,
            strokeColor: '#F472B6',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            map: map,
          });
          setPolyline(direct);
        });
    } else {
      if (polyline) polyline.setMap(null);
      const direct = new google.maps.Polyline({
        path: [origin, destination],
        geodesic: true,
        strokeColor: '#F472B6',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: map,
      });
      setPolyline(direct);
    }

    return () => {
      if (polyline) {
        polyline.setMap(null);
      }
    };
  }, [map, routesLib, geometryLib, origin.lat, origin.lng, destination?.lat, destination?.lng]);

  return null;
}

// Subcomponent to smoothly pan Google map when center changes
function GoogleMapCameraController({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center.lat, center.lng, zoom]);

  return null;
}

export const GoogleMapsSection: React.FC<GoogleMapsSectionProps> = ({
  userLocation,
  onRefreshLocation,
  onSelectCitySimulation,
  onSelectStoreForOrder,
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('mochiku_gmaps_key') || ENV_GOOGLE_MAPS_API_KEY;
  });
  const [hasAuthError, setHasAuthError] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');

  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(MOCHIKU_STORES[0]);
  const [activeInfoWindow, setActiveInfoWindow] = useState<'user' | 'store' | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: userLocation.lat,
    lng: userLocation.lng,
  });
  const [mapZoom, setMapZoom] = useState(13);
  const [showRoute, setShowRoute] = useState(true);

  // 100 Cities region filter and search state
  const [selectedRegion, setSelectedRegion] = useState<string>('Semua');
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [activeCityName, setActiveCityName] = useState<string>('📍 GPS Asli Saya');

  // Filter 100 Indonesian cities
  const filteredCities = useMemo(() => {
    return INDONESIAN_100_CITIES.filter((city) => {
      const matchRegion = selectedRegion === 'Semua' || city.region === selectedRegion;
      const matchQuery =
        !citySearchQuery.trim() ||
        city.name.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
        city.province.toLowerCase().includes(citySearchQuery.toLowerCase());
      return matchRegion && matchQuery;
    });
  }, [selectedRegion, citySearchQuery]);

  const regionTabs = [
    { label: 'Semua', count: INDONESIAN_100_CITIES.length },
    { label: 'Jawa', count: INDONESIAN_100_CITIES.filter((c) => c.region === 'Jawa').length },
    { label: 'Sumatera', count: INDONESIAN_100_CITIES.filter((c) => c.region === 'Sumatera').length },
    { label: 'Kalimantan', count: INDONESIAN_100_CITIES.filter((c) => c.region === 'Kalimantan').length },
    { label: 'Sulawesi', count: INDONESIAN_100_CITIES.filter((c) => c.region === 'Sulawesi').length },
    { label: 'Bali & Nusa Tenggara', count: INDONESIAN_100_CITIES.filter((c) => c.region === 'Bali & Nusa Tenggara').length },
    { label: 'Maluku & Papua', count: INDONESIAN_100_CITIES.filter((c) => c.region === 'Maluku & Papua').length },
  ];

  // Catch window.gm_authFailure safely
  useEffect(() => {
    const originalAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps auth error detected - switching to resilient interactive map engine.');
      setHasAuthError(true);
      if (typeof originalAuthFailure === 'function') {
        originalAuthFailure();
      }
    };

    return () => {
      (window as any).gm_authFailure = originalAuthFailure;
    };
  }, []);

  // Determine if Google Maps should be active
  const isGoogleMapsReady = Boolean(apiKey.trim()) && !hasAuthError;

  // Sort stores dynamically by distance from user's live coordinates
  const sortedStores = useMemo(() => {
    return getStoresSortedByDistance(MOCHIKU_STORES, userLocation.lat, userLocation.lng);
  }, [userLocation.lat, userLocation.lng]);

  const nearestStoreInfo = sortedStores[0];

  // Recenter to user's real-time position
  const handleRecenterUser = () => {
    soundFX.playPop(520);
    setMapCenter({ lat: userLocation.lat, lng: userLocation.lng });
    setMapZoom(14);
    setActiveInfoWindow('user');
  };

  // Center on a specific outlet
  const handleSelectStore = (store: StoreLocation) => {
    soundFX.playPop(480);
    setSelectedStore(store);
    setMapCenter({ lat: store.lat, lng: store.lng });
    setMapZoom(15);
    setActiveInfoWindow('store');
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = tempKeyInput.trim();
    if (cleanKey) {
      localStorage.setItem('mochiku_gmaps_key', cleanKey);
      setApiKey(cleanKey);
      setHasAuthError(false);
    } else {
      localStorage.removeItem('mochiku_gmaps_key');
      setApiKey('');
    }
    setShowKeyModal(false);
    soundFX.playPop(550);
  };

  return (
    <div id="mochiku-map-locator" className="relative scroll-mt-20 space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0F5] border border-[#FBCFE8] text-xs font-semibold text-[#DB2777] mb-2 shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-[#F472B6] animate-pulse" />
            <span>
              {isGoogleMapsReady ? 'Google Maps Platform Active' : 'Live Real-Time GPS Map Active'}
            </span>
          </div>
          <h3 className="font-fredoka text-2xl sm:text-3xl font-bold text-[#5C3D2E]">
            Lacak Outlet & Pengiriman Real-Time 📍
          </h3>
          <p className="text-xs sm:text-sm text-[#8C5D43]/90 mt-1 max-w-2xl">
            Deteksi posisi GPS Anda secara langsung untuk menemukan outlet Mochiku terdekat, estimasi jarak pengantaran instan, dan rute navigasi.
          </p>
        </div>

        {/* Live Tracking Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRecenterUser}
            className="px-3.5 py-2 rounded-2xl bg-white hover:bg-[#FFF0F5] border-2 border-[#F472B6] text-xs font-fredoka font-bold text-[#DB2777] shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Pusatkan Peta ke Lokasi Saya"
          >
            <LocateFixed className="w-4 h-4 text-[#F472B6]" />
            <span>Lokasi Saya</span>
          </button>

          <button
            onClick={() => {
              soundFX.playPop(420);
              onRefreshLocation();
            }}
            disabled={userLocation.loading}
            className="px-3.5 py-2 rounded-2xl bg-white hover:bg-gray-50 border border-[#F0E6DF] text-xs font-semibold text-[#5C3D2E] shadow-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Perbarui GPS"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8C5D43] ${userLocation.loading ? 'animate-spin' : ''}`} />
            <span>{userLocation.loading ? 'Mendeteksi...' : 'Refresh GPS'}</span>
          </button>

          <button
            onClick={() => {
              soundFX.playPop(440);
              setShowRoute(!showRoute);
            }}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              showRoute
                ? 'bg-[#FFF0F5] border-[#F472B6] text-[#DB2777]'
                : 'bg-white border-[#F0E6DF] text-[#8C5D43]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{showRoute ? 'Sembunyikan Rute' : 'Tampilkan Rute'}</span>
          </button>

          <button
            onClick={() => {
              soundFX.playPop(460);
              setTempKeyInput(apiKey);
              setShowKeyModal(true);
            }}
            className="p-2 rounded-2xl bg-white hover:bg-[#FFF0F5] border border-[#FCE7F3] text-[#8C5D43] text-xs font-semibold shadow-xs flex items-center gap-1 transition-all"
            title="Pengaturan Google Maps API Key"
          >
            <Key className="w-3.5 h-3.5 text-[#F472B6]" />
            <span className="hidden sm:inline">{isGoogleMapsReady ? 'Google Key ✓' : 'Setup API Key'}</span>
          </button>
        </div>
      </div>

      {/* 100 CITIES SELECTOR BAR ACROSS ALL INDONESIAN REGIONS */}
      <div className="p-4 rounded-3xl bg-white/85 backdrop-blur-md border-2 border-[#FCE7F3] shadow-xs space-y-3.5">
        
        {/* Top Header & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#FCE7F3]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FFF0F5] text-[#DB2777]">
              <Globe2 className="w-4 h-4 text-[#F472B6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-fredoka font-bold text-sm text-[#5C3D2E]">
                  100 Kota Terbesar di Seluruh Indonesia 🇮🇩
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#E11D48] text-[10px] font-bold">
                  {INDONESIAN_100_CITIES.length} Kota
                </span>
              </div>
              <p className="text-[11px] text-[#8C5D43]">
                Pilih atau cari kota mana saja untuk melihat outlet & rute pengantaran terdekat:
              </p>
            </div>
          </div>

          {/* Search Box & GPS Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playPop(520);
                setActiveCityName('📍 GPS Asli Saya');
                onRefreshLocation();
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-fredoka font-bold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer active:scale-95 ${
                activeCityName === '📍 GPS Asli Saya'
                  ? 'bg-[#DB2777] text-white border-[#DB2777]'
                  : 'bg-[#FFF0F5] hover:bg-[#FFE4EE] text-[#DB2777] border-[#FBCFE8]'
              }`}
              title="Gunakan titik koordinat GPS asli Anda"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>GPS Asli</span>
            </button>

            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#8C5D43]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                placeholder="Cari dari 100 kota..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#FFF9F5] border border-[#FBCFE8] focus:border-[#F472B6] text-xs text-[#5C3D2E] placeholder-[#8C5D43]/50 outline-none transition-colors"
              />
              {citySearchQuery && (
                <button
                  onClick={() => setCitySearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-pink-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {regionTabs.map((tab) => {
            const isActive = selectedRegion === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  soundFX.playPop(460);
                  setSelectedRegion(tab.label);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#DB2777] text-white shadow-2xs'
                    : 'bg-white hover:bg-[#FFF0F5] text-[#5C3D2E] border border-[#FCE7F3]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-pink-100 text-[#DB2777]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Badges for 100 Cities */}
        <div className="max-h-40 overflow-y-auto pr-1">
          {filteredCities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {filteredCities.map((city, idx) => {
                const isSelected = activeCityName === city.name;
                return (
                  <button
                    key={`${city.name}-${idx}`}
                    onClick={() => {
                      soundFX.playPop(490);
                      setActiveCityName(city.name);
                      onSelectCitySimulation(city.lat, city.lng, city.name);
                    }}
                    className={`px-2.5 py-1 rounded-xl border text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#DB2777] text-white border-[#DB2777] shadow-xs ring-2 ring-pink-300'
                        : 'bg-[#FFF9F5] hover:bg-[#FFF0F5] text-[#5C3D2E] border-[#FBCFE8] hover:border-[#F472B6]'
                    }`}
                    title={`${city.name}, ${city.province} (${city.region})`}
                  >
                    <span>{city.name}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                        isSelected ? 'bg-white/20 text-white' : 'text-[#8C5D43]/70'
                      }`}
                    >
                      {city.province}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-[#8C5D43]">
              Tidak ada kota yang cocok dengan kata kunci &quot;{citySearchQuery}&quot; di wilayah {selectedRegion}.
            </div>
          )}
        </div>

      </div>

      {/* NEAREST OUTLET & GPS STATUS BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Nearest Store Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF9F5] border-2 border-[#FBCFE8] shadow-sm flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-[#FFF0F5] text-[#DB2777] text-2xl shrink-0 shadow-2xs">
            🍡
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#DB2777]">
              <Sparkles className="w-3 h-3 text-[#F472B6]" />
              <span>Outlet Terdekat</span>
            </div>
            <h4 className="font-fredoka text-sm font-bold text-[#5C3D2E] truncate mt-0.5">
              {nearestStoreInfo.store.name}
            </h4>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-[#8C5D43]">
              <span className="px-2 py-0.5 rounded-lg bg-[#FFE4E6] text-[#E11D48] font-bold">
                {formatDistance(nearestStoreInfo.distanceKm)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#059669]">
                <Clock className="w-3 h-3" />
                {estimateDeliveryMinutes(nearestStoreInfo.distanceKm).label}
              </span>
            </div>
          </div>
        </div>

        {/* Live GPS Telemetry Card */}
        <div className="p-4 rounded-3xl bg-white/90 backdrop-blur-xs border border-[#FCE7F3] shadow-xs flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-[#E8F8EE] text-[#065F46] shrink-0">
            <Radio className="w-5 h-5 text-[#059669] animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#059669]">GPS Real-Time Status</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                ● Aktif
              </span>
            </div>
            <p className="text-xs font-bold text-[#5C3D2E] mt-0.5 truncate">
              {userLocation.addressName || 'Lokasi Terdeteksi'}
            </p>
            <p className="text-[10px] text-[#8C5D43]/80 font-mono mt-0.5">
              Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)} (±{Math.round(userLocation.accuracy)}m)
            </p>
          </div>
        </div>

        {/* Instant Delivery Zone Card */}
        <div className="p-4 rounded-3xl bg-white/90 backdrop-blur-xs border border-[#FCE7F3] shadow-xs flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-[#FFF8E7] text-[#854D0E] shrink-0">
            <Truck className="w-5 h-5 text-[#D97706]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#D97706]">Jangkauan Pengantaran</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {nearestStoreInfo.distanceKm <= nearestStoreInfo.store.deliveryRadiusKm ? (
                <span className="text-xs font-bold text-[#059669] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Dalam Jangkauan Kurir Instan
                </span>
              ) : (
                <span className="text-xs font-bold text-[#D97706] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Luar radius instan (Bisa Pickup)
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#8C5D43]/80 mt-0.5">
              Tarif kurir mulai Rp 8.000 (Packaging Chilled Ice Gel Gratis)
            </p>
          </div>
        </div>

      </div>

      {/* INTERACTIVE MAP VIEWPORT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MAP CONTAINER (8 Columns on desktop) */}
        <div className="lg:col-span-8 h-[440px] sm:h-[500px] w-full rounded-3xl overflow-hidden border-2 border-[#FBCFE8] shadow-md relative bg-[#FDF2F4]">
          
          {isGoogleMapsReady ? (
            <APIProvider
              apiKey={apiKey}
              libraries={['marker', 'routes', 'geometry']}
              onError={() => {
                setHasAuthError(true);
              }}
            >
              <Map
                defaultCenter={{ lat: userLocation.lat, lng: userLocation.lng }}
                defaultZoom={13}
                gestureHandling="greedy"
                disableDefaultUI={false}
                fullscreenControl={true}
                zoomControl={true}
                streetViewControl={false}
                mapTypeControl={false}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              >
                <GoogleMapCameraController center={mapCenter} zoom={mapZoom} />

                {/* ROUTE LINE */}
                {showRoute && selectedStore && (
                  <GoogleRoutePolyline
                    origin={{ lat: userLocation.lat, lng: userLocation.lng }}
                    destination={{ lat: selectedStore.lat, lng: selectedStore.lng }}
                  />
                )}

                {/* USER'S REAL-TIME LOCATION MARKER */}
                <AdvancedMarker
                  position={{ lat: userLocation.lat, lng: userLocation.lng }}
                  title="Lokasi Real-Time Saya"
                  onClick={() => {
                    soundFX.playPop(500);
                    setActiveInfoWindow('user');
                  }}
                >
                  <div className="relative flex items-center justify-center cursor-pointer group">
                    <span className="absolute w-12 h-12 rounded-full bg-pink-400/30 animate-ping" />
                    <span className="absolute w-8 h-8 rounded-full bg-pink-500/40" />
                    <div className="relative z-10 w-9 h-9 rounded-full bg-white border-2 border-[#DB2777] shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <span className="text-lg">💖</span>
                    </div>
                    <div className="absolute -bottom-6 px-2 py-0.5 rounded-md bg-[#5C3D2E] text-white text-[10px] font-fredoka font-bold whitespace-nowrap shadow-xs">
                      Lokasi Kamu
                    </div>
                  </div>
                </AdvancedMarker>

                {/* USER INFO WINDOW */}
                {activeInfoWindow === 'user' && (
                  <InfoWindow
                    position={{ lat: userLocation.lat, lng: userLocation.lng }}
                    onCloseClick={() => setActiveInfoWindow(null)}
                  >
                    <div className="p-2 max-w-xs text-left">
                      <div className="flex items-center gap-1.5 text-xs font-fredoka font-bold text-[#DB2777]">
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        <span>Posisi Real-Time Kamu</span>
                      </div>
                      <p className="text-xs text-[#5C3D2E] mt-1 font-semibold">
                        {userLocation.addressName || 'Titik Koordinat GPS Terdeteksi'}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Akurasi sinyal: ±{Math.round(userLocation.accuracy)} meter
                      </p>
                      <div className="mt-2 pt-2 border-t border-pink-100 flex items-center justify-between text-[11px]">
                        <span className="text-[#8C5D43]">Outlet terdekat:</span>
                        <strong className="text-[#DB2777]">{formatDistance(nearestStoreInfo.distanceKm)}</strong>
                      </div>
                    </div>
                  </InfoWindow>
                )}

                {/* STORE OUTLET MARKERS */}
                {MOCHIKU_STORES.map((store) => {
                  const isSelected = selectedStore?.id === store.id;

                  return (
                    <AdvancedMarker
                      key={store.id}
                      position={{ lat: store.lat, lng: store.lng }}
                      title={store.name}
                      onClick={() => handleSelectStore(store)}
                    >
                      <div className="relative flex flex-col items-center cursor-pointer group">
                        <div
                          className={`px-2.5 py-1.5 rounded-2xl shadow-md border-2 flex items-center gap-1.5 transition-all transform group-hover:scale-110 ${
                            isSelected
                              ? 'bg-[#DB2777] text-white border-white ring-2 ring-[#DB2777]'
                              : 'bg-white text-[#5C3D2E] border-[#F472B6]'
                          }`}
                        >
                          <span className="text-base">{store.isFlagship ? '👑' : '🍡'}</span>
                          <span className="text-xs font-fredoka font-bold whitespace-nowrap">
                            {store.city}
                          </span>
                        </div>
                        <div
                          className={`w-2 h-2 rotate-45 -mt-1 ${
                            isSelected ? 'bg-[#DB2777]' : 'bg-white border-r-2 border-b-2 border-[#F472B6]'
                          }`}
                        />
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* STORE INFO WINDOW */}
                {activeInfoWindow === 'store' && selectedStore && (
                  <InfoWindow
                    position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
                    onCloseClick={() => setActiveInfoWindow(null)}
                  >
                    <div className="p-2.5 max-w-xs text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase text-[#DB2777] bg-pink-50 px-1.5 py-0.5 rounded">
                          {selectedStore.city}
                        </span>
                        {selectedStore.isFlagship && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            ★ Flagship
                          </span>
                        )}
                      </div>

                      <h4 className="font-fredoka text-sm font-bold text-[#5C3D2E] mt-1">
                        {selectedStore.name}
                      </h4>
                      <p className="text-[11px] text-[#8C5D43] mt-0.5 leading-snug">
                        {selectedStore.address}
                      </p>

                      <div className="mt-2 space-y-1 text-[11px] bg-[#FFF9F5] p-2 rounded-xl border border-[#FCE7F3]">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Jarak dari Kamu:</span>
                          <strong className="text-[#DB2777]">
                            {formatDistance(
                              calculateDistanceKm(userLocation.lat, userLocation.lng, selectedStore.lat, selectedStore.lng)
                            )}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Estimasi Tiba:</span>
                          <strong className="text-[#059669]">
                            {
                              estimateDeliveryMinutes(
                                calculateDistanceKm(userLocation.lat, userLocation.lng, selectedStore.lat, selectedStore.lng)
                              ).label
                            }
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Jam Operasional:</span>
                          <span className="font-medium text-[#5C3D2E]">{selectedStore.openHours}</span>
                        </div>
                      </div>

                      {onSelectStoreForOrder && (
                        <button
                          onClick={() => {
                            soundFX.playPop(520);
                            onSelectStoreForOrder(selectedStore);
                          }}
                          className="mt-2 w-full py-1.5 rounded-xl bg-gradient-to-r from-[#FF94A8] to-[#F472B6] text-white font-fredoka font-bold text-xs text-center shadow-xs cursor-pointer"
                        >
                          Pilih Outlet Ini untuk Pesanan
                        </button>
                      )}
                    </div>
                  </InfoWindow>
                )}

              </Map>
            </APIProvider>
          ) : (
            /* RESILIENT FULL-FEATURED INTERACTIVE MAP (NO API KEY REQUIRED / ZERO PROJECT ERRORS) */
            <InteractiveLeafletMap
              userLocation={{
                lat: userLocation.lat,
                lng: userLocation.lng,
                addressName: userLocation.addressName,
                accuracy: userLocation.accuracy,
              }}
              selectedStore={selectedStore}
              onSelectStore={handleSelectStore}
              showRoute={showRoute}
              onSelectStoreForOrder={onSelectStoreForOrder}
            />
          )}

          {/* Floating Map Legend / Overlay */}
          <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-[#FCE7F3] shadow-xs text-xs pointer-events-none">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DB2777] animate-pulse" />
                <span className="font-semibold text-[#5C3D2E] text-[11px]">Posisi Kamu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🍡</span>
                <span className="font-semibold text-[#5C3D2E] text-[11px]">Outlet Mochiku</span>
              </div>
            </div>
          </div>

        </div>

        {/* OUTLET LIST & DETAILS PANEL (4 Columns on desktop) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 max-h-[500px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-fredoka font-bold text-[#5C3D2E] px-1">
            <span>Daftar Outlet Mochiku ({MOCHIKU_STORES.length})</span>
            <span className="text-[#DB2777]">Urut Berdasarkan Jarak</span>
          </div>

          {sortedStores.map(({ store, distanceKm }) => {
            const isSelected = selectedStore?.id === store.id;
            const deliveryTime = estimateDeliveryMinutes(distanceKm);

            return (
              <div
                key={store.id}
                onClick={() => handleSelectStore(store)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#FFF0F5] border-[#F472B6] shadow-sm'
                    : 'bg-white border-[#F0E6DF] hover:border-[#FBCFE8] hover:bg-[#FFFDF9]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{store.isFlagship ? '👑' : '🍡'}</span>
                    <div>
                      <h5 className="font-fredoka text-xs font-bold text-[#5C3D2E] leading-snug">
                        {store.name}
                      </h5>
                      <span className="text-[10px] text-[#8C5D43]/80 block">{store.city}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-lg bg-[#FFE4E6] text-[#E11D48] text-[11px] font-bold whitespace-nowrap">
                    {formatDistance(distanceKm)}
                  </span>
                </div>

                <p className="text-[11px] text-[#8C5D43] mt-2 line-clamp-1">
                  {store.address}
                </p>

                <div className="mt-2.5 pt-2 border-t border-[#FCE7F3] flex items-center justify-between text-[11px]">
                  <span className="text-[#059669] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {deliveryTime.label}
                  </span>
                  <span className="text-xs font-bold text-[#DB2777] flex items-center gap-0.5">
                    <span>Lihat Rute</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* OPTIONAL GOOGLE MAPS API KEY CONFIG MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-[#FCE7F3] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-[#FFF0F5] text-[#DB2777]">
                  <Key className="w-5 h-5" />
                </div>
                <h4 className="font-fredoka text-lg font-bold text-[#5C3D2E]">
                  Google Maps Platform API Key
                </h4>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8C5D43]">
              Aplikasi telah dilengkapi dengan pelacak GPS real-time interaktif. Jika Anda memiliki Google Maps Platform API Key sendiri untuk mengaktifkan Google Vector Maps, Anda dapat memasukkannya di bawah ini:
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#5C3D2E] block mb-1">
                  API Key Google Maps (AIzaSy...)
                </label>
                <input
                  type="text"
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  placeholder="Masukkan API Key Google Maps..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0E6DF] focus:border-[#F472B6] text-xs text-[#5C3D2E] outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('mochiku_gmaps_key');
                    setApiKey('');
                    setTempKeyInput('');
                    setHasAuthError(false);
                    setShowKeyModal(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Reset / Hapus
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF94A8] to-[#F472B6] text-white font-fredoka font-bold text-xs shadow-xs"
                >
                  Simpan & Terapkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
