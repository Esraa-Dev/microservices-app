'use client';

import { navItems } from '@/configs/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="hidden lg:flex items-center gap-8 h-full">
      {navItems.map((link: NavItemsTypes) => {
        const active = pathname === link.href;
        return (
          <li key={link.href} className="h-full flex items-center">
            <Link
              href={link.href}
              className={`relative h-full flex items-center px-1 text-sm font-semibold tracking-wide ${
                active ? 'text-white' : 'text-white/90 '
              }`}
            >
              {link.name}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
