
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Users, ArrowUpRight } from 'lucide-react';

export interface ShopCardData {
  id: string;
  name: string;
  bio?: string | null;
  avatar?: {
    url: string;
  } | null;
  coverBanner?: string | null;
  address?: string | null;
  rating?: number | null;
  category?: string;
  followers?: number;
}

const ShopCard = ({ shop }: { shop: ShopCardData }) => {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-background transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <Link
        href={`/shops/${shop.id}`}
        className="block"
      >
        <div className="relative h-44 overflow-hidden bg-surface">
          {shop.coverBanner && (
            <Image
              src={shop.coverBanner}
              alt={`${shop.name} cover`}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
                {shop.avatar?.url ? (
                  <Image
                    src={shop.avatar.url}
                    alt={shop.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-primary">
                    {shop.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-primary-text transition-colors group-hover:text-primary">
                  {shop.name}
                </h3>

                {shop.category && (
                  <p className="mt-1 truncate text-xs text-secondary-text">
                    {shop.category}
                  </p>
                )}
              </div>
            </div>

            {shop.rating != null && (
              <div className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary-text">
                <Star
                  size={15}
                  className="fill-primary text-primary"
                />
                {shop.rating.toFixed(1)}
              </div>
            )}
          </div>

          {shop.bio && (
            <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-secondary-text">
              {shop.bio}
            </p>
          )}

          {shop.address && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-text">
              <MapPin size={16} className="shrink-0 text-primary" />
              <span className="truncate">{shop.address}</span>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            {shop.followers !== undefined ? (
              <div className="flex items-center gap-2 text-sm text-secondary-text">
                <Users size={16} className="text-primary" />
                <span>{shop.followers.toLocaleString()} Followers</span>
              </div>
            ) : (
              <span className="text-xs text-muted-text">
                Explore our store
              </span>
            )}

            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-2.5">
              Visit Shop
              <ArrowUpRight size={17} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ShopCard;
