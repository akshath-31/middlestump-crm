import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '../api/client';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SegmentBadge } from '../components/ui/SegmentBadge';

import { CampaignAudience } from '../components/campaign/CampaignAudience';
import { CampaignAnalysis } from '../components/campaign/CampaignAnalysis';

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    })
  } catch {
    return '-'
  }
}

export function Campaigns() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  const [openPanels, setOpenPanels] = useState({});

  const togglePanel = (e, id, panel) => {
    e.stopPropagation();
    setOpenPanels(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [panel]: !prev[id]?.[panel]
      }
    }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-text-muted">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-bold text-text-primary">Campaigns</h1>
        <span className="bg-surface2 text-text-secondary px-2.5 py-1 rounded-full text-xs font-semibold">
          {campaigns?.length || 0} total
        </span>
      </div>

      <div className="space-y-4">
        {campaigns?.map(c => {
          const sent = c.total_sent || 0;
          const delivered = c.total_delivered || 0;
          const opened = c.total_opened || 0;
          const clicked = c.total_clicked || 0;
          const converted = c.total_converted || 0;
          const failed = c.total_failed || 0;

          const deliveredRate = sent ? ((delivered / sent) * 100).toFixed(1) : '0.0';
          const openRate = delivered ? ((opened / delivered) * 100).toFixed(1) : '0.0';
          const clickRate = opened ? ((clicked / opened) * 100).toFixed(1) : '0.0';
          const convRate = clicked ? ((converted / clicked) * 100).toFixed(1) : '0.0';
          const isAudienceExpanded = openPanels[c.id]?.audience;
          const isAnalysisExpanded = openPanels[c.id]?.analysis;

          return (
            <div key={c.id} className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden transition-all">
              <div className="p-5 flex flex-col lg:flex-row lg:items-center">
                <div className="flex-1 mb-4 lg:mb-0 pr-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-lg text-text-primary">{c.name}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="text-sm text-text-secondary mb-3">{c.goal}</div>
                  <div className="flex items-center space-x-2 text-xs mb-4">
                    <SegmentBadge segment={c.target_segment} />
                    <span className="text-text-muted">•</span>
                    <span className="bg-surface2 px-2 py-1 rounded text-text-secondary font-semibold uppercase">{c.channel}</span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">{formatDate(c.created_at)}</span>
                  </div>

                  <div className="flex items-center space-x-3 mt-2">
                    <button 
                      onClick={(e) => togglePanel(e, c.id, 'audience')}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-surface2 transition-colors text-[13px] font-medium text-text-primary"
                    >
                      <span>👥</span>
                      <span>{isAudienceExpanded ? 'Hide Audience' : 'Show Audience'}</span>
                    </button>
                    <button 
                      onClick={(e) => togglePanel(e, c.id, 'analysis')}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-surface2 transition-colors text-[13px] font-medium text-text-primary"
                    >
                      <span>✨</span>
                      <span>{isAnalysisExpanded ? 'Hide Analysis' : 'Analyse with AI'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-text-muted mb-1">Sent</div>
                    <div className="font-bold text-text-primary">{sent}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-info mb-1">Delivered</div>
                    <div className="font-bold text-info">{delivered} <span className="font-normal text-[10px]">({deliveredRate}%)</span></div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-amber mb-1">Opened</div>
                    <div className="font-bold text-amber">{opened} <span className="font-normal text-[10px]">({openRate}%)</span></div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-primary mb-1">Clicked</div>
                    <div className="font-bold text-primary">{clicked} <span className="font-normal text-[10px]">({clickRate}%)</span></div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-primary mb-1">Converted</div>
                    <div className="font-bold text-primary">{converted} <span className="font-normal text-[10px]">({convRate}%)</span></div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-danger mb-1">Failed</div>
                    <div className="font-bold text-danger">{failed}</div>
                  </div>
                </div>
              </div>

              {isAudienceExpanded && (
                <div className="border-t border-border bg-surface2">
                  <CampaignAudience campaignId={c.id} />
                </div>
              )}

              {isAnalysisExpanded && (
                <div className="border-t border-border bg-surface2">
                  <CampaignAnalysis campaign={c} />
                </div>
              )}
            </div>
          );
        })}
        {!campaigns?.length && (
          <div className="p-8 text-center text-text-muted bg-surface rounded-lg border border-border">
            No campaigns found. Go to the Campaign builder to create one.
          </div>
        )}
      </div>
    </div>
  );
}
