"use client";

import BetTrackerDashboard from "@/components/BetTrackerDashboard";

export default function TestPage() {
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)',
        color: '#ffffff'
      }}
    >
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4" style={{ color: '#ffffff' }}>Test Page - Direct Access</h1>
        <div 
          className="rounded-xl p-6 mb-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#ffffff' }}>Tailwind Test</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>If you can see this styled card, Tailwind is working!</p>
          <div className="mt-4 flex gap-2">
            <button 
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
            >
              Blue Button
            </button>
            <button 
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#15803d'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a'}
            >
              Green Button
            </button>
            <button 
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
            >
              Red Button
            </button>
          </div>
        </div>
        <BetTrackerDashboard experienceId="test-experience-123" />
      </div>
    </div>
  );
}
