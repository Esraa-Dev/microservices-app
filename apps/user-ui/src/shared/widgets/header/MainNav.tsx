'use client';

import Link from 'next/link';
import NavLinks from './NavLinks';
import {
  Heart,
  ShoppingCart,
  User,
  Menu,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import MobileNav from './MobileNav';
import SearchBar from './SearchBar';

type UserData = {
  id: string;
  name: string;
  email: string;
};

type MainNavProps = {
  user?: UserData;
  isLoading: boolean;
};

export default function MainNav({
  user,
  isLoading,
}: MainNavProps) {
  const [open, setOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      className={`z-40 w-full bg-primary text-white ${
        isSticky
          ? 'fixed left-0 right-0 top-0'
          : 'relative'
      }`}
    >
      <div className="padding-x flex h-14 items-center justify-between">
        {/* Mobile Logo + Menu */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6 cursor-pointer text-white" />
          </button>

          <Link href="/" className="shrink-0">
            <Image
              src="/logo-1.png"
              alt="Logo"
              width={90}
              height={45}
              priority
              className="object-contain"
            />
          </Link>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="hidden h-11 items-center gap-2.5 rounded-md bg-black/90 px-4 lg:flex"
            aria-label="Open all Categories"
          >
            <Menu className="h-5 w-5 text-primary" />

            <span className="text-sm font-semibold tracking-wide">
              All Categories
            </span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <NavLinks />

        {/* Mobile Actions */}
        <div className="flex flex-1 items-center justify-end gap-6 lg:hidden">
          <SearchBar mobile />

          {/* Account */}
          {isLoading ? (
            <div
              aria-label="Loading account"
              className="flex h-8 w-8 items-center justify-center rounded-full border-[1.6px] border-white p-1"
            >
              <User className="h-5 w-5 stroke-[1.5]" />
            </div>
          ) : (
            <Link
              href={user ? '/profile' : '/login'}
              aria-label="Account"
              className="flex h-8 w-8 items-center justify-center rounded-full border-[1.6px] border-white p-1"
            >
              <User className="h-5 w-5 stroke-[1.5]" />
            </Link>
          )}

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative"
          >
            <Heart className="h-5 w-5 stroke-[1.5]" />

            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-medium text-primary">
              0
            </span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative"
          >
            <ShoppingCart className="h-5 w-5 stroke-[1.5]" />

            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-medium text-primary">
              0
            </span>
          </Link>
        </div>
      </div>

      <MobileNav
        open={open}
        onClose={() => setOpen(false)}
      />
    </nav>
  );
}