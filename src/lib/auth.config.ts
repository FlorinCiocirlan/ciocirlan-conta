import type { NextAuthConfig } from 'next-auth';

// Lightweight config used only in middleware (Edge Runtime)
// No bcrypt or Node.js-only imports here
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isPublicPath =
        pathname.startsWith('/share/') ||
        pathname.startsWith('/api/share/') ||
        pathname === '/';

      const isAuthPage = pathname === '/login' || pathname === '/register';

      if (isPublicPath) return true;
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL('/dashboard', nextUrl.origin));
      }
      if (!isLoggedIn && !isAuthPage) {
        return Response.redirect(new URL('/login', nextUrl.origin));
      }
      return true;
    },
  },
};
