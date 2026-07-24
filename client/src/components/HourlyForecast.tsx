import React from 'react';
import { Clock, Droplets, Sun, CloudSun, CloudRain, Snowflake, CloudLightning, Cloud } from 'lucide-react';
import { HourlyForecastItem } from '../types/weather';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  unitSymbol: string;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, unitSymbol }) => {
  const getSmallIcon = (category: string) => {
    switch (category) {
      case 'clear': return <Sun className="w-6 h-6" style={{ color: '#f59e0b' }} />;
      case 'cloudy': return <Cloud className="w-6 h-6" style={{ color: '#93c5fd' }} />;
      case 'rain': return <CloudRain className="w-6 h-6" style={{ color: '#3b82f6' }} />;
      case 'snow': return <Snowflake className="w-6 h-6" style={{ color: '#a5b4fc' }} />;
      case 'thunderstorm': return <CloudLightning className="w-6 h-6" style={{ color: '#fbbf24' }} />;
      default: return <CloudSun className="w-6 h-6" style={{ color: '#6ee7b7' }} />;
    }
  };

  return (
    <div className="rounded-3xl p-6 shadow-lg"
      style={{
        background: 'linear-gradient(135deg, rgba(186,230,253,0.5) 0%, rgba(209,250,229,0.45) 100%)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(134,239,172,0.45)',
        boxShadow: '0 8px 32px rgba(72,187,120,0.12)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5" style={{ color: '#059669' }} />
        <h3 className="text-base font-bold tracking-tight" style={{ color: '#0d4a2e' }}>
          HOURLY FORECAST
        </h3>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1">
        {hourly.map((item, idx) => (
          <div
            key={`${item.time}-${idx}`}
            className="flex-shrink-0 w-24 p-3.5 rounded-2xl flex flex-col items-center justify-between text-center transition-all"
            style={{
              background: 'rgba(255,255,255,0.45)',
              border: '1px solid rgba(134,239,172,0.35)',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.65)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(72,187,120,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.45)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span className="text-xs font-semibold" style={{ color: '#4a7c5e' }}>{item.time}</span>
            <div className="my-3">{getSmallIcon(item.condition.category)}</div>
            <span className="text-lg font-bold" style={{ color: '#0d4a2e' }}>{item.temp}{unitSymbol}</span>
            {item.precipitationProbability > 0 ? (
              <div className="flex items-center gap-1 mt-2 text-[11px] font-bold" style={{ color: '#3b82f6' }}>
                <Droplets className="w-3 h-3" />
                <span>{item.precipitationProbability}%</span>
              </div>
            ) : (
              <span className="text-[11px] mt-2" style={{ color: '#9ca3af' }}>0%</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
