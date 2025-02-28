/**
 * ログイン状況に応じてサーバー側でリダイレクト
 */
'use server';

// next-auth
import { type Session } from 'next-auth';
// next
import { redirect } from 'next/navigation';
import type { ReactNode, ReactElement } from 'react';
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// features
import { getAuthSession } from '@/features/nextauth';
import { UrlToString } from '@/features/utils';

// type
type AuthRedirectProps = {
  redirectPath?: string;
  children:      ReactNode;
};

// AuthRedirectForUnauthenticated
// 未ログインなら redirectPath にリダイレクト
export async function AuthRedirectForUnauthenticated({
  redirectPath = UrlToString(pagesPath.Home.$url({query: {errmsg:'unauthenticated'}})),
  children, }:AuthRedirectProps ): Promise<ReactElement> {
  const session: Session | null = await getAuthSession();
  if (!session?.user?.accessToken) {
    redirect(redirectPath);
  };
  return <>{children}</>;
};

// AuthRedirectForAuthenticated
// ログイン済みなら redirectPath にリダイレクト
export async function AuthRedirectForAuthenticated({
  redirectPath = UrlToString(pagesPath.servicesPath.vrmChat.$url()),
  children, }:AuthRedirectProps ): Promise<ReactElement> {
  const session: Session | null = await getAuthSession();
  if (session?.user?.accessToken) {
    redirect(redirectPath);
  };
  return <>{children}</>;
};