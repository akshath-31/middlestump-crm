import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessContext } from '../hooks/useBusinessContext';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns, getOpportunities } from '../api/client';
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

  const [aiOpportunities, setAiOpportunities] = useState(null);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);

  const handleFindOpportunities = async () => {
    setLoadingOpportunities(true);
    try {
      const data = await getOpportunities();
      setAiOpportunities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const handleCreateCampaign = (suggestedGoal) => {
    navigate('/campaign', { state: { prefillGoal: suggestedGoal } });
  };

  if (isContextLoading || isCampaignsLoading) {
    return <div className="flex items-center justify-center h-full text-text-muted">Loading dashboard...</div>;
  }

  const recentCampaigns = campaigns?.slice(0, 3) || [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentConversions = campaigns?.filter(c => new Date(c.created_at) >= thirtyDaysAgo)
    .reduce((sum, c) => sum + (c.total_converted || 0), 0) || 0;

  const totalConvertedAll = campaigns?.reduce((sum, c) => sum + (c.total_converted || 0), 0) || 0;
  const totalSentAll = campaigns?.reduce((sum, c) => sum + (c.total_sent || 0), 0) || 0;
  const overallConversionRate = totalSentAll > 0 ? ((totalConvertedAll / totalSentAll) * 100).toFixed(1) : "0.0";
  
  const overallConversionRate = totalSentAll > 0 ? ((totalConvertedAll / totalSentAll) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Overview</h1>
        <p className="text-text-secondary">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Shoppers" value={context?.total_shoppers?.toLocaleString() || '0'} color="green" />
        <StatCard title="Total Campaigns" value={campaigns?.length?.toLocaleString() || '0'} color="blue" />
        <StatCard title="Conversions Last 30 Days" value={recentConversions.toLocaleString()} color="green" />
        <StatCard title="Overall Conversion Rate" value={`${overallConversionRate}%`} color="green" />
      </div>

      <div className="bg-surface border border-border rounded-lg p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">AI Opportunities</h2>
        <p className="text-text-secondary text-center mb-8 max-w-md">Let AI identify your best campaign targets right now</p>
        
        {loadingOpportunities ? (
          <div className="flex flex-col items-center w-full">
            <button disabled className="bg-primary/50 text-white font-semibold py-3 px-6 rounded-full flex items-center transition-all cursor-not-allowed mb-8">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Thinking...
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse bg-surface2 border border-border p-5 rounded-lg h-40"></div>
              ))}
            </div>
            <p className="text-sm text-text-muted mt-6 text-center">AI is analyzing your shopper base... this may take up to 20 seconds</p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <button 
              onClick={handleFindOpportunities}
              className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-full flex items-center transition-all mb-8 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {aiOpportunities ? '🔄 Find New Opportunities' : '✨ Find Opportunities with AI'}
            </button>
            
            {aiOpportunities && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {aiOpportunities.map((opp, idx) => (
                  <div key={idx} className="bg-surface border border-border p-5 rounded-lg flex flex-col hover:border-primary/50 transition-colors shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${opp.priority === 'high' ? 'bg-red-500/10 text-red-500' : opp.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-500'}`}>
                        {opp.priority}
                      </span>
                      <span className="text-xs uppercase font-semibold text-text-muted bg-surface2 px-2 py-1 rounded-sm">
                        {opp.suggested_channel}
                      </span>
                    </div>
                    <h3 className="font-bold text-[15px] text-text-primary mb-1">{opp.title}</h3>
                    <p className="text-xs text-text-muted mb-3 font-medium">{opp.segment_name}</p>
                    <p className="text-[13px] text-text-secondary mb-4 flex-1 line-clamp-2">{opp.why_it_matters}</p>
                    <div className="flex flex-col space-y-1 mb-5">
                      <span className="text-sm text-text-primary font-medium">👥 {opp.estimated_reach.toLocaleString()} shoppers</span>
                      <span className="text-sm text-text-primary font-medium">💰 Est. ₹{opp.estimated_revenue.toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => handleCreateCampaign(opp.suggested_goal)}
                      className="w-full bg-surface2 hover:bg-primary hover:text-white text-primary text-sm font-semibold py-2 rounded transition-colors flex items-center justify-center group-hover:bg-primary group-hover:text-white"
                    >
                      Create Campaign <span className="ml-2">→</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
                const openRate = c.total_delivered ? ((c.total_opened / c.total_delivered) * 100).toFixed(1) : "0.0";
                const clickRate = c.total_opened ? ((c.total_clicked / c.total_opened) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={c.id} onClick={() => navigate('/campaigns')} className="border-b border-border hover:bg-surface2 cursor-pointer transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">{c.name}</td>
                    <td className="px-6 py-4"><SegmentBadge segment={c.target_segment_name} /></td>
                    <td className="px-6 py-4 uppercase text-xs font-semibold">{c.channel}</td>
                    <td className="px-6 py-4 font-medium">{c.total_sent || c.sent_count || 0}</td>
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
