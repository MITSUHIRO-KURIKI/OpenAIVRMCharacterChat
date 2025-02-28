// next
import { redirect } from 'next/navigation'
// pagesPath
import { pagesPath } from '@/features/paths/frontend';
// features
import { UrlToString } from '@/features/utils';


export default function Home() {
  // このページにアクセスしたら強制的に /login へリダイレクト
  const redirectPath = UrlToString(pagesPath.authPath.login.$url())
  redirect(redirectPath)
  return null
};