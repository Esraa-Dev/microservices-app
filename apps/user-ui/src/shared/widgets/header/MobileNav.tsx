"use client";

import Link from "next/link";
import { X } from "lucide-react";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Shops", href: "/shops" },
  { name: "Offers", href: "/offers" },
  { name: "Become A Seller", href: "/become-seller" },
];

export default function MobileNav({
  open,
  onClose,
}: MobileNavProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <aside className="relative z-10 h-full w-72 max-w-[85%] bg-white shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <span className="text-lg font-semibold text-primary-text">
            Menu
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-primary-text" />
          </button>
        </div>

        <nav className="px-5 py-4">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block border-b border-border py-4 text-sm font-medium text-primary-text"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}


