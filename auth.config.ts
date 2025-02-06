import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // console.log(nextUrl.toString());
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isAtHome = nextUrl.pathname.startsWith('/home');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isAtHome) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        // return Response.redirect(new URL('/home', nextUrl));
        return Response.redirect(new URL('/home', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;