import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Heart,
  ShieldAlert,
  Leaf,
} from 'lucide-react';
import { WeatherData } from '../types/weather';

interface HeroWeatherCardProps {
  data: WeatherData;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return { bg: 'rgba(167,243,208,0.5)', text: '#065f46', border: 'rgba(52,211,153,0.5)' };
  if (aqi <= 100) return { bg: 'rgba(254,240,138,0.5)', text: '#713f12', border: 'rgba(251,191,36,0.5)' };
  if (aqi <= 150) return { bg: 'rgba(254,215,170,0.5)', text: '#7c2d12', border: 'rgba(249,115,22,0.5)' };
  return { bg: 'rgba(254,202,202,0.5)', text: '#7f1d1d', border: 'rgba(239,68,68,0.5)' };
};

const getUVColor = (uv: number) => {
  if (uv <= 2) return '#059669';
  if (uv <= 5) return '#d97706';
  if (uv <= 7) return '#f97316';
  return '#dc2626';
};

export const HeroWeatherCard: React.FC<HeroWeatherCardProps> = ({ data, isFavorite, onToggleFavorite }) => {
  const { location, current, units } = data;
  const unitSymbol = units === 'imperial' ? '°F' : '°C';
  const speedSymbol = units === 'imperial' ? 'mph' : 'km/h';
  const aqiStyle = getAQIColor(current.aqi);

  const renderWeatherIcon = (category: string, isDay: boolean) => {
    const base = 'w-24 h-24 animate-float';
    switch (category) {
      case 'clear':
        return isDay
          ? <Sun className={base} style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 20px rgba(245,158,11,0.5))' }} />
          : <CloudSun className={base} style={{ color: '#7dd3fc', filter: 'drop-shadow(0 0 20px rgba(125,211,252,0.4))' }} />;
      case 'rain':
        return <CloudRain className={base} style={{ color: '#3b82f6', filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.5))' }} />;
      case 'snow':
        return <Snowflake className={base} style={{ color: '#a5b4fc', filter: 'drop-shadow(0 0 20px rgba(165,180,252,0.5))' }} />;
      case 'thunderstorm':
        return <CloudLightning className={base} style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 30px rgba(251,191,36,0.6))' }} />;
      case 'cloudy':
        return <Cloud className={base} style={{ color: '#93c5fd', filter: 'drop-shadow(0 0 16px rgba(147,197,253,0.4))' }} />;
      default:
        return <CloudSun className={base} style={{ color: '#6ee7b7', filter: 'drop-shadow(0 0 16px rgba(110,231,183,0.4))' }} />;
    }
  };

  return (
    <div className="relative rounded-3xl p-6 lg:p-8 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(186,230,253,0.55) 0%, rgba(167,243,208,0.45) 50%, rgba(209,250,229,0.5) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(134,239,172,0.5)',
        boxShadow: '0 12px 48px rgba(72,187,120,0.15), 0 4px 16px rgba(56,178,172,0.1)',
      }}
    >


      {/* Decorative gradient orbs */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(167,243,208,0.3), transparent)' }} />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(186,230,253,0.3), transparent)' }} />

      {/* Header Row */}
      <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {location.name}
            </h2>
            {location.country && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{ background: 'rgba(167,243,208,0.5)', color: 'var(--text-secondary)', border: '1px solid rgba(52,211,153,0.3)' }}>
                {location.country}
              </span>
            )}
          </div>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
            {location.state ? `${location.state} · ` : ''}Updated {new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <button
          onClick={onToggleFavorite}
          className="p-3 rounded-2xl transition-all duration-300"
          style={isFavorite
            ? { background: 'rgba(253,242,248,0.7)', border: '1px solid rgba(249,168,212,0.5)', boxShadow: '0 4px 12px rgba(236,72,153,0.2)' }
            : { background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.5)', color: '#9ca3af' }}
          title={isFavorite ? 'Remove from Favorites' : 'Save Location'}
        >
          <Heart className="w-5 h-5" style={{ color: '#ec4899', fill: isFavorite ? '#ec4899' : 'rgba(236,72,153,0.15)' }} />
        </button>
      </div>

      {/* Main Temperature Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-5 relative z-10"
        style={{ borderTop: '1px solid rgba(134,239,172,0.3)', borderBottom: '1px solid rgba(134,239,172,0.3)', margin: '0 0 20px' }}
      >
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="p-4 rounded-3xl" style={{ background: 'rgba(255,255,255,0.35)', border: '1px solid rgba(134,239,172,0.4)' }}>
            {renderWeatherIcon(current.condition.category, current.isDay)}
          </div>
          <div>
            <div className="flex items-baseline justify-center sm:justify-start">
              <span className="font-black tracking-tighter" style={{ fontSize: '5.5rem', lineHeight: 1, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                {current.temp}
              </span>
              <span className="text-3xl font-bold ml-1" style={{ color: '#059669' }}>{unitSymbol}</span>
            </div>
            <p className="text-xl font-semibold mt-1 flex items-center justify-center sm:justify-start gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Leaf className="w-5 h-5" style={{ color: '#34d399' }} />
              {current.condition.label}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Feels like <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>{current.feelsLike}{unitSymbol}</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {/* AQI */}
          <div className="p-4 rounded-2xl flex flex-col justify-between"
            style={{ background: aqiStyle.bg, border: `1px solid ${aqiStyle.border}` }}>
            <div className="flex items-center justify-between text-xs font-bold mb-2" style={{ color: aqiStyle.text }}>
              <span>AIR QUALITY</span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black" style={{ color: aqiStyle.text }}>{current.aqi} AQI</div>
            <span className="inline-block text-[11px] font-bold mt-1 px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(255,255,255,0.5)', color: aqiStyle.text }}>
              {current.aqiLabel}
            </span>
          </div>

          {/* UV Index */}
          <div className="p-4 rounded-2xl flex flex-col justify-between"
            style={{ background: 'rgba(254,240,138,0.4)', border: '1px solid rgba(251,191,36,0.4)' }}>
            <div className="flex items-center justify-between text-xs font-bold mb-2" style={{ color: '#713f12' }}>
              <span>UV INDEX</span>
              <Sun className="w-4 h-4" style={{ color: '#f59e0b' }} />
            </div>
            <div className="text-2xl font-black" style={{ color: '#92400e' }}>{current.uvIndex} <span className="text-xs font-normal opacity-60">/ 12</span></div>
            <span className="inline-block text-[11px] font-bold mt-1 px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(255,255,255,0.5)', color: getUVColor(current.uvIndex) }}>
              {current.uvIndex <= 2 ? 'Low 🌿' : current.uvIndex <= 5 ? 'Moderate ☀️' : current.uvIndex <= 7 ? 'High 🌞' : 'Very High 🔥'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
        {[
          { icon: <Droplets className="w-5 h-5" style={{ color: '#3b82f6' }} />, label: 'Humidity', value: `${current.humidity}%`, bg: 'rgba(186,230,253,0.5)', border: 'rgba(147,197,253,0.5)' },
          { icon: <Wind className="w-5 h-5" style={{ color: '#059669' }} />, label: 'Wind Speed', value: `${current.windSpeed} ${speedSymbol}`, bg: 'rgba(167,243,208,0.5)', border: 'rgba(52,211,153,0.4)' },
          { icon: <Gauge className="w-5 h-5" style={{ color: '#7c3aed' }} />, label: 'Pressure', value: `${current.pressure} hPa`, bg: 'rgba(221,214,254,0.5)', border: 'rgba(167,139,250,0.4)' },
          { icon: <Eye className="w-5 h-5" style={{ color: '#0369a1' }} />, label: 'Visibility', value: '10 km', bg: 'rgba(186,230,253,0.5)', border: 'rgba(125,211,252,0.4)' },
        ].map((m, i) => (
          <div key={i} className="p-3.5 rounded-xl flex items-center gap-3 transition-all"
            style={{ background: m.bg, border: `1px solid ${m.border}` }}>
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.4)' }}>{m.icon}</div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
              <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
