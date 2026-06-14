import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyzeCampaignResults } from '../../api/client';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { humanizeSegmentTerms } from '../../utils/formatters';

export function CampaignAnalysis({ campaign }) {
  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['campaignAnalysis', campaign.id],
    queryFn: () => analyzeCampaignResults(campaign.id),
  });

  const sent = campaign.total_sent || 0;
  const delivered = campaign.total_delivered || 0;
  const opened = campaign.total_opened || 0;
  const clicked = campaign.total_clicked || 0;
  const converted = campaign.total_converted || 0;
  const failed = campaign.total_failed || 0;

  const chartData = [
    { name: 'Sent', value: sent, color: '#94A3B8' },
    { name: 'Delivered', value: delivered, color: '#3B82F6' },
    { name: 'Opened', value: opened, color: '#F59E0B' },
    { name: 'Clicked', value: clicked, color: '#10B981' },
    { name: 'Converted', value: converted, color: '#059669' },
    { name: 'Failed', value: failed, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6 p-5">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList dataKey="value" position="top" style={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-surface2 rounded-xl p-5 border border-border">
        <h4 className="font-serif font-bold text-lg text-text-primary mb-3 flex items-center">
          <span className="mr-2">✨</span> AI Analysis
        </h4>
        
        {isLoading ? (
          <div className="flex items-center text-sm text-text-secondary py-2">
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" /> 
            Analyzing campaign performance...
          </div>
        ) : (
          <div className="text-sm text-text-secondary leading-relaxed">
            {analysisData?.analysis ? humanizeSegmentTerms(analysisData.analysis) : 'Analysis not available.'}
          </div>
        )}
      </div>
    </div>
  );
}
