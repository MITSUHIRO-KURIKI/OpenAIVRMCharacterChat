// react
import { type ReactElement } from 'react';
// include
import { ScrollToTopButtonClient } from './ScrollToTopButtonClient';

export function ScrollToTopButton(): ReactElement {
  // SSR時は何もせず、クライアントコンポーネントをラップする
  return <ScrollToTopButtonClient />;
};