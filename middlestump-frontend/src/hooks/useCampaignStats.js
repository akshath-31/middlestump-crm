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
      const delivered = data?.total_delivered || 0;
      const failed = data?.total_failed || 0;
      
      if (sent > 0 && sent <= delivered + failed) {
        return false;
      }
      
      if (pollingStartTime) {
        const pollingTimeout = sent > 50 ? 240000 : 120000;
        const age = Date.now() - pollingStartTime;
        if (age > pollingTimeout) return false;
      }
      return 3000;
    },
    enabled: !!campaignId && enabled,
  });

  const data = query.data;
  let isComplete = data?.status === 'completed';
  
  const sent = data?.total_sent || 0;
  const delivered = data?.total_delivered || 0;
  const failed = data?.total_failed || 0;
  
  if (sent > 0 && sent <= delivered + failed) {
    isComplete = true;
  }
  
  if (!isComplete && pollingStartTime) {
    const pollingTimeout = sent > 50 ? 240000 : 120000;
    const age = Date.now() - pollingStartTime;
    if (age > pollingTimeout) {
      isComplete = true; // treat as complete if we timed out
    }
  }

  return { ...query, isComplete };
}
