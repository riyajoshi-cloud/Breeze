import React from 'react';
import { Database, RefreshCw, Thermometer, Droplets, Compass, Trash2, Trash } from 'lucide-react';

interface WeatherLogItem {
  _id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  conditions: string;
  createdAt: string;
}

interface WeatherHistoryLogProps {
  logs: WeatherLogItem[];
  onRefresh: () => void;
  isLoading: boolean;
  unitSymbol: string;
  onDeleteLog: (id: string) => void;
  onClearAll: () => void;
}

export const WeatherHistoryLog: React.FC<WeatherHistoryLogProps> = ({
  logs,
  onRefresh,
  isLoading,
  unitSymbol,
  onDeleteLog,
  onClearAll,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl border flex flex-col justify-between">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-emerald-500/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Database className="w-5 h-5 text-emerald-500 animate-pulse-slow" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-nature-primary uppercase">
              Database Observation Records
            </h3>
            <p className="text-xs text-nature-muted">
              Live queries stored in the database 🌱
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {logs.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 font-semibold text-xs transition-all hover:bg-rose-500/20 active:scale-95"
              title="Clear all records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 font-semibold text-xs transition-all hover:bg-emerald-500/20 active:scale-95 disabled:opacity-50"
            title="Refresh Data Log"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Grid or Table layout for records */}
      <div className="overflow-x-auto w-full">
        {logs.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-sm font-medium text-nature-muted">
              No database records logged yet. Query some cities or tap the map to generate log history!
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-emerald-500/10 text-xs font-bold uppercase tracking-wider text-nature-muted">
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Co-ordinates</th>
                <th className="py-2.5 px-3">Temperature</th>
                <th className="py-2.5 px-3">Humidity</th>
                <th className="py-2.5 px-3">Weather Condition</th>
                <th className="py-2.5 px-3">Logged Time</th>
                <th className="py-2.5 px-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10 text-nature-primary">
              {logs.map((log) => {
                const logTime = new Date(log.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                const logDate = new Date(log.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <tr
                    key={log._id}
                    className="hover:bg-emerald-500/5 transition-colors group"
                  >
                    {/* Location Info */}
                    <td className="py-3 px-3 font-semibold text-base sm:text-sm">
                      📍 {log.name}
                      {log.country && (
                        <span className="text-[10px] ml-1.5 font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                          {log.country}
                        </span>
                      )}
                    </td>

                    {/* Coordinates */}
                    <td className="py-3 px-3 font-mono text-xs text-nature-muted">
                      {log.lat.toFixed(3)}°, {log.lon.toFixed(3)}°
                    </td>

                    {/* Temperature */}
                    <td className="py-3 px-3 font-bold">
                      <span className="inline-flex items-center gap-1">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        {log.temp}
                        {unitSymbol}
                      </span>
                    </td>

                    {/* Humidity */}
                    <td className="py-3 px-3 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Droplets className="w-4 h-4 text-cyan-500" />
                        {log.humidity}%
                      </span>
                    </td>

                    {/* Conditions */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-500 group-hover:scale-105 transition-transform">
                        <Compass className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
                        {log.conditions}
                      </span>
                    </td>

                    {/* Time logged */}
                    <td className="py-3 px-3 text-xs text-nature-muted">
                      <div className="font-semibold">{logTime}</div>
                      <div className="text-[10px] text-nature-muted/70">{logDate}</div>
                    </td>

                    {/* Actions cell */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDeleteLog(log._id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 active:scale-95 transition-all text-xs font-bold"
                        title="Delete this observation record"
                      >
                        <Trash className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
