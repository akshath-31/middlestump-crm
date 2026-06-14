import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, List, Users } from 'lucide-react';
import { getContext } from '../../api/client';
import logo from '../../assets/logo.png';

export function Sidebar() {
  const [isApiLive, setIsApiLive] = useState(false);

  useEffect(() => {
    // Ping the backend to check if it's live
    fetch(import.meta.env.VITE_API_BASE_URL)
      .then(res => {
        if (res.ok) setIsApiLive(true);
      })
      .catch(() => setIsApiLive(false));
  }, []);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
    { to: '/campaign', icon: MessageSquare, label: 'Campaign' },
    { to: '/campaigns', icon: List, label: 'Campaigns' },
    { to: '/shoppers', icon: Users, label: 'Shoppers' },
  ];

  return (
    <div className="fixed top-0 left-0 h-screen w-[240px] bg-sidebar flex flex-col z-20">
      <div className="p-6 flex items-center mb-6">
        <img src={logo} alt="MiddleStump Logo" className="w-8 h-8 mr-3 object-contain" />
        <span className="text-white font-bold text-lg tracking-wide">MiddleStump</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-active border-l-2 border-primary text-white'
                  : 'text-text-muted hover:bg-sidebar-active border-l-2 border-transparent'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-active mt-auto">
        <div className="bg-sidebar-active/50 rounded-xl p-4 mb-4 border border-sidebar-active">
          <div className="flex items-center mb-1">
            <span className="text-lg mr-2">✨</span>
            <span className="text-white font-medium text-xs uppercase tracking-wide">AI Strategist</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Your AI assistant is monitoring shopper segments for new revenue opportunities.
          </p>
        </div>
        <div className="flex items-center text-xs text-text-muted">
          <span className={`w-2 h-2 rounded-full mr-2 ${isApiLive ? 'bg-primary' : 'bg-danger'}`}></span>
          MiddleStump CRM
        </div>
      </div>
    </div>
  );
}
