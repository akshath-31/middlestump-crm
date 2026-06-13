import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    const handleWakingUp = () => setIsWakingUp(true);
    const handleReady = () => setIsWakingUp(false);

    window.addEventListener('backend-waking-up', handleWakingUp);
    window.addEventListener('backend-ready', handleReady);

    return () => {
      window.removeEventListener('backend-waking-up', handleWakingUp);
      window.removeEventListener('backend-ready', handleReady);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {isWakingUp && (
        <div className="absolute top-0 left-0 right-0 bg-amber text-white text-center py-2 text-sm z-50 font-medium animate-in slide-in-from-top flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting to server... (Render free tier may take up to 60s to wake up)
        </div>
      )}
      <Sidebar />
      <main className="ml-[240px] flex-1 h-full overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
