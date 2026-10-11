
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/store';
import { useUser } from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';

const WishlistPage = () => {
  const wishlist = useStore((state) => state.wishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const addToCart = useStore((state) => state.addToCart);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const decreaseQuantity = (id: string) => {
    useStore.setState((state) => ({
      wishlist: state.wishlist.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, (item.quantity ?? 1) - 1),
            }
          : item,
      ),
    }));
  };

  const increaseQuantity = (id: string) => {
    useStore.setState((state) => ({
      wishlist: state.wishlist.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(
                item.stock,
                (item.quantity ?? 1) + 1,
              ),
            }
          : item,
      ),
    }));
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="page-container py-8 sm:py-12">
        <nav className="mb-7 flex items-center gap-2 text-xs text-muted-text">
          <Link href="/" className="transition hover:text-primary">
            Home
          </Link>
          <ChevronRight size={13} />
          <span className="text-primary-text">Wishlist</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary-text sm:text-3xl">
              My Wishlist
            </h1>
            <p className="mt-2 text-sm text-secondary-text">
              Products you&apos;ve saved for later.
            </p>
          </div>

          <span className="text-sm text-secondary-text">
            <strong className="font-semibold text-primary">
              {wishlist.length}
            </strong>{' '}
            items
          </span>
        </div>

        {wishlist.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="hidden grid-cols-[minmax(0,1fr)_120px_130px_150px_36px] items-center gap-5 border-b border-border bg-surface px-6 py-4 text-xs font-semibold text-secondary-text lg:grid">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Action</span>
                <span />
              </div>

              {wishlist.map((product) => {
                const quantity = product.quantity ?? 1;
                const price = Number(
                  product.sale_price ?? product.regular_price,
                );
                const imageUrl = product.images?.[0]?.url;
                const isOutOfStock = product.stock <= 0;
                const reachedStock = quantity >= product.stock;

                return (
                  <div
                    key={product.id}
                    className="border-b border-border px-4 py-5 last:border-b-0 sm:px-6"
                  >
                    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_120px_130px_150px_36px] lg:gap-5">
                      <div className="flex min-w-0 items-center gap-4">
                        <Link
                          href={`/products/${product.slug}`}
                          className="relative h-22 w-22 shrink-0 overflow-hidden rounded-lg bg-surface sm:h-24 sm:w-24"
                        >
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product.title}
                              fill
                              sizes="96px"
                              className="object-contain p-2"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-text">
                              No image
                            </div>
                          )}
                        </Link>

                        <div className="min-w-0">
                          {product.category && (
                            <p className="mb-1 text-xs text-secondary-text">
                              {product.category}
                            </p>
                          )}

                          <Link
                            href={`/products/${product.slug}`}
                            className="line-clamp-2 text-sm font-semibold text-primary-text transition-colors hover:text-primary"
                          >
                            {product.title}
                          </Link>

                          {product.colors?.map((color, index) => (
                            <p
                              key={`${color}-${index}`}
                              className="mt-1.5 text-xs text-secondary-text"
                            >
                              Color: {color}
                            </p>
                          ))}

                          {product.sizes?.map((size, index) => (
                            <p
                              key={`${size}-${index}`}
                              className="mt-1 text-xs text-secondary-text"
                            >
                              Size: {size}
                            </p>
                          ))}

                          <span
                            className={`mt-2 inline-flex items-center gap-1.5 text-xs ${
                              isOutOfStock
                                ? 'text-red-500'
                                : 'text-emerald-600'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isOutOfStock
                                  ? 'bg-red-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            {isOutOfStock ? 'Out of stock' : 'In stock'}
                          </span>

                          <div className="mt-2 lg:hidden">
                            <p className="text-base font-semibold text-primary-text">
                              ${price.toFixed(2)}
                            </p>

                            {product.regular_price > price && (
                              <p className="text-xs text-secondary-text line-through">
                                ${product.regular_price.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="hidden lg:block">
                        <p className="text-base font-semibold text-primary-text">
                          ${price.toFixed(2)}
                        </p>

                        {product.regular_price > price && (
                          <p className="mt-1 text-xs text-secondary-text line-through">
                            ${product.regular_price.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end lg:justify-start">
                        <span className="text-xs text-secondary-text lg:hidden">
                          Quantity
                        </span>

                        <div className="flex h-9 items-center rounded-lg border border-border">
                          <button
                            type="button"
                            aria-label={`Decrease ${product.title} quantity`}
                            disabled={quantity <= 1}
                            onClick={() => decreaseQuantity(product.id)}
                            className="flex h-full w-8 cursor-pointer items-center justify-center text-secondary-text hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="w-7 text-center text-sm font-medium text-primary-text">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Increase ${product.title} quantity`}
                            disabled={isOutOfStock || reachedStock}
                            onClick={() => increaseQuantity(product.id)}
                            className="flex h-full w-8 cursor-pointer items-center justify-center text-secondary-text hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() =>
                          addToCart(
                            product,
                            user,
                            location,
                            deviceInfo,
                            quantity,
                          )
                        }
                        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 lg:col-span-1"
                      >
                        <ShoppingBag size={16} />
                        Add to Cart
                      </button>

                      <button
                        type="button"
                        aria-label={`Remove ${product.title} from wishlist`}
                        onClick={() =>
                          removeFromWishlist(
                            product.id,
                            user,
                            location,
                            deviceInfo,
                          )
                        }
                        className="hidden h-9 w-9 cursor-pointer items-center justify-center text-muted-text transition hover:text-red-500 lg:flex"
                      >
                        <Trash2 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromWishlist(
                            product.id,
                            user,
                            location,
                            deviceInfo,
                          )
                        }
                        className="flex cursor-pointer items-center justify-center gap-1.5 text-xs text-muted-text hover:text-red-500 sm:col-span-2 lg:hidden"
                      >
                        <Trash2 size={14} />
                        Remove from wishlist
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Continue Shopping
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-16 text-center">
            <Heart
              size={38}
              strokeWidth={1.4}
              className="mb-4 text-primary"
            />

            <h2 className="text-lg font-semibold text-primary-text">
              Your wishlist is empty
            </h2>

            <p className="mt-2 max-w-sm text-sm text-secondary-text">
              Explore our collection and save the products you love.
            </p>

            <Link
              href="/products"
              className="mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:brightness-95"
            >
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default WishlistPage;
