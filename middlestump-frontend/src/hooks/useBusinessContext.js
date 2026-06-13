import { useQuery } from '@tanstack/react-query';
import { getContext } from '../api/client';

export function useBusinessContext() {
  return useQuery({
    queryKey: ['businessContext'],
    queryFn: getContext,
    refetchInterval: 60000,
  });
}
