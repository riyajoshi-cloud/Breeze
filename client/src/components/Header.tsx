import React, { useState, useEffect, useRef } from 'react';
import { Search, Navigation, Heart, Loader2, MapPin, Sun, Moon, Leaf } from 'lucide-react';
import { LocationInfo } from '../types/weather';
import { searchLocationsApi } from '../services/api';

interface HeaderProps {
  onSelectLocation: (loc: LocationInfo) => void;
  units: 'metric' | 'imperial';
  onToggleUnits: () => void;
  onUseCurrentLocation: () => void;
  favoritesCount: number;
  onToggleFavoritesDrawer: () => void;
  isGeolocating: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectLocation,
  units,
  onToggleUnits,
  onUseCurrentLocation,
  favoritesCount,
  onToggleFavoritesDrawer,
  isGeolocating,
  theme,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await searchLocationsApi(query);
          setResults(res);
          setIsOpen(true);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationInfo) => {
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 lg:px-8 py-3 mb-6"
      style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--header-border)',
        boxShadow: 'var(--header-shadow)',
        transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s'
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* App Logo – Nature Theme */}
        <div className="flex items-center gap-2.5">
          <Leaf className="w-8 h-8 text-emerald-500 animate-pulse-slow" />
          <h1 className="logo-cursive text-4xl leading-tight font-normal tracking-wide"
            style={{ background: 'linear-gradient(90deg, #059669, #0ea5e9, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', paddingBottom: '3px' }}
          >
            Breeze
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#059669' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, country or location..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium glass-input focus:outline-none transition-all"
              style={{ color: 'var(--text-primary)' }}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" style={{ color: '#059669' }} />
            )}
          </div>

          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden shadow-2xl z-50 divide-y max-h-72 overflow-y-auto"
              style={{
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(134,239,172,0.5)',
              }}
            >
              {results.map((item, idx) => (
                <button
                  key={`${item.name}-${item.lat}-${idx}`}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between text-sm transition-colors group"
                  style={{ color: '#1a3a2a' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(167,243,208,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#059669' }} />
                    <div>
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-xs ml-2 text-nature-muted">
                        {item.state ? `${item.state}, ` : ''}{item.country}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono" style={{ color: '#6b7280' }}>
                    {item.lat.toFixed(1)}°, {item.lon.toFixed(1)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">

          <button
            onClick={onUseCurrentLocation}
            disabled={isGeolocating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30"
            title="Use My GPS Location"
          >
            {isGeolocating ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#059669' }} />
            ) : (
              <Navigation className="w-4 h-4" style={{ color: '#059669' }} />
            )}
            <span className="hidden sm:inline">My Location</span>
          </button>

          {/* Unit Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/20">
            <button
              onClick={onToggleUnits}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={units === 'metric'
                ? { background: 'linear-gradient(135deg, #059669, #0369a1)', color: '#fff', boxShadow: '0 2px 8px rgba(5,150,105,0.4)' }
                : { color: 'var(--text-primary)' }}
            >°C</button>
            <button
              onClick={onToggleUnits}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={units === 'imperial'
                ? { background: 'linear-gradient(135deg, #059669, #0369a1)', color: '#fff', boxShadow: '0 2px 8px rgba(5,150,105,0.4)' }
                : { color: 'var(--text-primary)' }}
            >°F</button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center p-2 rounded-xl border transition-all"
            style={theme === 'dark'
              ? { background: 'rgba(30,41,59,0.7)', borderColor: 'rgba(255,255,255,0.15)', color: '#f8fafc' }
              : { background: 'rgba(254,243,199,0.7)', borderColor: 'rgba(245,158,11,0.4)', color: '#d97706' }
            }
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-amber-600" />}
          </button>

          {/* Favorites Tray Button */}
          <button
            onClick={onToggleFavoritesDrawer}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(253,242,248,0.6)', border: '1px solid rgba(249,168,212,0.4)', color: '#9d174d' }}
            title="Open Saved Favorites"
          >
            <Heart className="w-4 h-4" style={{ color: '#ec4899', fill: 'rgba(236,72,153,0.2)' }} />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm" style={{ background: '#ec4899' }}>
                {favoritesCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
