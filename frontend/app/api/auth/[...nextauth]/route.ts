// next-auth
import NextAuth from 'next-auth';
// features
import { authOptions } from '@/features/nextauth';


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };