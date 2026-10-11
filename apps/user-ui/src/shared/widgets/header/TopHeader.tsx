import Link from 'next/link';
import Image from 'next/image';
import SearchBar from './SearchBar';
import { Heart, ShoppingCart, User } from 'lucide-react';

type UserData = {
  id: string;
  name: string;
  email: string;
};

type TopHeaderProps = {
  user?: UserData;
  isLoading: boolean;
};

export default function TopHeader({
  user,
  isLoading,
}: TopHeaderProps) {
  return (
    <header>
      <div className="padding-x hidden h-20 items-center justify-between gap-4 py-4 lg:flex lg:h-20 lg:flex-nowrap lg:gap-10 lg:py-6">
        {/* Logo */}
        <Link href="/" className="hidden shrink-0 lg:flex">
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={60}
            priority
            className="object-contain"
          />
        </Link>

        {/* Search */}
        <SearchBar />

        <div className="hidden items-center lg:flex">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="group flex items-center gap-3 border-r border-border pr-6"
          >
            <div className="relative">
              <Heart className="h-6 w-6 stroke-[1.5] text-primary-text transition group-hover:text-primary" />

              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-white">
                0
              </span>
            </div>

            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">
              Wishlist
            </span>
          </Link>

          {/* User */}
          {isLoading ? (
            <div className="flex items-center gap-3 border-r border-border px-6">
              <User className="h-6 w-6 stroke-[1.5] text-gray-800" />

              <div className="leading-tight">
                <p className="text-xs text-secondary-text">
                  Hello,
                </p>

                <p className="text-sm font-medium text-text-primary">
                  ...
                </p>
              </div>
            </div>
          ) : user ? (
            <Link
              href="/profile"
              className="group flex items-center gap-3 border-r border-border px-6"
            >
              <User className="h-6 w-6 stroke-[1.5] text-gray-800 transition group-hover:text-primary" />

              <div className="leading-tight">
                <p className="text-xs text-secondary-text">
                  Hello,
                </p>

                <p className="text-sm font-medium text-text-primary">
                  {user.name}
                </p>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="group flex items-center gap-3 border-r border-border px-6"
            >
              <User className="h-6 w-6 stroke-[1.5] text-gray-800 transition group-hover:text-primary" />

              <div className="leading-tight">
                <p className="text-xs text-secondary-text">
                  Hello,
                </p>

                <p className="text-sm font-medium text-text-primary group-hover:text-primary">
                  Sign in
                </p>
              </div>
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="group flex items-center gap-3 pl-6"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6 stroke-[1.5] text-primary-text transition group-hover:text-primary" />

              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-white">
                0
              </span>
            </div>

            <div className="leading-tight">
              <p className="text-xs text-secondary-text">
                Cart
              </p>

              <p className="text-sm font-medium text-primary-text">
                $0.00
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}