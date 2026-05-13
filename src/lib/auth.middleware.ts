import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Middleware uses the lightweight config without bcrypt
export const { auth: middleware } = NextAuth(authConfig);
