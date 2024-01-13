'use client';

import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/hooks/navigation';
import { locales } from '@/i18nconfig';
import { Locale } from '@/types';

export default function LocaleSwitcher({
  localeNames,
}: {
  localeNames: Record<Locale, string>;
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathName = usePathname();

  const switchLocale = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathName, { locale: e.target.value });
  };

  return (
    <div>
      <select
        value={locale}
        onChange={switchLocale}>
        {locales.map((loc) => (
          <option
            key={loc}
            value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
