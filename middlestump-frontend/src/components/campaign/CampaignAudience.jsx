import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaignAudience } from '../../api/client';
import { Loader2 } from 'lucide-react';

export function CampaignAudience({ campaignId }) {
  const { data: audience, isLoading } = useQuery({
    queryKey: ['campaignAudience', campaignId],
    queryFn: () => getCampaignAudience(campaignId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-text-secondary">
        <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary" /> 
        Loading audience...
      </div>
    );
  }

  if (!audience || audience.length === 0) {
    return <div className="p-6 text-sm text-text-secondary text-center">No audience found for this segment.</div>;
  }

  return (
    <div className="space-y-4 p-5">
      <div className="text-sm font-semibold text-text-primary">
        {audience.length} shoppers in this audience
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface2 text-text-secondary text-xs uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Total Spend</th>
              <th className="px-4 py-3 text-right">Last Order</th>
              <th className="px-4 py-3">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {audience.map(shopper => (
              <tr key={shopper.id} className="hover:bg-surface2/50 transition-colors">
                <td className="px-4 py-3 font-medium text-text-primary">{shopper.name || '-'}</td>
                <td className="px-4 py-3 text-text-secondary">{shopper.city || '-'}</td>
                <td className="px-4 py-3">
                  <span className="bg-surface2 px-2 py-1 rounded text-xs font-medium text-text-secondary capitalize">
                    {shopper.shopper_type ? shopper.shopper_type.replace(/_/g, ' ') : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary text-right">
                  {shopper.total_spend ? `₹${shopper.total_spend.toLocaleString('en-IN')}` : '-'}
                </td>
                <td className="px-4 py-3 text-text-secondary text-right">
                  {shopper.last_order_date ? new Date(shopper.last_order_date).toLocaleDateString('en-IN') : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {shopper.tags?.map(tag => (
                      <span key={tag} className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap capitalize">
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {(!shopper.tags || shopper.tags.length === 0) && '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
