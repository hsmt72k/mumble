import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import createMiddleware from 'next-intl/middleware';

import { defaultLocale, locales } from '@/i18nconfig';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
});

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware
// for more information about configuring your Middleware
export default authMiddleware({
  beforeAuth: (req) => {
    return intlMiddleware(req);
  },

  apiRoutes: ['/:locale/api/uploadthing', '/:locale/api/webhook/clerk'],
  publicRoutes: ['/', '/:locale/sign-in', '/:locale/sign-up'],

  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute && !auth.isApiRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
