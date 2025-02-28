// types
import type { UrlConfig } from '@/features/paths/types.d';

export const accountsPath = {
  home: {
    $url: (args?: UrlConfig) => ({
      pathname: '/accounts' as const,
      query:    args?.query,
      hash:     args?.hash,
    }),
  },
};