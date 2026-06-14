import { useQuery } from '@tanstack/react-query';
import { getCampaignStats } from '../api/client';
import { useState, useEffect } from 'react';

export function useCampaignStats(campaignId, enabled = false) {
  const [pollingStartTime, setPollingStartTime] = useState(null);

  useEffect(() => {
    if (enabled && !pollingStartTime) {
      setPollingStartTime(Date.now());
    }
  }, [enabled, pollingStartTime]);

  const query = useQuery({
    queryKey: ['campaignStats', campaignId],
    queryFn: () => getCampaignStats(campaignId),
    refetchInterval: (query) => {
      const data = query?.state?.data;
      if (data && data.status === 'completed') return false;
      
      const sent = data?.total_sent || 0;
      
      if (pollingStartTime) {
        const pollingTimeout = sent > 50 ? 240000 : 120000;
        const age = Date.now() - pollingStartTime;
        if (age > pollingTimeout) return false;
      }
      return 1000; // Poll every 1s for fast updates
    },
    enabled: !!campaignId && enabled,
  });

  const data = query.data;
  let isComplete = data?.status === 'completed';
  
  const sent = data?.total_sent || 0;
  
  if (!isComplete && pollingStartTime) {
    const pollingTimeout = sent > 50 ? 240000 : 120000;
    const age = Date.now() - pollingStartTime;
    if (age > pollingTimeout) {
      isComplete = true; // treat as complete if we timed out
    }
  }

  return { ...query, isComplete };
}
