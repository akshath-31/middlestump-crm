import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessContext } from '../hooks/useBusinessContext';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '../api/client';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SegmentBadge } from '../components/ui/SegmentBadge';

export function Overview() {
  const navigate = useNavigate();
  const { data: context, isLoading: isContextLoading } = useBusinessContext();
  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  if (isContextLoading || isCampaignsLoading) {
    return <div className="flex items-center justify-center h-full text-text-muted">Loading dashboard...</div>;
  }

  const recentCampaigns = campaigns?.slice(0, 3) || [];
  
  // Format segments data
  const segmentHealth = [
    { id: 'lapsed_6m', name: 'Lapsed (6m+)', count: context?.segment_sizes?.lapsed_6m || 0, desc: 'Shoppers who haven\'t purchased in over 6 months.' },
    { id: 'high_value', name: 'High Value', count: context?.segment_sizes?.high_value || 0, desc: 'Top tier spenders.' },
    { id: 'churn_risk', name: 'Churn Risk', count: context?.segment_sizes?.churn_risk || 0, desc: 'Showing signs of disengagement.' },
    { id: 'ipl_buyers', name: 'IPL Season Buyers', count: context?.segment_sizes?.ipl_buyers || 0, desc: 'Purchased during previous IPL seasons.' },
    { id: 'first_timers', name: 'First Timers', count: context?.segment_sizes?.first_timers || 0, desc: 'Made exactly one purchase recently.' },
    { id: 'academy_coaches', name: 'Academy Coaches', count: context?.segment_sizes?.academy_coaches || 0, desc: 'High volume equipment buyers.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Overview</h1>
        <p className="text-text-secondary">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Shoppers" value={context?.total_shoppers?.toLocaleString() || '0'} color="green" />
        <StatCard title="Total Campaigns" value={context?.total_campaigns?.toLocaleString() || '0'} color="blue" />
        <StatCard title="Revenue Last 30 Days" value={`₹${(context?.recent_revenue || 0).toLocaleString('en-IN')}`} color="green" />
        <StatCard title="Revenue Trend" value="+12.5%" subtitle="vs previous 30 days" trend="up" color="green" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-text-primary mb-1">Segment Health</h2>
        <p className="text-sm text-text-secondary mb-4">AI-identified opportunities in your shopper base</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segmentHealth.map(seg => (
            <div key={seg.id} className="bg-surface border border-border p-5 rounded-lg flex flex-col hover:border-primary/50 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-text-primary">{seg.name}</h3>
                <span className="text-2xl font-bold text-primary">{seg.count}</span>
              </div>
              <p className="text-sm text-text-secondary mb-4 flex-1">{seg.desc}</p>
              <button 
                onClick={() => navigate('/campaign', { state: { presetGoal: `Target ${seg.name.toLowerCase()} segment` } })}
                className="text-primary text-sm font-semibold hover:text-primary-hover self-start mt-auto flex items-center"
              >
                Create Campaign <span className="ml-1">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-text-primary mb-4">Recent Campaigns</h2>
        <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface2 text-text-muted uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">Campaign</th>
                <th className="px-6 py-3 font-semibold">Segment</th>
                <th className="px-6 py-3 font-semibold">Channel</th>
                <th className="px-6 py-3 font-semibold">Sent</th>
                <th className="px-6 py-3 font-semibold">Performance</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCampaigns.map(c => {
                const openRate = c.delivered_count ? ((c.opened_count/c.delivered_count)*100).toFixed(1) : 0;
                const clickRate = c.opened_count ? ((c.clicked_count/c.opened_count)*100).toFixed(1) : 0;
                return (
                  <tr key={c.id} onClick={() => navigate('/campaigns')} className="border-b border-border hover:bg-surface2 cursor-pointer transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">{c.name}</td>
                    <td className="px-6 py-4"><SegmentBadge segment={c.target_segment} /></td>
                    <td className="px-6 py-4 uppercase text-xs font-semibold">{c.channel}</td>
                    <td className="px-6 py-4 font-medium">{c.sent_count}</td>
                    <td className="px-6 py-4 text-text-secondary">
                      <span className="text-amber font-medium">{openRate}%</span> open · <span className="text-primary font-medium">{clickRate}%</span> click
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                  </tr>
                );
              })}
              {recentCampaigns.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-text-muted">No recent campaigns.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
