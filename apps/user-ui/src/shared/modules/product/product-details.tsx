
'use client';

import { useEffect, useState } from 'react';
import {
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Store,
  MessageCircle,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react';

import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

import Rating from '@/shared/components/rating';
import { useStore } from '@/store';
import { useUser } from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';
import Link from 'next/link';
import ProductCard from '@/shared/components/cards/product-card';
import axiosInstance from '@/utils/axiosInstance';

export default function ProductDetails({ productInfo }: any) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(productInfo?.sizes?.[0] ?? '');
  const [selectedColor, setSelectedColor] = useState(productInfo?.colors?.[0] ?? '');
  const [quantity, setQuantity] = useState(1);

  const wishlist = useStore((state: any) => state.wishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const addTowishlist = useStore((state: any) => state.addToWishlist);
  const cart = useStore((state: any) => state.cart);
  const addToCart = useStore((state: any) => state.addToCart);

  const isInWishlist = wishlist.some((item: any) => item.id === productInfo.id);
  const isInCart = cart.some((item: any) => item.id === productInfo.id);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const [recomandedProduct, setRecomandedProduct] = useState<any[]>([]);
  const [priceRange] = useState([productInfo.sale_price, 1199]);

  const images = productInfo?.images ?? [];
  const stock = productInfo?.stock ?? 0;

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const query = new URLSearchParams();
        query.set('page', '1');
        query.set('limit', '5');
        query.set('priceRange', priceRange.join(','));

        const res = await axiosInstance.get(
          `/products/get-filtered-products?${query.toString()}`
        );

        setRecomandedProduct(res.data.products);
      } catch (error) {
        console.error('Error fetching filtered products:', error);
      }
    };

    fetchFilteredProducts();
  }, [priceRange]);

  const handleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist(productInfo.id, user, location, deviceInfo);
    } else {
      addTowishlist(
        {
          ...productInfo,
          quantity,
          selectedColor,
          selectedSize,
        },
        user,
        location,
        deviceInfo
      );
    }
  };

  const handlePreviousImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  return (
    <section className="page-container py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr_0.85fr]">
        <div className="min-w-0">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface">
            {images.length > 0 && (
              <Zoom>
                <img
                  key={images[selectedImage]?.url}
                  src={images[selectedImage]?.url}
                  alt={productInfo?.title || 'Product image'}
                  className="h-full w-full cursor-zoom-in object-contain"
                />
              </Zoom>
            )}

            <button
              type="button"
              aria-label="Toggle favorite"
              onClick={handleWishlist}
              className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-background shadow-sm cursor-pointer"
            >
              <Heart
                size={20}
                fill={isInWishlist ? 'red' : 'transparent'}
                color={isInWishlist ? 'red' : '#777'}
              />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              disabled={selectedImage === 0 || images.length <= 1}
              onClick={handlePreviousImage}
              aria-label="Previous image"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border hover:bg-surface disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            {images.map((image: any, index: number) => (
              <button
                key={image.url}
                type="button"
                onClick={() => setSelectedImage(index)}
                aria-label={`View image ${index + 1}`}
                className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-surface p-1 sm:size-20 ${
                  selectedImage === index ? 'border-primary' : 'border-border'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Product view ${index + 1}`}
                  className="h-full w-full object-contain"
                />
              </button>
            ))}

            <button
              type="button"
              disabled={selectedImage === images.length - 1 || images.length <= 1}
              onClick={handleNextImage}
              aria-label="Next image"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border hover:bg-surface disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>

            <span className="text-sm text-muted-foreground">
              {images.length > 0 ? selectedImage + 1 : 0} / {images.length}
            </span>
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          <div>
            <p className="mb-2 text-sm text-secondary-text">
              Brand: {productInfo?.brand || 'No Brand'}
            </p>

            <h1 className="text-2xl font-semibold text-primary-text">
              {productInfo?.title}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <Rating rating={productInfo?.ratings} />
              <span className="text-secondary-text">(120 reviews)</span>
            </div>
          </div>

          <div className="border-y border-border py-4">
            <p className="text-sm text-secondary-text">Price</p>
            <span className="text-3xl font-bold text-primary">
              ${productInfo?.sale_price?.toFixed(2)}
            </span>
            <span className="ml-2 text-sm text-secondary-text line-through">
              ${productInfo?.regular_price?.toFixed(2)}
            </span>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium">Sizes</p>
            <div className="flex flex-wrap gap-2">
              {productInfo?.sizes?.map((size: any) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-11 rounded-lg border px-3 py-2 text-sm transition ${
                    selectedSize === size
                      ? 'border-primary bg-primary text-white'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium">Colors</p>
            <div className="flex flex-wrap gap-2">
              {productInfo?.colors?.map((color: string) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                  aria-pressed={selectedColor === color}
                  style={{ backgroundColor: color }}
                  className={`size-11 rounded-lg border-2 transition ${
                    selectedColor === color
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-border hover:border-primary'
                  }`}
                />
              ))}
            </div>
          </div>

          {stock > 0 ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="size-2 rounded-full bg-green-600" />
              <span className="font-medium text-primary-text">In Stock</span>
              <span className="text-secondary-text">({stock} items)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="size-2 rounded-full bg-red-600" />
              <span className="font-medium text-primary-text">Out Of Stock</span>
            </div>
          )}

          <div>
            <p className="mb-3 text-sm font-medium">Quantity</p>
            <div className="inline-flex items-center overflow-hidden rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="cursor-pointer p-3 hover:bg-surface disabled:opacity-40"
              >
                <Minus size={16} />
              </button>

              <span className="min-w-12 text-center text-sm">{quantity}</span>

              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(stock, current + 1))}
                disabled={quantity >= stock}
                aria-label="Increase quantity"
                className="cursor-pointer p-3 hover:bg-surface disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button
            type="button"
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-medium text-white transition hover:bg-primary-hover ${
              isInCart || stock === 0
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            }`}
            disabled={isInCart || stock === 0}
            onClick={() =>
              addToCart(
                {
                  ...productInfo,
                  quantity,
                  selectedColor,
                  selectedSize,
                },
                user,
                location,
                deviceInfo
              )
            }
          >
            <ShoppingCart size={19} />
            Add to Cart
          </button>
        </div>

        <aside className="min-w-0 space-y-5 rounded-2xl border border-border bg-background p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-primary-text">
            Delivery & Policies
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 shrink-0 text-primary" size={21} />
              <div>
                <p className="text-sm font-medium">Delivery Options</p>
                <p className="mt-1 text-sm text-secondary-text">
                  {location?.city}, {location?.country}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RotateCcw className="mt-0.5 shrink-0 text-primary" size={21} />
              <div>
                <p className="text-sm font-medium">7 Days Return</p>
                <p className="mt-1 text-sm text-secondary-text">
                  Return policy information
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={21} />
              <div>
                <p className="text-sm font-medium">Warranty</p>
                <p className="mt-1 text-sm text-secondary-text">Not available</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface">
                <Store size={20} className="text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-secondary-text">Sold by</p>
                <p className="truncate font-medium">{productInfo?.shop?.name}</p>
              </div>
            </div>

            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-3 py-2.5 text-sm font-medium text-primary transition hover:bg-surface"
            >
              <MessageCircle size={17} />
              Chat Now
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
            <div className="min-w-0 text-center">
              <p className="min-h-10 text-xs leading-5 text-secondary-text">
                Positive seller rating
              </p>
              <p className="mt-1 text-lg font-bold text-primary-text">88%</p>
            </div>

            <div className="min-w-0 border-x border-border px-1 text-center">
              <p className="min-h-10 text-xs leading-5 text-secondary-text">
                Ships on time
              </p>
              <p className="mt-1 text-lg font-bold text-primary-text">100%</p>
            </div>

            <div className="min-w-0 text-center">
              <p className="min-h-10 text-xs leading-5 text-secondary-text">
                Chat response rate
              </p>
              <p className="mt-1 text-lg font-bold text-primary-text">100%</p>
            </div>
          </div>

          <Link
            href={`/shop/${productInfo?.shop?.id}`}
            className="block w-full rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-primary-text transition hover:border-primary hover:text-primary"
          >
            Go to Store
          </Link>
        </aside>
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-2xl font-bold text-primary-text">
          Ratings & Reviews of {productInfo?.title}
        </h2>

        <p className="mt-4 text-sm text-secondary-text">
          No reviews available yet.
        </p>
      </div>

      <div className="mt-12">
        <h3 className="mb-6 text-2xl font-bold text-primary-text">
          You May Also Like
        </h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {recomandedProduct.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
