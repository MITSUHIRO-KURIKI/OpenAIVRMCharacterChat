// next-auth
import CredentialsProvider from 'next-auth/providers/credentials';
import { type NextAuthOptions } from 'next-auth';
import { type JWT } from 'next-auth/jwt';
// include
import { verifyAccessToken, refreshAccessToken } from './authEndpoint';
import { authorizeUser } from './authorizeUser';
// types
import { type User } from '@/types/nextauth';


// NextAuthOptions ▽
// https://github.com/nextauthjs/next-auth/blob/fe7aaeded872a5ca17c01fa835e42cedf2bc7e83/packages/next-auth/src/core/types.ts
export const authOptions: NextAuthOptions = {
  // 認証プロバイダーの設定
  providers: [
    // メールアドレス認証
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:     { label: 'email',    type: 'text' },
        password:  { label: 'password', type: 'password' },
      },
      // authorize
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email address and password');
        };
        return authorizeUser(credentials.email, credentials.password)
      },
    }),
  ],
  // セッションの設定
  session: {
    strategy: 'jwt',
    maxAge:   365 * 86400, // sec
  },
  secret:           process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.COOKIE_SECURE === 'true',
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  callbacks: {
    /**
     * callbacks jwt: ログイン直後やセッション有効性確認時などに呼び出される
     */
    async jwt({ token, user }: { token: JWT; user: any }) {
      // ログイン直後だけ user が入ってくる
      if (user) {
        const castedUser   = user as User;
        token.id           = castedUser.id ?? token.id ?? '';
        token.accessToken  = castedUser.accessToken    ?? null;
        token.refreshToken = castedUser.refreshToken   ?? null;
      } else {
        // アクセストークンの検証
        const isValid = await verifyAccessToken(token?.accessToken);
        if (!isValid) {
          // 無効ならアクセストークンの更新
          const { accessToken, refreshToken, error } = await refreshAccessToken(token?.refreshToken);
          token.accessToken  = accessToken;
          token.refreshToken = refreshToken;
          if (error) {
            token.error = error;
          };
        };
      };
      return token
    },
    /**
     * callback session: クライアント側の `useSession()` で取得できる `session` の処理
     */
    async session({ session, token }: { session: any; token: JWT }) {
      // token から session.user に必要な情報を転写
      session.user.uniqueAccountId = token.id          || null;
      session.user.accessToken     = token.accessToken || null;
      // もし token.error があれば session に仕込む
      if ((token as any).error) {
        session.error = (token as any).error;
      };
      // デフォルトの不要フォードルを削除
      delete (session.user as any).name;
      delete (session.user as any).email;
      delete (session.user as any).image;
      return session;
    },
  },
};
// NextAuthOptions △