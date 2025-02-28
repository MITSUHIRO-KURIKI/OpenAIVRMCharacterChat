'use server';

// next-auth
import { getToken, JWT } from 'next-auth/jwt';
// next
import { NextRequest, NextResponse } from 'next/server';
// paths
import { tokenPath } from '@/features/paths/backend';
// features
import { csrfValidatorForRequest } from '@/features/utils';
import { BackendApiClient } from '@/features/apiClients';


// ログアウト
export async function POST(request: NextRequest): Promise<NextResponse> {

  try {
    // CSRFチェック ▽
    const csrfResult = csrfValidatorForRequest(request);
    if (!csrfResult?.ok) {
      return new NextResponse(null, { status: 403 });
    };
    // CSRFチェック △

    // NextAuth の JWT をサーバーサイドで取得
    const token: JWT | null = await getToken({
      req:    request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      return new NextResponse(null, { status: 204 });
    };
    // JWT に保存された refreshToken を取り出す
    const refreshToken = token.refreshToken;
    if (!refreshToken) {
      return new NextResponse(null, { status: 204 });
    };

    // ログアウト処理 (リフレッシュトークンの無効化)
    await BackendApiClient.post(
      tokenPath.blacklist,
      { refresh: refreshToken },
      { headers: { 'Content-Type': 'application/json', }},
    );
    return new NextResponse(null, { status: 204 });
  } catch {
    // リフレッシュトークンの期限切れの場合など
    return new NextResponse(null, { status: 204 });
  };
};