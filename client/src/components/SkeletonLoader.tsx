import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Card Skeleton */}
      <div className="rounded-3xl p-8 h-80 flex flex-col justify-between"
        style={{
          background: 'rgba(209,250,229,0.4)',
          border: '1px solid rgba(134,239,172,0.3)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 rounded-xl" style={{ background: 'rgba(167,243,208,0.6)' }} />
          <div className="h-10 w-10 rounded-2xl" style={{ background: 'rgba(167,243,208,0.6)' }} />
        </div>
        <div className="flex items-center gap-6 my-4">
          <div className="w-24 h-24 rounded-3xl" style={{ background: 'rgba(167,243,208,0.6)' }} />
          <div className="space-y-2">
            <div className="h-16 w-32 rounded-xl" style={{ background: 'rgba(167,243,208,0.6)' }} />
            <div className="h-5 w-40 rounded-lg" style={{ background: 'rgba(167,243,208,0.6)' }} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 rounded-xl" style={{ background: 'rgba(167,243,208,0.6)' }} />
          ))}
        </div>
      </div>

      {/* Hourly Row Skeleton */}
      <div className="rounded-3xl p-6 h-48"
        style={{ background: 'rgba(186,230,253,0.4)', border: '1px solid rgba(147,197,253,0.3)', backdropFilter: 'blur(12px)' }} />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-3xl p-6 h-72"
          style={{ background: 'rgba(209,250,229,0.4)', border: '1px solid rgba(134,239,172,0.3)', backdropFilter: 'blur(12px)' }} />
        <div className="lg:col-span-6 rounded-3xl p-6 h-72"
          style={{ background: 'rgba(186,230,253,0.4)', border: '1px solid rgba(147,197,253,0.3)', backdropFilter: 'blur(12px)' }} />
      </div>
    </div>
  );
};
