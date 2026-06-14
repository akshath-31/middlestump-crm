import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, List, Users, X, Target, BarChart, RefreshCw, TrendingUp, Sparkles } from 'lucide-react';
import logo from '../../assets/logo.png';

export function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/campaign', icon: Sparkles, label: 'AI Strategist' },
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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-sidebar-active/50 hover:bg-sidebar-active/80 transition-colors rounded-xl p-4 border border-sidebar-active text-left group"
        >
          <div className="flex items-center mb-1">
            <span className="text-lg mr-2">✨</span>
            <span className="text-white font-medium text-xs uppercase tracking-wide">AI Strategist</span>
          </div>
          <p className="text-[12px] text-text-muted leading-relaxed group-hover:text-white transition-colors mt-2 font-medium">
            Click to see what I can do &rarr;
          </p>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-[480px] rounded-[16px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h2 className="text-xl font-serif font-bold text-text-primary flex items-center">
                <span className="mr-2">✨</span> What your AI Strategist does
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors bg-surface2 hover:bg-border rounded-full p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex">
                <div className="mt-0.5 mr-4 flex-shrink-0 bg-primary/10 w-[36px] h-[36px] flex items-center justify-center rounded-lg text-primary">
                  <Target className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-1">Smart Segmentation</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Analyzes your shoppers to find high-value audiences like lapsed buyers, churn risks, IPL season buyers, and more based on real purchase history.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mt-0.5 mr-4 flex-shrink-0 bg-primary/10 w-[36px] h-[36px] flex items-center justify-center rounded-lg text-primary">
                  <LayoutDashboard className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-1">Campaign Strategy</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Recommends who to target, what to say, and which channel works best with reasoning for every decision, not just a message generator.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mt-0.5 mr-4 flex-shrink-0 bg-primary/10 w-[36px] h-[36px] flex items-center justify-center rounded-lg text-primary">
                  <MessageSquare className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-1">Personalized Messaging</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Generates unique messages per shopper using their name, last purchase, and order history across WhatsApp, SMS, and Email.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mt-0.5 mr-4 flex-shrink-0 bg-primary/10 w-[36px] h-[36px] flex items-center justify-center rounded-lg text-primary">
                  <TrendingUp className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-1">Performance Analysis</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Compares actual campaign results against predictions using AI to suggest actionable next steps.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mt-0.5 mr-4 flex-shrink-0 bg-primary/10 w-[36px] h-[36px] flex items-center justify-center rounded-lg text-primary">
                  <RefreshCw className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-1">Continuous Opportunities</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Scans your business data on demand to surface fresh campaign ideas as your shopper base changes.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mt-0.5 mr-4 flex-shrink-0 bg-primary/10 w-[36px] h-[36px] flex items-center justify-center rounded-lg text-primary">
                  <BarChart className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-1">Performance Prediction</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Forecasts open rates, click rates, and conversions before you send.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
