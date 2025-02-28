'use server';

// Session
import { getServerSession, type Session } from 'next-auth';
// include
import { authOptions } from './authOptions'

// getAuthSession: SSR/Server Componentでセッションを取得
// ログイン後は、
// const session: AuthSession | null = await getAuthSession(); を実行してアクセストークン検証が走る
export async function getAuthSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
};