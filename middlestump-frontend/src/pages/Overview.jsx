import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessContext } from '../hooks/useBusinessContext';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns, getOpportunities } from '../api/client';
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

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="font-serif text-[32px] font-bold text-text-primary mb-2 leading-tight">Overview</h2>
          <p className="font-sans text-[14px] text-text-secondary">Your cricket store's performance at a glance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-xl border border-border/70 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-sans text-xs text-text-secondary uppercase tracking-widest mb-4 font-semibold">Total Shoppers</p>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[40px] font-bold text-text-primary leading-tight">{context?.total_shoppers?.toLocaleString() || '0'}</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-border/70 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-sans text-xs text-text-secondary uppercase tracking-widest mb-4 font-semibold">Live Campaigns</p>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[40px] font-bold text-text-primary leading-tight">{campaigns?.filter(c => c.status === 'live').length || '0'}</span>
            <span className="text-text-secondary font-bold text-sm">/ {campaigns?.length || '0'} total</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-border/70 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-sans text-xs text-text-secondary uppercase tracking-widest mb-4 font-semibold">Conversions</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-[40px] font-bold text-text-primary leading-tight">{overallConversionRate}%</span>
            </div>
            <p className="text-xs text-text-secondary">Conversions last 30 days: {recentConversions.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <section className="mb-12 rounded-3xl p-8 border border-primary/10 relative overflow-hidden bg-surface" style={{ background: 'radial-gradient(circle at top left, rgba(22, 163, 74, 0.05) 0%, transparent 70%)' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <span className="text-primary text-xl">✨</span>
            </div>
            <h3 className="font-serif text-[24px] font-bold text-text-primary leading-tight">AI Recommendations</h3>
          </div>
          <button 
            onClick={handleFindOpportunities}
            disabled={loadingOpportunities}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-sans text-[12px] font-bold tracking-wider uppercase shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loadingOpportunities ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Thinking...
              </>
            ) : (
              aiOpportunities ? '🔄 Find New Opportunities' : 'Find Opportunities with AI'
            )}
          </button>
        </div>

        {loadingOpportunities && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse bg-white border border-primary/10 p-5 rounded-xl h-48"></div>
            ))}
          </div>
        )}

        {aiOpportunities && !loadingOpportunities && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full transition-all duration-500">
            {aiOpportunities.map((opp, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-primary/10 hover:border-primary/40 transition-colors group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {opp.segment_name}
                  </span>
                  <span className="text-primary-hover opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                </div>
                <h4 className="font-serif text-[20px] font-bold text-text-primary mb-2 leading-tight">{opp.title}</h4>
                <p className="font-sans text-[14px] text-text-secondary mb-6 flex-1 line-clamp-2">{opp.why_it_matters}</p>
                <div className="flex gap-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Reach</span>
                    <span className="text-sm font-semibold text-text-primary">{opp.estimated_reach?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Channel</span>
                    <span className="text-sm font-semibold text-text-primary capitalize">{opp.suggested_channel}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleCreateCampaign(opp.suggested_goal)}
                  className="inline-flex items-center gap-2 text-primary font-bold text-[12px] hover:underline self-start uppercase tracking-wider"
                >
                  Create Campaign <span>→</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div>
        <h3 className="font-serif text-[24px] font-bold text-text-primary mb-6">Recent Campaigns</h3>
        <div className="bg-white border border-border/70 rounded-xl overflow-hidden shadow-sm p-2">
          <table className="w-full text-sm text-left">
            <thead className="text-text-secondary uppercase text-[10px] tracking-widest font-bold border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Segment</th>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Sent</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCampaigns.map((c, i) => {
                const openRate = c.total_delivered ? ((c.total_opened / c.total_delivered) * 100).toFixed(1) : "0.0";
                const clickRate = c.total_opened ? ((c.total_clicked / c.total_opened) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={c.id} onClick={() => navigate('/campaigns')} className={`cursor-pointer transition-colors hover:bg-surface ${i !== recentCampaigns.length - 1 ? 'border-b border-border/30' : ''}`}>
                    <td className="px-6 py-5 font-serif font-bold text-text-primary text-[16px]">{c.name}</td>
                    <td className="px-6 py-5"><SegmentBadge segment={c.target_segment_name} /></td>
                    <td className="px-6 py-5 uppercase text-[11px] tracking-wider font-bold text-text-secondary">{c.channel}</td>
                    <td className="px-6 py-5 font-medium text-text-primary">{c.total_sent || c.sent_count || 0}</td>
                    <td className="px-6 py-5 text-text-secondary">
                      <span className="text-amber font-semibold">{openRate}%</span> open <span className="mx-1 text-border">•</span> <span className="text-primary font-semibold">{clickRate}%</span> click
                    </td>
                    <td className="px-6 py-5"><StatusBadge status={c.status} /></td>
                  </tr>
                );
              })}
              {recentCampaigns.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-text-muted italic">No recent campaigns.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
