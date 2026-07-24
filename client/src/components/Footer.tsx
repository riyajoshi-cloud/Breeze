import React from 'react';
import { Leaf, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="w-full mt-16 border-t px-6 lg:px-12 py-10 transition-all duration-300"
      style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--header-border)',
        boxShadow: '0 -8px 32px rgba(72, 187, 120, 0.05)',
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
        
        {/* App Info & Branding */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2.5">
            <Leaf className="w-7 h-7 text-emerald-500 animate-pulse-slow" />
            <div className="text-left">
              <h2
                className="logo-cursive text-3.5xl font-normal leading-tight tracking-wide"
                style={{
                  background: 'linear-gradient(90deg, #059669, #0ea5e9, #10b981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Breeze
              </h2>
              <p className="text-[9px] font-bold tracking-widest text-emerald-700 dark:text-emerald-500 uppercase -mt-1">
                atmosphere analytics
              </p>
            </div>
          </div>
          
          <p className="text-xs text-nature-muted leading-relaxed max-w-md mx-auto">
            An immersive atmospheric utility tracking temperatures, air qualities, forecasts, and interactive wind radars across global coordinates. Designed with custom glassmorphism components.
          </p>
        </div>

        {/* Separator / Bottom Bar */}
        <div
          className="w-full pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left"
          style={{ borderColor: 'var(--header-border)' }}
        >
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-nature-muted">
              © 2026 Breeze. All rights reserved. • Created with 💚 by Riya.
            </p>
            <p className="text-[9px] text-nature-muted/70">
              WeatherData retrieved in real-time. Map tiles © OpenStreetMap under ODbL.
            </p>
          </div>
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderColor: 'var(--header-border)',
              color: 'var(--text-sky)',
              boxShadow: 'var(--glass-shadow)',
            }}
            title="Back to top"
          >
            Top of Atmosphere <ArrowUp className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
          </button>
        </div>

      </div>
    </footer>
  );
};
