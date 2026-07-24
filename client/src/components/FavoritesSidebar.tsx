import React from 'react';
import { X, Heart, MapPin, Trash2, TreePine } from 'lucide-react';
import { FavoriteItem, LocationInfo } from '../types/weather';

interface FavoritesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onSelectFavorite: (loc: LocationInfo) => void;
  onDeleteFavorite: (id: string) => void;
}

export const FavoritesSidebar: React.FC<FavoritesSidebarProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectFavorite,
  onDeleteFavorite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(209,250,229,0.35)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md h-full flex flex-col p-6 overflow-y-auto"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(209,250,229,0.8) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(134,239,172,0.5)',
          boxShadow: '-8px 0 40px rgba(72,187,120,0.15)',
        }}
      >

        {/* Decorative trees */}
        <div className="absolute bottom-4 right-4 text-6xl select-none pointer-events-none opacity-10 tree-sway">🌲</div>
        <div className="absolute bottom-4 right-20 text-4xl select-none pointer-events-none opacity-8 tree-sway-slow">🌳</div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 relative z-10"
          style={{ borderBottom: '1px solid rgba(134,239,172,0.4)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(253,242,248,0.7)', border: '1px solid rgba(249,168,212,0.4)' }}>
              <Heart className="w-5 h-5" style={{ color: '#ec4899', fill: '#ec4899' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: '#0d4a2e' }}>Saved Locations</h3>
              <p className="text-xs font-medium" style={{ color: '#4a7c5e' }}>{favorites.length} places stored 🌿</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(134,239,172,0.3)', color: '#059669' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Locations List */}
        <div className="space-y-3 flex-1 relative z-10">
          {favorites.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl"
              style={{ border: '2px dashed rgba(134,239,172,0.5)', background: 'rgba(209,250,229,0.3)' }}>
              <TreePine className="w-14 h-14 mx-auto mb-3" style={{ color: 'rgba(52,211,153,0.5)' }} />
              <p className="font-semibold" style={{ color: '#065f46' }}>No saved locations yet</p>
              <p className="text-xs mt-1" style={{ color: '#4a7c5e' }}>
                Click the 💚 heart on any city card to save it here.
              </p>
            </div>
          ) : (
            favorites.map(fav => (
              <div key={fav._id}
                className="group flex items-center justify-between p-4 rounded-2xl transition-all"
                style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(134,239,172,0.3)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(209,250,229,0.65)';
                  e.currentTarget.style.borderColor = 'rgba(52,211,153,0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.55)';
                  e.currentTarget.style.borderColor = 'rgba(134,239,172,0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <button
                  className="flex-1 text-left flex items-start gap-3"
                  onClick={() => { onSelectFavorite({ name: fav.name, country: fav.country, state: fav.state, lat: fav.lat, lon: fav.lon }); onClose(); }}
                >
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#059669' }} />
                  <div>
                    <h4 className="font-bold text-base" style={{ color: '#0d4a2e' }}>🌿 {fav.name}</h4>
                    <p className="text-xs" style={{ color: '#4a7c5e' }}>
                      {fav.state ? `${fav.state}, ` : ''}{fav.country}
                    </p>
                  </div>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteFavorite(fav._id); }}
                  className="p-2 rounded-xl transition-all"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(254,202,202,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 text-center relative z-10" style={{ borderTop: '1px solid rgba(134,239,172,0.3)', marginTop: '1rem' }}>
          <p className="text-xs" style={{ color: '#4a7c5e' }}>
            🌱 Explore the world's weather
          </p>
        </div>
      </div>
    </div>
  );
};
