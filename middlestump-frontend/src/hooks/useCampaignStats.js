import { useQuery } from '@tanstack/react-query';
import { getCampaignStats } from '../api/client';

export function useCampaignStats(campaignId, enabled = false) {
  const query = useQuery({
    queryKey: ['campaignStats', campaignId],
    queryFn: () => getCampaignStats(campaignId),
    refetchInterval: (data) => {
      if (data && data.status === 'completed') {
        return false;
      }
      return 3000;
    },
    enabled: !!campaignId && enabled,
  });

  // Calculate if polling time > 120s or status is completed
  // We'll manage 120s timeout by checking the created_at vs now in the component or here.
  // Actually, we can just rely on data.status === 'completed' as the primary stop condition,
  // since the backend will mark it completed when it finishes processing the batch.

  const isComplete = query.data?.status === 'completed';

  return { ...query, isComplete };
}
