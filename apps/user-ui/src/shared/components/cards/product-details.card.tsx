'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  ShoppingCart,
  Heart,
  MapPin,
  MessageCircle,
  Truck,
  Minus,
  Plus,
} from 'lucide-react';
import Rating from '../rating';
import { useStore } from '@/store';
import { useUser } from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';

type ProductImage = {
  id: string;
  url: string;
};

type Product = {
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
  colors?: string[];
  sizes?: string[];
  shop?: {
    id: string;
    name: string;
    avatar?: string | null;
    address?: string | null;
  };
};

type ProductDetailsCardProps = {
  data: Product;
  setOpen: (open: boolean) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onAddToWishlist?: (product: Product) => void;
};

const ProductDetailsCard = ({
  data,
  setOpen,
  onAddToCart,
  onAddToWishlist,
}: ProductDetailsCardProps) => {
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');
  const wishlist = useStore((state: any) => state.wishlist);
  const isInWishlist = wishlist.some((item: Product) => item.id === data.id);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const addTowishlist = useStore((state: any) => state.addToWishlist);
  const cart = useStore((state: any) => state.cart);
  const addToCart = useStore((state: any) => state.addToCart);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const isInCart = cart.some((item: Product) => item.id === data.id);
  const images = data.images ?? [];
  const isOutOfStock = data.stock <= 0;

  useEffect(() => {
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 5);

    setEstimatedDelivery(delivery.toDateString());
  }, []);

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, data.stock));
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleChatSeller = () => {
    if (!data.shop?.id) return;

    setOpen(false);
    router.push(`/inbox?shopId=${data.shop.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={data.title}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[95dvh] w-full max-w-4xl overflow-y-auto rounded-xl bg-background shadow-xl sm:max-h-[90dvh]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close modal"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface text-primary-text shadow-sm transition hover:text-primary"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 gap-6 p-4 sm:p-7 md:grid-cols-2">
          {/* LEFT: PRODUCT IMAGES */}
          <div className="min-w-0 space-y-3">
            {/* Active Image */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
              {images[activeImage]?.url ? (
                <Image
                  src={images[activeImage].url}
                  alt={`${data.title} - Image ${activeImage + 1}`}
                  fill
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className="object-contain p-5"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-secondary-text">
                  No image available
                </div>
              )}
            </div>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={image.id ?? index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={activeImage === index}
                    className={`relative h-17 w-17 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20 ${
                      activeImage === index
                        ? 'border-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${data.title} thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT DETAILS */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* Seller Information */}
            {data.shop && (
              <div className="flex items-center gap-3 border-b border-border pb-4 pr-10">
                {data.shop.avatar ? (
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface">
                    <Image
                      src={data.shop.avatar}
                      alt={data.shop.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-lg font-semibold text-primary">
                    {data.shop.name?.charAt(0)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-primary-text">
                    {data.shop.name}
                  </p>

                  {data.shop.address && (
                    <p className="flex items-center gap-1 text-xs text-secondary-text">
                      <MapPin size={13} className="shrink-0" />
                      <span className="truncate">{data.shop.address}</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleChatSeller}
                  className="flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <MessageCircle size={16} />
                  Chat
                </button>
              </div>
            )}

            {/* Product Title */}
            <h2 className="text-xl font-semibold text-primary-text sm:text-2xl">
              {data.title}
            </h2>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-3">
              <Rating rating={data.ratings} />

              {data.total_sales > 0 && (
                <span className="text-xs text-secondary-text">
                  {data.total_sales.toLocaleString()} sold
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold text-primary">
                ${data.sale_price.toFixed(2)}
              </span>

              {data.regular_price > data.sale_price && (
                <span className="text-sm text-secondary-text line-through">
                  ${data.regular_price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            {data.short_description && (
              <p className="whitespace-pre-wrap text-sm leading-6 text-secondary-text">
                {data.short_description}
              </p>
            )}

            {/* Brand */}
            {data.brand && (
              <p className="text-sm text-primary-text">
                <span className="font-semibold">Brand:</span> {data.brand}
              </p>
            )}

            {/* Colors */}
            {(data.colors?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-primary-text">
                  Available Colors
                </p>

                <div className="flex flex-wrap gap-2">
                  {data.colors?.map((color) => (
                    <span
                      key={color}
                      className="rounded-md border border-border px-3 py-1 text-xs text-primary-text"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {(data.sizes?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-primary-text">
                  Available Sizes
                </p>

                <div className="flex flex-wrap gap-2">
                  {data.sizes?.map((size) => (
                    <span
                      key={size}
                      className="rounded-md border border-border px-3 py-1 text-xs text-primary-text"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="text-sm">
              <span className="font-medium text-primary-text">
                Availability:{' '}
              </span>

              <span
                className={
                  isOutOfStock
                    ? 'font-medium text-red-600'
                    : 'font-medium text-green-600'
                }
              >
                {isOutOfStock ? 'Out of stock' : `${data.stock} in stock`}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-primary-text">
                Quantity:
              </span>

              <div className="flex items-center overflow-hidden rounded-lg border border-border">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Decrease quantity"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={16} />
                </button>

                <span className="min-w-10 text-center text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= data.stock || isOutOfStock}
                  aria-label="Increase quantity"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isInWishlist) {
                    removeFromWishlist(data.id, user, location, deviceInfo);
                  } else {
                    addTowishlist(data, user, location, deviceInfo);
                  }
                }}
                aria-label={
                  isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'
                }
                aria-pressed={isInWishlist}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border text-primary-text transition hover:border-primary hover:text-primary"
              >
                <Heart
                  size={18}
                  className={
                    isInWishlist
                      ? 'fill-primary text-primary'
                      : 'text-primary-text'
                  }
                />
              </button>
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              disabled={isOutOfStock||isInCart}
              onClick={() => {
                addToCart(data, user, location, deviceInfo, quantity);
              }}
              aria-label={
                isInCart
                  ? 'Add more of this product to cart'
                  : 'Add product to cart'
              }
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart
                size={18}
                className={isInCart ? 'text-white' : ''}
              />
         Add to Cart
            </button>

            {/* Estimated Delivery */}
            {estimatedDelivery && (
              <div className="flex items-center gap-2 border-t border-border pt-4 text-sm text-secondary-text">
                <Truck size={18} className="shrink-0 text-primary" />
                <span>
                  Estimated delivery:{' '}
                  <strong className="text-primary-text">
                    {estimatedDelivery}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;
