// types
import type { UrlConfig } from '@/features/paths/types.d';

export const authPath = {
  signup: {
    $url: (args?: UrlConfig) => ({
      pathname: '/signup' as const,
      query:    args?.query,
      hash:     args?.hash,
    }),
  },
  login: {
    $url: (args?: UrlConfig) => ({
      pathname: '/login' as const,
      query:    args?.query,
      hash:     args?.hash,
    }),
  },
  password_reset: {
    $url: (args?: UrlConfig) => ({
      pathname: '/password_reset' as const,
      query:    args?.query,
      hash:     args?.hash,
    }),
  },
};