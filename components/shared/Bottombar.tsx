'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { usePathname } from '@/hooks/navigation';
import { sidebarLinks } from '@/constants';

function Bottombar() {
  const pathname = usePathname();
  const t = useTranslations('LeftSidebar');

  return (
    <section className="bottombar">
      <div className="bottombar_container">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          return (
            <Link
              href={link.route}
              key={t(link.label)}
              className={`bottombar_link ${isActive && 'bg-primary-500'}`}>
              <Image
                src={link.imgURL}
                alt={t(link.label)}
                width={24}
                height={24}
              />
              <p className="text-subtle-medium text-light-1 max-sm:hidden truncate">
                {t(link.label)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default Bottombar;
