import { useTranslations } from 'next-intl';

import { locales } from '@/i18nconfig';
import { Locale } from '@/types';

// ロケール名をローカライズした形: { "en-us": "English", ... }
// でマップを返す
export default function useLocaleNames(): Record<Locale, string> {
  const t = useTranslations('useLocaleNames');

  return locales.reduce((acc, locale) => {
    acc[locale] = t(locale) as string;
    return acc;
  }, {} as Record<Locale, string>);
}
