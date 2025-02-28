import type { LucideIcon } from 'lucide-react';

export type ItemBase = {
  key:       'settings'
             | 'logout'
             | 'signup'
             | 'login'
             | string;
  label?:    string;
  type?:     'link' | 'action' | 'loading' | 'divided';
  href?:     string;
  icon?:     LucideIcon;
  onClick?:  () => void;
};
export type Item = {
  sub?: ItemBase[];
} & ItemBase;

export type LoadItemDataProps = {
  vrmChatItems?: ItemBase[] | undefined;
};