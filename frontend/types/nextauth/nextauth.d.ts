// next-auth
import { Session, DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export interface User {
  id:            string; // uniqueAccountId
  accessToken?:  string | null;
  refreshToken?: string | null;
};

declare module 'next-auth/jwt' {
  interface JWT extends User {}
};

declare module 'next-auth' {
  interface Session {
    user: Omit<DefaultSession['user'], 'name' | 'email' | 'image'> & {
      uniqueAccountId?: string | null;
      accessToken?:     string | null;
    };
    error?: string;
  }
};