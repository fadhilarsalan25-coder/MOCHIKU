import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MOCHIKU_STORES } from '../data/storesData';
import { StoreLocation } from '../types';
import { calculateDistanceKm, formatDistance, estimateDeliveryMinutes } from '../utils/geo';
import { Radio, Sparkles, Clock, Phone, MapPin } from 'lucide-react';
import { soundFX } from '../utils/audio';

// Custom User Pin (Kawaii Pink Heart Pin with Pulsing Radar Ring)
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer">
        <span class="absolute w-12 h-12 rounded-full bg-pink-400/30 animate-ping"></span>
        <span class="absolute w-8 h-8 rounded-full bg-pink-500/40"></span>
        <div class="relative z-10 w-9 h-9 rounded-full bg-white border-2 border-[#DB2777] shadow-lg flex items-center justify-center text-base">
          💖
        </div>
        <div class="absolute -bottom-6 px-2 py-0.5 rounded-md bg-[#5C3D2E] text-white text-[10px] font-bold whitespace-nowrap shadow-xs pointer-events-none">
          Lokasi Kamu
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

// Custom Store Pin (Mochi & Flagship)
const createStoreIcon = (store: StoreLocation, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-store-marker',
    html: `
      <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
        <div class="px-2.5 py-1.5 rounded-2xl shadow-md border-2 flex items-center gap-1.5 transition-all transform hover:scale-110 ${
          isSelected
            ? 'bg-[#DB2777] text-white border-white ring-2 ring-[#DB2777]'
            : 'bg-white text-[#5C3D2E] border-[#F472B6]'
        }">
          <span class="text-sm">${store.isFlagship ? '👑' : '🍡'}</span>
          <span class="text-[11px] font-bold whitespace-nowrap">${store.city}</span>
        </div>
        <div class="w-2 h-2 rotate-45 -mt-1 ${
          isSelected ? 'bg-[#DB2777]' : 'bg-white border-r-2 border-b-2 border-[#F472B6]'
        }"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });
};

// Controller to smoothly pan & zoom map
function LeafletMapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [map, center[0], center[1], zoom]);

  return null;
}

interface InteractiveLeafletMapProps {
  userLocation: { lat: number; lng: number; addressName?: string; accuracy: number };
  selectedStore: StoreLocation | null;
  onSelectStore: (store: StoreLocation) => void;
  showRoute: boolean;
  onSelectStoreForOrder?: (store: StoreLocation) => void;
}

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  userLocation,
  selectedStore,
  onSelectStore,
  showRoute,
  onSelectStoreForOrder,
}) => {
  const userIcon = useRef(createUserIcon()).current;

  const centerPos: [number, number] = selectedStore
    ? [selectedStore.lat, selectedStore.lng]
    : [userLocation.lat, userLocation.lng];

  // Route path coordinates between User and Selected Outlet
  const routePositions: [number, number][] = selectedStore
    ? [
        [userLocation.lat, userLocation.lng],
        [selectedStore.lat, selectedStore.lng],
      ]
    : [];

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ width: '100%', height: '100%', minHeight: '440px' }}
      >
        {/* Soft, warm pastel map tiles from CartoDB Voyager */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <LeafletMapController center={centerPos} zoom={selectedStore ? 14 : 13} />

        {/* Dynamic Route Polyline */}
        {showRoute && selectedStore && (
          <>
            {/* Outer soft glow line */}
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: '#F472B6',
                weight: 6,
                opacity: 0.6,
                dashArray: '8, 8',
              }}
            />
            {/* Inner solid route line */}
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: '#DB2777',
                weight: 3,
                opacity: 0.9,
              }}
            />
          </>
        )}

        {/* Real-time User Marker */}
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
          eventHandlers={{
            click: () => {
              soundFX.playPop(520);
            },
          }}
        >
          <Popup className="kawaii-popup">
            <div className="p-1 max-w-[220px] text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#DB2777]">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Posisi Real-Time Kamu</span>
              </div>
              <p className="text-xs text-[#5C3D2E] mt-1 font-semibold">
                {userLocation.addressName || 'Titik Koordinat GPS Terdeteksi'}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Akurasi GPS: ±{Math.round(userLocation.accuracy)} meter
              </p>
            </div>
          </Popup>
        </Marker>

        {/* All Mochiku Store Markers */}
        {MOCHIKU_STORES.map((store) => {
          const isSelected = selectedStore?.id === store.id;
          const storeIcon = createStoreIcon(store, isSelected);
          const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, store.lat, store.lng);
          const deliveryTime = estimateDeliveryMinutes(distanceKm);

          return (
            <Marker
              key={store.id}
              position={[store.lat, store.lng]}
              icon={storeIcon}
              eventHandlers={{
                click: () => {
                  soundFX.playPop(480);
                  onSelectStore(store);
                },
              }}
            >
              <Popup className="kawaii-popup">
                <div className="p-1 max-w-[240px] text-left">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase text-[#DB2777] bg-pink-50 px-1.5 py-0.5 rounded">
                      {store.city}
                    </span>
                    {store.isFlagship && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        ★ Flagship
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-[#5C3D2E] leading-snug">
                    {store.name}
                  </h4>
                  <p className="text-[11px] text-[#8C5D43] mt-0.5 leading-tight">
                    {store.address}
                  </p>

                  <div className="mt-2 space-y-1 text-[11px] bg-[#FFF9F5] p-2 rounded-xl border border-[#FCE7F3]">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Jarak dari Kamu:</span>
                      <strong className="text-[#DB2777]">{formatDistance(distanceKm)}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Estimasi Tiba:</span>
                      <strong className="text-[#059669]">{deliveryTime.label}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Buka:</span>
                      <span className="font-medium text-[#5C3D2E]">{store.openHours}</span>
                    </div>
                  </div>

                  {onSelectStoreForOrder && (
                    <button
                      onClick={() => {
                        soundFX.playPop(520);
                        onSelectStoreForOrder(store);
                      }}
                      className="mt-2 w-full py-1.5 rounded-xl bg-gradient-to-r from-[#FF94A8] to-[#F472B6] text-white font-bold text-xs text-center shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      Pilih Outlet Ini untuk Pesanan
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
