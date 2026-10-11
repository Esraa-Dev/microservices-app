'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import Rating from '../rating';
import ProductDetailsCard from './product-details.card';
import { createPortal } from 'react-dom';
import { useStore } from '@/store';
import { useUser } from '../../../hooks/useUser';
import useLocationTracking from '../../../hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';

type ProductImage = {
  id: string;
  url: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  images: ProductImage[];
  sale_price: number;
  regular_price: number;
  ratings: number;
  stock: number;
  total_sales: number;
  brand?: string | null;
  starting_date?: string | null;
  ending_date?: string | null;
  shop?: {
    id: string;
    name: string;
  };
};

type ProductCardProps = {
  product: Product;
  isEvent?: boolean;
};

const calculateTimeLeft = (endingDate?: string | null) => {
  if (!endingDate) return null;

  const end = new Date(endingDate).getTime();

  if (Number.isNaN(end)) return null;

  const difference = end - Date.now();

  if (difference <= 0) return 'Expired';

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
};

const ProductCard = ({ product, isEvent = false }: ProductCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const addTowishlist = useStore((state: any) => state.addToWishlist);
  const cart = useStore((state: any) => state.cart);
  const wishlist = useStore((state: any) => state.wishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const addToCart = useStore((state: any) => state.addToCart);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const isInCart = cart.some((item: Product) => item.id === product.id);

  const isInWishlist = wishlist.some((item: Product) => item.id === product.id);

  useEffect(() => {
    if (!isEvent || !product.ending_date) return;

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft(product.ending_date));
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isEvent, product.ending_date]);

  const imageUrl = product.images?.[0]?.url;
  const isOutOfStock = product.stock <= 0;
  const isLimitedStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-square w-full overflow-hidden bg-surface">
        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.title}`}
          className="absolute inset-0"
        >
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
            />
        </Link>

        {isEvent && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white">
            OFFER
          </span>
        )}

        {isOutOfStock && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-primary-text px-3 py-1 text-xs font-medium text-white">
            Out of Stock
          </span>
        )}

        {isLimitedStock && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-primary bg-background px-3 py-1 text-xs font-medium text-primary">
            Limited Stock
          </span>
        )}

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            aria-label={
              isInWishlist
                ? `Remove ${product.title} from wishlist`
                : `Add ${product.title} to wishlist`
            }
            aria-pressed={isInWishlist}
            onClick={() => {
              if (isInWishlist) {
                removeFromWishlist(product.id, user, location, deviceInfo);
              } else {
                addTowishlist(
                  { ...product, quantity: 1 },
                  user,
                  location,
                  deviceInfo,
                );
              }
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-background text-primary-text shadow-sm transition-colors hover:text-primary"
          >
            <Heart
              size={18}
              className={
                isInWishlist ? 'fill-primary text-primary' : 'text-primary-text'
              }
            />
          </button>

          <div
            aria-label={`View ${product.title}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(!open);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-primary-text cursor-pointer shadow-sm transition-colors hover:text-primary"
          >
            <Eye size={18} />
          </div>

          <button
            type="button"
            aria-label={
              isInCart
                ? `${product.title} is in cart. Add another`
                : `Add ${product.title} to cart`
            }
            disabled={isOutOfStock||isInCart}
            onClick={() => addToCart( { ...product, quantity: 1 }, user, location, deviceInfo)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-background text-primary-text shadow-sm transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart
              size={18}
              className={isInCart ? 'text-primary' : 'text-primary-text'}
            />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {product.shop?.name && (
          <Link
            href={`/shop/${product.shop.id}`}
            className="truncate text-xs font-medium text-muted-text hover:text-primary"
          >
            {product.shop.name}
          </Link>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-11 text-sm font-semibold leading-6 text-primary-text transition-colors hover:text-primary sm:text-base">
            {product.title}
          </h3>
        </Link>

        <Rating rating={product.ratings} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-primary">
              ${product.sale_price.toFixed(2)}
            </span>

            {product.regular_price > product.sale_price && (
              <span className="text-sm text-secondary-text line-through">
                ${product.regular_price.toFixed(2)}
              </span>
            )}
          </div>

          {product.total_sales > 0 && (
            <span className="whitespace-nowrap text-xs font-medium text-muted-text">
              {product.total_sales.toLocaleString()} sold
            </span>
          )}
        </div>

        {isEvent && timeLeft && (
          <div
            className="mt-auto flex flex-wrap items-center gap-1 text-sm font-medium text-primary"
            role="timer"
          >
            <span className="font-bold">Hurry!</span>
            <span>{timeLeft}</span>
          </div>
        )}
      </div>
      {open &&
        createPortal(
          <ProductDetailsCard data={product} setOpen={setOpen} />,
          document.body,
        )}{' '}
    </div>
  );
};

export default ProductCard;
