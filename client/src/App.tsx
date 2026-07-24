import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroWeatherCard } from './components/HeroWeatherCard';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherMap } from './components/WeatherMap';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Footer } from './components/Footer';
import { LocationInfo, WeatherData, FavoriteItem } from './types/weather';
import { fetchWeatherByCoords } from './services/weatherClient';
import { getFavorites, addFavorite, deleteFavorite } from './services/localFavorites';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo>({
    name: 'Dehradun',
    state: 'Uttarakhand',
    country: 'India',
    lat: 30.3165,
    lon: 78.0322,
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // ─── Theme ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ─── Favorites (localStorage — zero backend) ──────────────────────────────
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const refreshFavorites = useCallback(() => setFavorites(getFavorites()), []);

  // ─── Weather fetch (Open-Meteo directly — zero backend) ───────────────────
  const loadWeather = useCallback(
    async (loc: LocationInfo, unitPref: 'metric' | 'imperial') => {
      setIsWeatherLoading(true);
      setWeatherError(null);
      try {
        const isCoords =
          /^-?\d+(\.\d+)?°,\s*-?\d+(\.\d+)?°$/.test(loc.name) ||
          loc.country === 'Coordinates';

        const data = await fetchWeatherByCoords(
          loc.lat,
          loc.lon,
          unitPref,
          isCoords ? undefined : loc.name,
          isCoords ? undefined : loc.country,
          isCoords ? undefined : loc.state,
        );

        setWeatherData(data);

        // Resolve coord-based location name after reverse geocoding
        if (isCoords && data.location.name && data.location.name !== loc.name) {
          setSelectedLocation({
            name: data.location.name,
            country: data.location.country,
            state: data.location.state,
            lat: loc.lat,
            lon: loc.lon,
          });
        }
      } catch (err: any) {
        setWeatherError(err?.message || 'Weather service encountered a temporary issue.');
      } finally {
        setIsWeatherLoading(false);
      }
    },
    [],
  );

  // Fetch weather whenever location or units change
  useEffect(() => {
    loadWeather(selectedLocation, units);
  }, [selectedLocation, units, loadWeather]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectLocation = (loc: LocationInfo) => setSelectedLocation(loc);

  const handleToggleTheme = () =>
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const handleToggleUnits = () =>
    setUnits(prev => (prev === 'metric' ? 'imperial' : 'metric'));

  const isCurrentFavorite = favorites.some(
    f => Math.abs(f.lat - selectedLocation.lat) < 0.05 && Math.abs(f.lon - selectedLocation.lon) < 0.05,
  );

  const currentFavoriteItem = favorites.find(
    f => Math.abs(f.lat - selectedLocation.lat) < 0.05 && Math.abs(f.lon - selectedLocation.lon) < 0.05,
  );

  const handleToggleFavorite = () => {
    try {
      if (isCurrentFavorite && currentFavoriteItem) {
        deleteFavorite(currentFavoriteItem._id);
        refreshFavorites();
        showToast('Location removed from favorites');
      } else {
        const newFav = addFavorite(selectedLocation);
        refreshFavorites();
        showToast(`Saved ${newFav.name} to favorites!`);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to update favorites', 'error');
    }
  };

  const handleDeleteFavorite = (id: string) => {
    deleteFavorite(id);
    refreshFavorites();
    showToast('Location removed from favorites');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setSelectedLocation({
          name: 'Current Location',
          country: 'Coordinates',
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsGeolocating(false);
        showToast('Updated to your current location!');
      },
      err => {
        console.error(err);
        setIsGeolocating(false);
        showToast('Unable to retrieve location. Using default.', 'error');
      },
      { timeout: 10000 },
    );
  };

  const handleMapClick = (lat: number, lon: number) => {
    setSelectedLocation({
      name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      country: 'Coordinates',
      lat,
      lon,
    });
  };

  const unitSymbol = units === 'imperial' ? '°F' : '°C';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col justify-between pb-12 text-nature-primary select-text">
      {/* Shiny blue viewport corner glowing animation */}
      <div className="screen-corner-glow" />

      {/* Top Header */}
      <Header
        onSelectLocation={handleSelectLocation}
        units={units}
        onToggleUnits={handleToggleUnits}
        onUseCurrentLocation={handleUseCurrentLocation}
        favoritesCount={favorites.length}
        onToggleFavoritesDrawer={() => setIsFavoritesDrawerOpen(true)}
        isGeolocating={isGeolocating}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
            style={
              toast.type === 'success'
                ? {
                    background: 'var(--toast-success-bg)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--toast-success-border)',
                    color: 'var(--toast-success-text)',
                    boxShadow: '0 8px 24px rgba(72,187,120,0.25)',
                  }
                : {
                    background: 'var(--toast-error-bg)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--toast-error-border)',
                    color: 'var(--toast-error-text)',
                    boxShadow: '0 8px 24px rgba(239,68,68,0.2)',
                  }
            }
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" style={{ color: '#059669' }} />
            ) : (
              <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 w-full flex-1">

        {isWeatherLoading ? (
          <SkeletonLoader />
        ) : weatherError ? (
          <div
            className="rounded-3xl p-12 text-center max-w-lg mx-auto my-12"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(252,165,165,0.4)',
              boxShadow: '0 8px 32px rgba(239,68,68,0.1)',
            }}
          >
            <AlertCircle className="w-16 h-16 mx-auto mb-4 animate-bounce" style={{ color: '#f87171' }} />
            <h3 className="text-2xl font-bold mb-2">Unable to Load Weather 🌧️</h3>
            <p className="text-sm mb-6 text-nature-muted">{weatherError}</p>
            <button
              onClick={() => loadWeather(selectedLocation, units)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, #059669, #0369a1)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(5,150,105,0.3)',
              }}
            >
              <RefreshCw className="w-4 h-4" /> Retry Request 🔄
            </button>
          </div>
        ) : weatherData ? (
          <div className="space-y-6">

            {/* Hero Card */}
            <div id="hero-weather-card">
              <HeroWeatherCard
                data={weatherData}
                isFavorite={isCurrentFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>

            {/* 24-Hour Forecast */}
            <div id="hourly-forecast">
              <HourlyForecast hourly={weatherData.hourly} unitSymbol={unitSymbol} />
            </div>

            {/* Grid: 7-Day Daily Breakdown + Interactive Leaflet Radar Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div id="daily-forecast" className="lg:col-span-6">
                <DailyForecast daily={weatherData.daily} unitSymbol={unitSymbol} />
              </div>
              <div id="weather-map" className="lg:col-span-6">
                <WeatherMap
                  location={weatherData.location}
                  temp={weatherData.current.temp}
                  unitSymbol={unitSymbol}
                  theme={theme}
                  onMapClick={handleMapClick}
                />
              </div>
            </div>

          </div>
        ) : null}

      </main>

      {/* Favorites Drawer Sidebar */}
      <FavoritesSidebar
        isOpen={isFavoritesDrawerOpen}
        onClose={() => setIsFavoritesDrawerOpen(false)}
        favorites={favorites}
        onSelectFavorite={loc => { setSelectedLocation(loc); setIsFavoritesDrawerOpen(false); }}
        onDeleteFavorite={handleDeleteFavorite}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
};
