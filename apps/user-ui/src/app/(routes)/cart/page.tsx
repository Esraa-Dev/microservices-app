
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  ShoppingBag,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Tag,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
} from 'lucide-react';

import { useStore } from '@/store';
import { useUser } from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';

const CartPage = () => {
  const cart = useStore((state) => state.cart);
  const addToCart = useStore((state) => state.addToCart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const deleteFromCart = useStore((state) => state.deleteFromCart);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const [couponCode, setCouponCode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');

  const shippingFee = cart.length > 0 ? 5 : 0;
  const discountAmount = 0;

  const subtotal = cart.reduce((acc, product) => {
    return (
      acc +
      product.sale_price * (product.quantity ?? 1)
    );
  }, 0);

  const totalQuantity = cart.reduce((acc, product) => {
    return acc + (product.quantity ?? 1);
  }, 0);

  const total = subtotal - discountAmount + shippingFee;

  const increaseQuantity = (productId: string) => {
    const product = cart.find((item) => item.id === productId);

    if (!product) return;

    const quantity = product.quantity ?? 1;

    if (quantity >= product.stock) return;

    addToCart(product, user, location, deviceInfo);
  };

  const decreaseQuantity = (productId: string) => {
    const product = cart.find((item) => item.id === productId);

    if (!product || (product.quantity ?? 1) <= 1) return;

    removeFromCart(productId, user, location, deviceInfo);
  };

  const deleteProduct = (productId: string) => {
    deleteFromCart(productId);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="page-container py-8 sm:py-12">
        <nav className="mb-7 flex items-center gap-2 text-xs text-muted-text">
          <Link href="/" className="transition hover:text-primary">
            Home
          </Link>
          <ChevronRight size={13} />
          <span className="text-primary-text">Shopping Cart</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary-text sm:text-3xl">
              Shopping Cart
            </h1>
            <p className="mt-2 text-sm text-secondary-text">
              Review your items before checkout.
            </p>
          </div>

          <span className="text-sm text-secondary-text">
            <strong className="font-semibold text-primary">
              {totalQuantity}
            </strong>{' '}
            items
          </span>
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="min-w-0">
              <div className="overflow-hidden rounded-xl border border-border bg-white">
                <div className="hidden grid-cols-[minmax(0,1fr)_100px_116px_32px] items-center gap-4 border-b border-border bg-surface px-5 py-4 text-xs font-semibold text-secondary-text lg:grid">
                  <span>Product</span>
                  <span>Price</span>
                  <span>Quantity</span>
                  <span />
                </div>

                {cart.map((product, index) => {
                  const quantity = product.quantity ?? 1;
                  const outOfStock = product.stock <= 0;
                  const reachedStock = quantity >= product.stock;
                  const imageUrl = product.images?.[0]?.url;

                  return (
                    <div
                      key={product.id}
                      className={`p-4 sm:p-5 ${
                        index !== cart.length - 1
                          ? 'border-b border-border'
                          : ''
                      }`}
                    >
                      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,1fr)_100px_116px_32px] lg:gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <Link
                            href={
                              product.slug
                                ? `/products/${product.slug}`
                                : '/products'
                            }
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
                              href={
                                product.slug
                                  ? `/products/${product.slug}`
                                  : '/products'
                              }
                              className="line-clamp-2 text-sm font-semibold leading-6 text-primary-text transition hover:text-primary"
                            >
                              {product.title}
                            </Link>

                            {product.colors?.map((color, colorIndex) => (
                              <p
                                key={`${color}-${colorIndex}`}
                                className="mt-1.5 text-xs text-secondary-text"
                              >
                                Color: {color}
                              </p>
                            ))}

                            {product.sizes?.map((size, sizeIndex) => (
                              <p
                                key={`${size}-${sizeIndex}`}
                                className="mt-1 text-xs text-secondary-text"
                              >
                                Size: {size}
                              </p>
                            ))}

                            <p
                              className={`mt-2 text-xs font-medium ${
                                outOfStock
                                  ? 'text-red-500'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {outOfStock ? 'Out of stock' : 'In stock'}
                            </p>

                            <div className="mt-2 lg:hidden">
                              <p className="text-base font-semibold text-primary">
                                ${product.sale_price.toFixed(2)}
                              </p>
                              {product.regular_price > product.sale_price && (
                                <p className="mt-1 text-xs text-secondary-text line-through">
                                  ${product.regular_price.toFixed(2)}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-secondary-text">
                                Item total: ${(product.sale_price * quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="hidden lg:block">
                          <p className="text-sm font-semibold text-primary-text">
                            ${product.sale_price.toFixed(2)}
                          </p>
                          {product.regular_price > product.sale_price && (
                            <p className="mt-1 text-xs text-secondary-text line-through">
                              ${product.regular_price.toFixed(2)}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-secondary-text">
                            × {quantity}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 lg:block">
                          <div className="text-xs text-secondary-text lg:hidden">
                            Quantity
                          </div>

                          <div className="inline-flex h-9 items-center rounded-lg border border-border">
                            <button
                              type="button"
                              aria-label={`Decrease ${product.title} quantity`}
                              disabled={quantity <= 1}
                              onClick={() => decreaseQuantity(product.id)}
                              className="flex h-full w-8 cursor-pointer items-center justify-center text-secondary-text transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-8 text-center text-sm font-medium text-primary-text">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              aria-label={`Increase ${product.title} quantity`}
                              disabled={outOfStock || reachedStock}
                              onClick={() => increaseQuantity(product.id)}
                              className="flex h-full w-8 cursor-pointer items-center justify-center text-secondary-text transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteProduct(product.id)}
                          aria-label={`Remove ${product.title} from cart`}
                          className="hidden h-9 w-9 cursor-pointer items-center justify-center text-muted-text transition hover:text-red-500 lg:flex"
                        >
                          <Trash2 size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteProduct(product.id)}
                          className="flex w-fit cursor-pointer items-center gap-1.5 text-xs text-muted-text transition hover:text-red-500 lg:hidden"
                        >
                          <Trash2 size={14} />
                          Remove from cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-end">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:underline"
                >
                  Continue Shopping
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>

            <aside className="rounded-xl border border-border bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-primary-text">
                  Order Summary
                </h2>
              </div>

              <div className="space-y-3 border-b border-border pb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-text">
                    Subtotal ({totalQuantity} items)
                  </span>
                  <span className="font-semibold text-primary-text">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-text">Discount</span>
                    <span className="font-medium text-emerald-600">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-text">Shipping</span>
                  <span className="font-medium text-primary-text">
                    ${shippingFee.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-5 py-5">
                <div>
                  <label
                    htmlFor="coupon"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-primary-text"
                  >
                    <Tag size={16} className="text-primary" />
                    Have a Coupon?
                  </label>

                  <div className="flex gap-2">
                    <input
                      id="coupon"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-white px-3 text-sm text-primary-text outline-none transition focus:border-primary"
                    />

                    <button
                      type="button"
                      disabled
                      className="h-10 shrink-0 rounded-lg bg-primary px-4 text-xs font-semibold text-white opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="shipping-address"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-primary-text"
                  >
                    <MapPin size={16} className="text-primary" />
                    Shipping Address
                  </label>

                  <select
                    id="shipping-address"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="h-11 w-full cursor-pointer rounded-lg border border-border bg-white px-3 text-sm text-secondary-text outline-none focus:border-primary"
                  >
                    <option value="">Select shipping address</option>
                  </select>

                  <p className="mt-2 text-xs text-muted-text">
                    Your saved addresses will appear here.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="payment-method"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-primary-text"
                  >
                    <CreditCard size={16} className="text-primary" />
                    Payment Method
                  </label>

                  <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-11 w-full cursor-pointer rounded-lg border border-border bg-white px-3 text-sm text-primary-text outline-none focus:border-primary"
                  >
                    <option value="online">Online Payment</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-base font-semibold text-primary-text">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <p className="mb-5 text-right text-xs text-muted-text">
                  Including shipping, excluding applicable taxes
                </p>

                <button
                  type="button"
                  disabled
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white opacity-50"
                >
                  Proceed to Checkout
                  <ArrowRight size={17} />
                </button>

                <p className="mt-2 text-center text-xs text-muted-text">
                  Checkout integration pending
                </p>
              </div>

              <div className="mt-5 space-y-2 border-t border-border pt-5">
                <div className="flex items-center gap-2 text-xs text-secondary-text">
                  <ShieldCheck size={16} className="text-primary" />
                  Secure checkout
                </div>

                <div className="flex items-center gap-2 text-xs text-secondary-text">
                  <Truck size={16} className="text-primary" />
                  Shipping options shown at checkout
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-18 text-center">
            <ShoppingCart
              size={40}
              strokeWidth={1.4}
              className="mb-4 text-primary"
            />

            <h2 className="text-lg font-semibold text-primary-text">
              Your cart is empty
            </h2>

            <p className="mt-2 max-w-sm text-sm text-secondary-text">
              Discover products you love and add them to your cart.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:brightness-95"
            >
              Explore Products
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;
