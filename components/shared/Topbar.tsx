import Image from 'next/image';
import Link from 'next/link';
import {
  OrganizationSwitcher,
  SignOutButton,
  SignedIn,
} from '@clerk/nextjs';
import { dark } from '@clerk/themes';

import useLocaleNames from '@/hooks/useLocaleNames';
import LocaleSwitcher from '@/components/LocaleSwitcher';

function Topbar() {
  const localeNames = useLocaleNames();

  return (
    <nav className="topbar">
      <Link
        href="/"
        className="flex items-center gap-4">
        <Image
          src="/assets/logo.svg"
          alt="logo"
          width={28}
          height={28}
          className=""
        />
        <p className="text-heading3-bold text-light-1 max-xs:hidden">
          Mumble
        </p>
      </Link>

      <div className="flex items-center gap-1">
        <div className="block md:hidden">
          <SignedIn>
            <SignOutButton>
              <div className="flex cursor-pointer">
                <Image
                  src="/assets/logout.svg"
                  alt="logout"
                  width={24}
                  height={24}
                />
              </div>
            </SignOutButton>
          </SignedIn>
        </div>

        <OrganizationSwitcher
          appearance={{
            baseTheme: dark,
            elements: {
              organizationSwitcherTrigger: 'py-2 px-4',
            },
          }}
        />
        <LocaleSwitcher localeNames={localeNames} />
      </div>
    </nav>
  );
}

export default Topbar;
