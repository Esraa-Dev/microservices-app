
'use client';

import Link from 'next/link';
import Image from 'next/image';
import NavLinks from './NavLinks';
import {
  Heart,
  ShoppingCart,
  User,
  Menu,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import MobileNav from './MobileNav';
import SearchBar from './SearchBar';
import { useStore } from '@/store';

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
const wishlist=useStore(state=>state.wishlist)
const cart=useStore(state=>state.cart)

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 80);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`z-40 w-full bg-primary text-white transition-shadow duration-200 ${
        isSticky
          ? 'fixed left-0 right-0 top-0 shadow-md'
          : 'relative'
      }`}
    >
      <div className="page-container flex min-h-14 flex-col gap-3 py-3 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-0">
        <div className="flex w-full min-w-0 items-center justify-between gap-2 lg:w-auto lg:shrink-0 lg:justify-start lg:gap-3">
          <div className="flex min-w-0 shrink-0 items-center gap-2 lg:hidden">
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="shrink-0">
              <Image
                src="/logo-11.png"
                alt="Esraa Shop"
                width={90}
                height={45}
                priority
                className="h-auto w-20 object-contain"
              />
            </Link>
          </div>

          {isSticky && (
            <Link href="/" className="hidden shrink-0 lg:flex">
              <Image
                src="/logo-11.png"
                alt="Esraa Shop"
                width={90}
                height={45}
                className="h-auto w-25 object-contain"
              />
            </Link>
          )}

          <button
            type="button"
            className="hidden h-10 shrink-0 items-center gap-2.5 rounded-lg border border-white/40 bg-white/5 px-4 text-white transition-all duration-200 hover:border-white/70 hover:bg-white/15 lg:flex"
            aria-label="Open all categories"
          >
            <Menu className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold tracking-wide">
              All Categories
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-3 lg:hidden">
            {isLoading ? (
              <div
                aria-label="Loading account"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white"
              >
                <User className="h-5 w-5 stroke-[1.5]" />
              </div>
            ) : (
              <Link
                href={user ? '/profile' : '/login'}
                aria-label={user ? 'My account' : 'Sign in'}
                title={user ? user.name : 'Sign in'}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white transition hover:bg-white/10"
              >
                <User className="h-5 w-5 stroke-[1.5]" />
              </Link>
            )}

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-8 w-8 items-center justify-center"
            >
              <Heart className="h-5 w-5 stroke-[1.5]" />
              <span className="absolute right-0 top-0 flex h-4 min-w-4 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-medium text-primary">
                {wishlist.length}
              </span>
            </Link>

            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-8 w-8 items-center justify-center"
            >
              <ShoppingCart className="h-5 w-5 stroke-[1.5]" />
              <span className="absolute right-0 top-0 flex h-4 min-w-4 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-medium text-primary">
                {cart.length}
              </span>
            </Link>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <NavLinks />
        </div>

        <div className="hidden min-w-0 flex-1 justify-end lg:flex lg:flex-none">
          {isSticky && (
            <div className="flex items-center gap-5">
              {isLoading ? (
                <div
                  aria-label="Loading account"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white"
                >
                  <User className="h-5 w-5 stroke-[1.5]" />
                </div>
              ) : (
                <Link
                  href={user ? '/profile' : '/login'}
                  aria-label={user ? 'My account' : 'Sign in'}
                  title={user ? user.name : 'Sign in'}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white transition hover:bg-white/10"
                >
                  <User className="h-5 w-5 stroke-[1.5]" />
                </Link>
              )}

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative"
              >
                <Heart className="h-5 w-5 stroke-[1.5]" />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-medium text-primary">
                  {wishlist.length}
                </span>
              </Link>

              <Link
                href="/cart"
                aria-label="Cart"
                className="relative"
              >
                <ShoppingCart className="h-5 w-5 stroke-[1.5]" />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-medium text-primary">
                  {cart.length}
                </span>
              </Link>
            </div>
          )}
        </div>

        <div className="w-full lg:hidden">
          <SearchBar mobile />
        </div>
      </div>

      <MobileNav
        open={open}
        onClose={() => setOpen(false)}
      />
    </nav>
  );
}
