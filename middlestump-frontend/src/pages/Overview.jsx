import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessContext } from '../hooks/useBusinessContext';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns, getOpportunities } from '../api/client';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SegmentBadge } from '../components/ui/SegmentBadge';
import { Sparkles } from 'lucide-react';

export function Overview() {
  const navigate = useNavigate();
  const [opportunityMode, setOpportunityMode] = useState('static');
  const [aiOpportunities, setAiOpportunities] = useState([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  
  const { data: context, isLoading: isContextLoading } = useBusinessContext();
  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  if (isContextLoading || isCampaignsLoading) {
    return <div className="flex items-center justify-center h-full text-text-muted">Loading dashboard...</div>;
  }

  const recentCampaigns = campaigns?.slice(0, 3) || [];
  
  const handleFindOpportunities = async () => {
    setLoadingOpportunities(true);
    setOpportunityMode('ai');
    try {
      const data = await getOpportunities();
      setAiOpportunities(data);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  // Format segments data
  const segmentHealth = [
    { id: 'lapsed_6m', name: 'Lapsed (6m+)', count: context?.segment_sizes?.lapsed_6m || 0, desc: 'Shoppers who haven\'t purchased in over 6 months.', suggested_goal: 'Re-engage lapsed shoppers who haven\'t ordered in over 6 months' },
    { id: 'high_value', name: 'High Value', count: context?.segment_sizes?.high_value || 0, desc: 'Top tier spenders.', suggested_goal: 'Reward high value shoppers with exclusive early access to new gear' },
    { id: 'churn_risk', name: 'Churn Risk', count: context?.segment_sizes?.churn_risk || 0, desc: 'Showing signs of disengagement.', suggested_goal: 'Re-engage churn risk shoppers who were buying regularly but have gone silent' },
    { id: 'ipl_buyers', name: 'IPL Season Buyers', count: context?.segment_sizes?.ipl_buyers || 0, desc: 'Purchased during previous IPL seasons.', suggested_goal: 'Target IPL season buyers with new season gear recommendations' },
    { id: 'first_timers', name: 'First Timers', count: context?.segment_sizes?.first_timers || 0, desc: 'Made exactly one purchase recently.', suggested_goal: 'Nudge first time buyers to make their second purchase with a loyalty discount' },
    { id: 'academy_coaches', name: 'Academy Coaches', count: context?.segment_sizes?.academy_coaches || 0, desc: 'High volume equipment buyers.', suggested_goal: 'Reach academy coaches with bulk restock offers ahead of tournament season' },
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
        <div className="flex justify-between items-end mb-1">
          <h2 className="text-xl font-bold text-text-primary">Segment Health</h2>
          <div className="flex items-center space-x-4">
            {opportunityMode === 'ai' && (
              <button 
                onClick={() => setOpportunityMode('static')}
                className="text-sm text-text-secondary hover:text-text-primary underline underline-offset-2"
              >
                ← Back to segments
              </button>
            )}
            <button 
              onClick={handleFindOpportunities}
              disabled={loadingOpportunities}
              className="flex items-center text-sm font-semibold text-primary border border-primary px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingOpportunities ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find New Opportunities with AI
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-text-secondary mb-4">AI-identified opportunities in your shopper base</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunityMode === 'static' && segmentHealth.map(seg => (
            <div key={seg.id} className="bg-surface border border-border p-5 rounded-lg flex flex-col hover:border-primary/50 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-text-primary">{seg.name}</h3>
                <span className="text-2xl font-bold text-primary">{seg.count}</span>
              </div>
              <p className="text-sm text-text-secondary mb-4 flex-1">{seg.desc}</p>
              <button 
                onClick={() => navigate('/campaign', { state: { prefillGoal: seg.suggested_goal } })}
                className="text-primary text-sm font-semibold hover:text-primary-hover self-start mt-auto flex items-center"
              >
                Create Campaign <span className="ml-1">→</span>
              </button>
            </div>
          ))}

          {opportunityMode === 'ai' && loadingOpportunities && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface border border-border p-5 rounded-lg flex flex-col shadow-sm h-[180px] animate-pulse">
                  <div className="flex justify-between mb-3">
                    <div className="h-5 bg-border rounded w-1/3"></div>
                    <div className="h-5 bg-border rounded w-1/4"></div>
                  </div>
                  <div className="h-4 bg-border rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-border rounded w-1/2 mb-auto"></div>
                  <div className="h-8 bg-border rounded w-full mt-4"></div>
                </div>
              ))}
              <div className="col-span-full text-center text-text-secondary mt-4 animate-pulse">
                AI is analyzing your shopper base... this may take up to 30 seconds
              </div>
            </>
          )}

          {opportunityMode === 'ai' && !loadingOpportunities && aiOpportunities.map((opp, i) => (
            <div key={i} className="bg-surface border border-border p-5 rounded-lg flex flex-col hover:border-primary/50 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <h3 className="font-bold text-text-primary text-[15px] leading-tight mb-1">{opp.title}</h3>
                  <span className="text-xs text-text-muted">{opp.segment_name}</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${
                    opp.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                    opp.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {opp.priority} priority
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-surface2 text-text-secondary rounded-sm border border-border">
                    {opp.suggested_channel}
                  </span>
                </div>
              </div>
              
              <p className="text-[13px] text-text-secondary mb-3 line-clamp-2">{opp.why_it_matters}</p>
              
              <div className="flex justify-between items-center text-sm mb-4 mt-auto">
                <div className="flex items-center text-text-primary font-medium">
                  <span className="mr-1.5">👥</span> {opp.estimated_reach} shoppers
                </div>
                <div className="flex items-center text-green-500 font-medium">
                  <span className="mr-1.5">💰</span> Est. ₹{opp.estimated_revenue.toLocaleString('en-IN')}
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/campaign', { state: { prefillGoal: opp.suggested_goal } })}
                className="w-full text-center bg-primary/10 text-primary text-sm font-semibold py-2 rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                Create Campaign →
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
