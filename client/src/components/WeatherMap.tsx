import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, CloudRain, Thermometer, Cloud } from 'lucide-react';
import { LocationInfo } from '../types/weather';

interface WeatherMapProps {
  location: LocationInfo;
  temp?: number;
  unitSymbol?: string;
  theme: 'light' | 'dark';
  onMapClick?: (lat: number, lon: number) => void;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  location,
  temp,
  unitSymbol = '°C',
  theme,
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const layerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<'precipitation' | 'temp' | 'clouds'>('precipitation');

  // Layer Tile URLs (OpenWeatherMap tiles or Weather OpenStreetMap overlays)
  const getOverlayUrl = (layerType: string) => {
    switch (layerType) {
      case 'precipitation':
        return 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=932c0282b0e77d0130f1465bcfa6a066';
      case 'temp':
        return 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=932c0282b0e77d0130f1465bcfa6a066';
      case 'clouds':
        return 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=932c0282b0e77d0130f1465bcfa6a066';
      default:
        return 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=932c0282b0e77d0130f1465bcfa6a066';
    }
  };

  // 1. Initialize map and marker
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [location.lat, location.lon],
        zoom: 8,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Choose base map style based on initial theme
      const baseUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      const baseLayer = L.tileLayer(baseUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
        maxZoom: 19,
      }).addTo(map);
      baseLayerRef.current = baseLayer;

      // Add overlays
      const overlay = L.tileLayer(getOverlayUrl(activeLayer), {
        opacity: 0.6,
        maxZoom: 19,
      }).addTo(map);
      layerRef.current = overlay;

      // Custom marker
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping"></div>
            <div class="px-2.5 py-1 rounded-xl bg-slate-900/90 text-emerald-400 border border-emerald-400/50 shadow-xl text-xs font-extrabold flex items-center gap-1">
              <span>📍 ${location.name}</span>
              ${temp !== undefined ? `<span class="text-white bg-emerald-500 px-1.5 py-0.5 rounded text-[10px] ml-1">${temp}${unitSymbol}</span>` : ''}
            </div>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [60, 18],
      });

      const marker = L.marker([location.lat, location.lon], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Handle map clicks to search new location
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
    } else {
      // Update view and marker latency
      const map = mapInstanceRef.current;
      map.setView([location.lat, location.lon], map.getZoom(), { animate: true });

      if (markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lon]);
        
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping"></div>
              <div class="px-2.5 py-1 rounded-xl bg-slate-900/90 text-emerald-400 border border-emerald-400/50 shadow-xl text-xs font-extrabold flex items-center gap-1">
                <span>📍 ${location.name}</span>
                ${temp !== undefined ? `<span class="text-white bg-emerald-500 px-1.5 py-0.5 rounded text-[10px] ml-1">${temp}${unitSymbol}</span>` : ''}
              </div>
            </div>
          `,
          iconSize: [120, 36],
          iconAnchor: [60, 18],
        });
        markerRef.current.setIcon(customIcon);
      }
    }
  }, [location.lat, location.lon, location.name, temp, unitSymbol, onMapClick]);

  // 2. Watch theme to toggle light/dark base map
  useEffect(() => {
    if (mapInstanceRef.current) {
      if (baseLayerRef.current) {
        mapInstanceRef.current.removeLayer(baseLayerRef.current);
      }

      const baseUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      const baseLayer = L.tileLayer(baseUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      baseLayerRef.current = baseLayer;
    }
  }, [theme]);

  // 3. Watch activeLayer to swap overlays
  useEffect(() => {
    if (mapInstanceRef.current && layerRef.current) {
      mapInstanceRef.current.removeLayer(layerRef.current);
      const overlay = L.tileLayer(getOverlayUrl(activeLayer), {
        opacity: 0.65,
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
      layerRef.current = overlay;
    }
  }, [activeLayer]);

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl border flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-bold tracking-tight text-nature-primary">
            INTERACTIVE RADAR & MAP
          </h3>
        </div>

        {/* Overlay Switches */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel text-xs self-end sm:self-auto">
          <button
            onClick={() => setActiveLayer('precipitation')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeLayer === 'precipitation'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'var(--radar-btn-inactive)'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Radar</span>
          </button>
          <button
            onClick={() => setActiveLayer('temp')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeLayer === 'temp'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'var(--radar-btn-inactive)'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temp</span>
          </button>
          <button
            onClick={() => setActiveLayer('clouds')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeLayer === 'clouds'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'var(--radar-btn-inactive)'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Clouds</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full flex-1 min-h-[350px] rounded-2xl overflow-hidden border border-white/10 shadow-inner mb-3">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        
        {/* Helper overlay tag */}
        <div className="absolute top-3 left-3 z-[1000] px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] text-white font-medium shadow pointer-events-none">
          💡 Click anywhere on the map to search weather
        </div>
      </div>
    </div>
  );
};
