import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { enUS, jaJP } from '@clerk/localizations';
import { Inter } from 'next/font/google';

import { Locale } from '@/types';

import '../globals.css';

export const metadata: Metadata = {
  title: 'Mumble',
  description:
    'A social media app with features \
      for posting, sharing, replying and liking.',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  let clerkLocale = jaJP;
  if (locale == 'en-us') clerkLocale = enUS;

  const signInUrl = `/${locale}${process.env['NEXT_PUBLIC_CLERK_SIGN_IN_URL']}`;
  const signUpUrl = `/${locale}${process.env['NEXT_PUBLIC_CLERK_SIGN_UP_URL']}`;

  const afterSignInUrl = `/${locale}${process.env['NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL']}`;
  const afterSignUpUrl = `/${locale}${process.env['NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL']}`;

  const localeLang = locale.slice(0, 2);

  return (
    <ClerkProvider
      localization={clerkLocale}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      afterSignInUrl={afterSignInUrl}
      afterSignUpUrl={afterSignUpUrl}>
      <html lang={localeLang}>
        <body className={`${inter.className} bg-dark-1`}>
          <div className="w-full flex justify-center items-center min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
