import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessContext } from '../hooks/useBusinessContext';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns, getOpportunities } from '../api/client';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SegmentBadge } from '../components/ui/SegmentBadge';
import { Sparkles, MessageCircle, MessageSquare, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { humanizeSegmentTerms } from '../utils/formatters';

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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentConversions = campaigns?.filter(c => new Date(c.created_at) >= thirtyDaysAgo)
    .reduce((sum, c) => sum + (c.total_converted || 0), 0) || 0;

  const totalConvertedAll = campaigns?.reduce((sum, c) => sum + (c.total_converted || 0), 0) || 0;
  const totalSentAll = campaigns?.reduce((sum, c) => sum + (c.total_sent || 0), 0) || 0;
  const overallConversionRate = totalSentAll > 0 ? ((totalConvertedAll / totalSentAll) * 100).toFixed(1) : "0.0";
  
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text-primary mb-2 tracking-tight">Dashboard</h1>
          <p className="text-text-secondary text-sm">Welcome back. Here's what's happening with your shoppers today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Shoppers" value={context?.total_shoppers?.toLocaleString() || '0'} color="green" />
        <StatCard title="Total Campaigns" value={campaigns?.length?.toLocaleString() || '0'} color="blue" />
        <StatCard title="Conversions Last 30 Days" value={recentConversions.toLocaleString()} color="green" />
        <StatCard title="Overall Conversion Rate" value={`${overallConversionRate}%`} color="green" />
      </div>

      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid rgba(22, 163, 74, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'radial-gradient(circle, rgba(22, 163, 74, 0.08) 0%, transparent 70%)',
          width: '400px', height: '400px',
          position: 'absolute', top: '-20%', right: '-10%',
          pointerEvents: 'none'
        }}></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="font-serif text-[20px] font-bold text-text-primary flex items-center mb-1">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              AI Opportunities
            </h2>
            <p className="font-sans text-[13px] text-text-muted font-normal">Let AI identify your best campaign targets right now.</p>
          </div>
          <button
            onClick={handleFindOpportunities}
            disabled={loadingOpportunities}
            className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 border border-primary text-primary bg-transparent rounded-full text-sm font-medium hover:bg-primary/5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loadingOpportunities ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {aiOpportunities === null ? "Find Opportunities with AI" : "Find New Opportunities"}
              </>
            )}
          </button>
        </div>

        {loadingOpportunities ? (
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{
                  background: '#F1F5F9',
                  borderRadius: '12px',
                  height: '180px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}></div>
              ))}
            </div>
            <p className="text-center text-text-muted text-sm mt-6">AI is analyzing your shopper base... this may take up to 20 seconds</p>
          </div>
        ) : aiOpportunities !== null ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {aiOpportunities.map((opp, idx) => (
              <div key={idx} style={{
                background: '#F8FAFC',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div className="flex justify-between items-start mb-3">
                  <span style={{
                    display: 'inline-block',
                    borderRadius: '9999px',
                    padding: '2px 10px',
                    fontSize: '11px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    ...(opp.priority === 'high' 
                      ? { background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }
                      : opp.priority === 'medium'
                        ? { background: 'rgba(217, 119, 6, 0.1)', color: '#D97706' }
                        : { background: '#F1F5F9', color: '#64748B' }
                    )
                  }}>
                    {opp.priority}
                  </span>
                  {opp.suggested_channel === 'whatsapp' && <MessageCircle className="w-4 h-4 text-slate-500" />}
                  {opp.suggested_channel === 'sms' && <MessageSquare className="w-4 h-4 text-slate-500" />}
                  {opp.suggested_channel === 'email' && <Mail className="w-4 h-4 text-slate-500" />}
                </div>

                <h3 className="font-serif font-bold text-[16px] text-text-primary leading-tight mb-1">{opp.title}</h3>
                <p className="font-sans text-[11px] uppercase tracking-wide text-text-muted mb-3">{opp.segment_name}</p>

                <p className="font-sans text-[13px] text-text-secondary line-clamp-2 mb-4 flex-1">
                  {humanizeSegmentTerms(opp.why_it_matters)}
                </p>

                <div className="flex items-center justify-between text-sm font-medium mb-4">
                  <span className="flex items-center text-text-primary">
                    👥 {opp.estimated_reach?.toLocaleString() || 0} shoppers
                  </span>
                  <span className="text-text-primary">
                    💰 ₹{opp.estimated_revenue?.toLocaleString('en-IN') || 0}
                  </span>
                </div>

                <button 
                  onClick={() => handleCreateCampaign(opp.suggested_goal)}
                  className="font-sans text-[#16A34A] text-[13px] font-medium hover:underline self-start flex items-center group"
                >
                  Create Campaign <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <h2 className="font-serif text-2xl font-bold text-text-primary mb-4">Recent Campaigns</h2>
        <div className="bg-surface border border-border/70 rounded-xl overflow-hidden shadow-sm">
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
                    <td className="px-6 py-4 font-serif font-bold text-text-primary text-base">{c.name}</td>
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
