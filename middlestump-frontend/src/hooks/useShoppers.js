import { useQuery } from '@tanstack/react-query';
import { getShoppers } from '../api/client';

export function useShoppers(params) {
  return useQuery({
    queryKey: ['shoppers', params],
    queryFn: () => getShoppers(params),
  });
}
