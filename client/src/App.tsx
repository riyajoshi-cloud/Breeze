import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from './components/Header';
import { HeroWeatherCard } from './components/HeroWeatherCard';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherMap } from './components/WeatherMap';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Footer } from './components/Footer';
import { LocationInfo, WeatherData, FavoriteItem } from './types/weather';
import {
  fetchWeatherData,
  fetchFavoritesApi,
  addFavoriteApi,
  deleteFavoriteApi,
} from './services/api';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const queryClient = useQueryClient();

  // State
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo>({
    name: 'Dehradun',
    state: 'Uttarakhand',
    country: 'India',
    lat: 30.3165,
    lon: 78.0322,
  });
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Apply theme class to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Weather Query
  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    isError: isWeatherError,
    error: weatherErr,
    refetch: refetchWeather,
  } = useQuery<WeatherData>({
    queryKey: ['weather', selectedLocation.lat, selectedLocation.lon, units],
    queryFn: () => {
      const isCoords = /^-?\d+(\.\d+)?°,\s*-?\d+(\.\d+)?°$/.test(selectedLocation.name) || 
                       selectedLocation.country === 'Coordinates';
      return fetchWeatherData({
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        city: isCoords ? undefined : selectedLocation.name,
        units,
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync selected location name when reverse geocoding resolves coordinates to city names
  useEffect(() => {
    if (weatherData && weatherData.location) {
      const { name, country, state, lat, lon } = weatherData.location;
      const isCoordName = /^-?\d+(\.\d+)?°,\s*-?\d+(\.\d+)?°$/.test(selectedLocation.name) || 
                          selectedLocation.country === 'Coordinates';
      if (isCoordName && name && name !== selectedLocation.name) {
        setSelectedLocation({
          name,
          country,
          state,
          lat,
          lon,
        });
      }
    }
  }, [weatherData, selectedLocation.name, selectedLocation.country]);

  // Favorites Query
  const { data: favorites = [] } = useQuery<FavoriteItem[]>({
    queryKey: ['favorites'],
    queryFn: fetchFavoritesApi,
  });

  // Favorite Mutations
  const addFavoriteMutation = useMutation({
    mutationFn: addFavoriteApi,
    onSuccess: (newFav) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      showToast(`Saved ${newFav.name} to favorites!`);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || 'Failed to save location', 'error');
    },
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: deleteFavoriteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      showToast('Location removed from favorites');
    },
    onError: () => {
      showToast('Failed to remove location', 'error');
    },
  });

  // Check if current location is in favorites
  const isCurrentFavorite = favorites.some(
    (f) =>
      Math.abs(f.lat - selectedLocation.lat) < 0.05 &&
      Math.abs(f.lon - selectedLocation.lon) < 0.05
  );

  const currentFavoriteItem = favorites.find(
    (f) =>
      Math.abs(f.lat - selectedLocation.lat) < 0.05 &&
      Math.abs(f.lon - selectedLocation.lon) < 0.05
  );

  const handleToggleFavorite = () => {
    if (isCurrentFavorite && currentFavoriteItem) {
      deleteFavoriteMutation.mutate(currentFavoriteItem._id);
    } else {
      addFavoriteMutation.mutate(selectedLocation);
    }
  };

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedLocation({
          name: 'Current Location',
          country: '',
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsGeolocating(false);
        showToast('Updated to your current location!');
      },
      (err) => {
        console.error(err);
        setIsGeolocating(false);
        showToast('Unable to retrieve location. Using default.', 'error');
      },
      { timeout: 10000 }
    );
  };

  // Handle map click selection
  const handleMapClick = (lat: number, lon: number) => {
    setSelectedLocation({
      name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      country: '',
      lat,
      lon,
    });
  };

  const unitSymbol = units === 'imperial' ? '°F' : '°C';

  return (
    <div className="min-h-screen flex flex-col justify-between pb-12 text-nature-primary select-text">
      {/* Shiny blue viewport corner glowing animation */}
      <div className="screen-corner-glow" />

      {/* Top Header */}
      <Header
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        units={units}
        onToggleUnits={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
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
        ) : isWeatherError ? (
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
            <p className="text-sm mb-6 text-nature-muted">
              {(weatherErr as any)?.message || 'Weather service encountered a temporary issue.'}
            </p>
            <button
              onClick={() => refetchWeather()}
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
        onSelectFavorite={(loc) => setSelectedLocation(loc)}
        onDeleteFavorite={(id) => deleteFavoriteMutation.mutate(id)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
};
