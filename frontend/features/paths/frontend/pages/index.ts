// Ref: https://abeshi-blog.com/blog/t8or29ad3dz
//      https://zenn.dev/sc30gsw/articles/67aae793e39d74
// +++ 文字列として利用する際
// import { UrlToString } from '@/features/utils' を利用する
// +++

// types
import type { UrlConfig } from '@/features/paths/types.d';
// import
import { authPath } from './auth';
import { accountsPath } from './accounts';
import { servicesPath } from './services';
import { generalPath } from './general';

export const pagesPath = {
  // root
  $url: () => '/' as const,
  Home: {
    $url: (args?: UrlConfig) => ({
      pathname: '/' as const,
      query:    args?.query,
      hash:     args?.hash,
    })
  },
  // (auth)
  authPath: authPath,
  // accounts
  accountsPath: accountsPath,
  // (services)
  servicesPath: servicesPath,
  // (general)
  generalPath: generalPath,
};
  
// prettier-ignore
export type PagesPath = typeof pagesPath;