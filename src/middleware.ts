import { middleware } from '@/lib/auth.middleware';
export default middleware;

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png).*)'],
};
