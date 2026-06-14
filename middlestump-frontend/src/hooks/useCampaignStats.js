import { useQuery } from '@tanstack/react-query';
import { getCampaignStats } from '../api/client';

export function useCampaignStats(campaignId, enabled = false) {
  const query = useQuery({
    queryKey: ['campaignStats', campaignId],
    queryFn: () => getCampaignStats(campaignId),
    refetchInterval: (query) => {
      const data = query?.state?.data;
      if (data && data.status === 'completed') {
        return false;
      }
      if (data && data.created_at) {
        const pollingTimeout = data.total_sent > 50 ? 240000 : 120000;
        const age = new Date() - new Date(data.created_at);
        if (age > pollingTimeout) return false;
      }
      return 3000;
    },
    enabled: !!campaignId && enabled,
  });

  const data = query.data;
  let isComplete = data?.status === 'completed';
  if (!isComplete && data?.created_at) {
    const pollingTimeout = data.total_sent > 50 ? 240000 : 120000;
    const age = new Date() - new Date(data.created_at);
    if (age > pollingTimeout) {
      isComplete = true; // treat as complete if we timed out
    }
  }

  return { ...query, isComplete };
}
