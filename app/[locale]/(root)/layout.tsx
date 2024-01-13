import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { enUS, jaJP } from '@clerk/localizations';
import { NextIntlClientProvider, useMessages } from 'next-intl';

import Topbar from '@/components/shared/Topbar';
import LeftSidebar from '@/components/shared/LeftSidebar';
import RightSidebar from '@/components/shared/RightSidebar';
import Bottombar from '@/components/shared/Bottombar';
import { Locale } from '@/types';

import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mumble',
  description:
    'A social media app with features \
      for posting, sharing, replying and liking.',
};

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const messages = useMessages();
  const localeLang = locale.slice(0, 2);

  let clerkLocale = jaJP;
  if (locale == 'en-us') clerkLocale = enUS;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}>
      <ClerkProvider localization={clerkLocale}>
        <html lang={localeLang}>
          <body className={inter.className}>
            <Topbar />

            <main className="flex flex-row">
              <LeftSidebar />

              <section className="main-container">
                <div className="w-full max-w-4xl">{children}</div>
              </section>

              <RightSidebar />
            </main>

            <Bottombar />
          </body>
        </html>
      </ClerkProvider>
    </NextIntlClientProvider>
  );
}
