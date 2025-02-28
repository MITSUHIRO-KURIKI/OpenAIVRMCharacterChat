'use server';

// paths
import { accountsPath, tokenPath } from '@/features/paths/backend';
// features
import { BackendApiClient } from '@/features/apiClients';


// ログイン
export async function login(email: string, password: string) {
  return BackendApiClient.post(
    tokenPath.create,
    { email,   password },
    { headers: { 'Content-Type': 'application/json', }}
  );
};

// ユーザー情報取得
export async function getUserId(accessToken: string) {
  return BackendApiClient.get(
    accountsPath.me,
    { headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${accessToken}`,
    }},
  );
};

// アクセストークン有効性確認
export async function verifyAccessToken(accessToken: string | null | undefined): Promise<boolean> {
  // input valid
  if (!accessToken) {
    return false;
  };
  // try
  try {
    const res = await BackendApiClient.post(
      tokenPath.verify,
      { token:   accessToken },
      { headers: { 'Content-Type': 'application/json', }},
    );
    return res.status === 200;
  } catch {
    return false;
  };
};

// トークンリフレッシュ
export async function refreshAccessToken(refreshToken: string | null | undefined): Promise<{accessToken: string | null; refreshToken: string | null; error?: string;}> {
  // input valid
  if (!refreshToken) {
    return {
      accessToken:  null,
      refreshToken: null,
      error:        'TokenError',
    };
  };
  // try
  try {
    const res = await BackendApiClient.post(
      tokenPath.refresh,
      { refresh: refreshToken },
      { headers: { 'Content-Type': 'application/json', }},
    );
    if (res.status === 200) {
      return {
        accessToken:  res.data.access  ?? null,
        refreshToken: res.data.refresh ?? refreshToken, // リフレッシュトークンが返ってこなければ、従来の token.refresh を維持
      };
    };
    return {
      accessToken:  null,
      refreshToken: null,
      error:        'TokenError',
    };
  } catch {
    return {
      accessToken:  null,
      refreshToken: null,
      error:        'TokenError',
    };
  };
};