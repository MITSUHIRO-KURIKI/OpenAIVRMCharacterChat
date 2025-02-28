// types
import type { UrlConfig } from '@/features/paths/types.d';

export const generalPath = {
  colors: {
    $url: (args?: UrlConfig) => ({
      pathname: '/colors' as const,
      query:    args?.query,
      hash:     args?.hash,
    }),
  },
};