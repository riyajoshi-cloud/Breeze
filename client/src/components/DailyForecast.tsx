import React from 'react';
import { Calendar, Sun, CloudSun, CloudRain, Snowflake, CloudLightning, Cloud } from 'lucide-react';
import { DailyForecastItem } from '../types/weather';

interface DailyForecastProps {
  daily: DailyForecastItem[];
  unitSymbol: string;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, unitSymbol }) => {
  const minTempAll = Math.min(...daily.map(d => d.tempMin));
  const maxTempAll = Math.max(...daily.map(d => d.tempMax));
  const rangeAll = Math.max(1, maxTempAll - minTempAll);

  const getSmallIcon = (category: string) => {
    switch (category) {
      case 'clear': return <Sun className="w-5 h-5" style={{ color: '#f59e0b' }} />;
      case 'cloudy': return <Cloud className="w-5 h-5" style={{ color: '#93c5fd' }} />;
      case 'rain': return <CloudRain className="w-5 h-5" style={{ color: '#3b82f6' }} />;
      case 'snow': return <Snowflake className="w-5 h-5" style={{ color: '#a5b4fc' }} />;
      case 'thunderstorm': return <CloudLightning className="w-5 h-5" style={{ color: '#fbbf24' }} />;
      default: return <CloudSun className="w-5 h-5" style={{ color: '#6ee7b7' }} />;
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-lg h-full">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-emerald-500" />
        <h3 className="text-base font-bold tracking-tight text-nature-primary">
          7-DAY FORECAST
        </h3>
      </div>

      <div className="space-y-2.5">
        {daily.map((day, idx) => {
          const leftPct = Math.max(0, Math.min(80, ((day.tempMin - minTempAll) / rangeAll) * 100));
          const widthPct = Math.max(15, Math.min(100 - leftPct, ((day.tempMax - day.tempMin) / rangeAll) * 100));

          return (
            <div
              key={`${day.date}-${idx}`}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl transition-all duration-300 border border-emerald-500/10 hover:border-emerald-500/35 hover:-translate-y-0.5 hover:shadow-md bg-white/30 dark:bg-slate-900/40 hover:bg-white/50 dark:hover:bg-slate-900/60"
            >
              <div className="w-16 flex-shrink-0">
                <p className="text-sm font-bold text-nature-primary">{day.dayName}</p>
                <p className="text-[10px] font-medium truncate text-nature-muted">{day.condition.label}</p>
              </div>

              <div className="w-8 flex justify-center flex-shrink-0">{getSmallIcon(day.condition.category)}</div>

              <span className="w-12 text-right text-sm font-semibold flex-shrink-0" style={{ color: '#3b82f6' }}>
                {day.tempMin}{unitSymbol}
              </span>

              <div className="flex-1 h-2 rounded-full overflow-hidden relative mx-1 hidden sm:block bg-emerald-500/10 dark:bg-emerald-500/20">
                <div
                  className="absolute h-full rounded-full"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #34d399, #f59e0b)',
                  }}
                />
              </div>

              <span className="w-12 text-left text-sm font-bold flex-shrink-0" style={{ color: '#f59e0b' }}>
                {day.tempMax}{unitSymbol}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
