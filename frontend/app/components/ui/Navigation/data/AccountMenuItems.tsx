'use client';

// next-auth
import { useSession } from 'next-auth/react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// features
import { logout } from '@/features/api/token';
import { UrlToString } from '@/features/utils';
// icons
import {
  Settings,
  LogOut,
  UserPlus,
  LogIn,
} from 'lucide-react';
// type
import { ItemBase } from './type.d';

// AccountMenuItems ▽
export function AccountMenuItems(): ItemBase[] {
  const { status } = useSession();
  switch (status) {
    case 'loading':
      return [{
        key:  'loading',
        type: 'loading',
      },];
    case 'authenticated':
      return [{
        key:   'settings',
        label: 'settings',
        type:  'action',
        icon:  Settings,
      },{
        key:     'logout',
        label:   'logout',
        type:    'action',
        icon:    LogOut,
        onClick: () => logout(),
      },];
    case 'unauthenticated':
    default:
      return [{
        key:   'signup',
        label: 'signup',
        type:  'link',
        href:  UrlToString(pagesPath.authPath.signup.$url()),
        icon:  UserPlus,
      }, {
        key:   'login',
        label: 'login',
        type:  'link',
        href:  UrlToString(pagesPath.authPath.login.$url()),
        icon:  LogIn,
      },];
  };
};
// AccountMenuItems △