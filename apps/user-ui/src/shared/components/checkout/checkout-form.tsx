'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2, Lock, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface CheckoutFormProps {
  clientSecret: string;
  cart: any[];
  coupon?: string;
  sessionId: string;
}

const CheckoutForm = ({ cart, sessionId }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.sale_price ?? item.sale ?? 0) * (item.quantity ?? 1), 0);
  const shippingFee = cart.length > 0 ? 5 : 0;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?sessionId=${sessionId}`,
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message || 'Something went wrong during payment processing.');
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Lock className="text-primary size-5" />
        <h2 className="text-base font-semibold text-primary-text">Secure Payment Checkout</h2>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary-text mb-2">
          <ShoppingBag size={16} className="text-primary" />
          <span>Order Summary ({cart.length} items)</span>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
          {cart.map((item, index) => {
            const qty = item.quantity ?? 1;
            const price = item.sale_price ?? item.sale ?? 0;
            const itemTotal = qty * price;
            const imageUrl = item.images?.[0]?.url;

            return (
              <div key={index} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  {imageUrl ? (
                    <div className="relative size-12 shrink-0 rounded-md overflow-hidden bg-white border border-border">
                      <Image src={imageUrl} alt={item.title || 'Product'} fill className="object-contain p-1" />
                    </div>
                  ) : (
                    <div className="size-12 shrink-0 rounded-md bg-white border border-border flex items-center justify-center text-xs text-muted-text">
                      No img
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-primary-text truncate">{item.title}</p>
                    <p className="text-xs text-secondary-text">Qty: {qty}</p>
                  </div>
                </div>
                <span className="font-semibold text-primary-text shrink-0">${itemTotal.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border pt-3 mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-secondary-text">
            <span>Shipping</span>
            <span>${shippingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-primary-text text-base pt-1 border-t border-border">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border p-4 bg-white">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500 border border-red-200">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && <Loader2 className="animate-spin w-5 h-5" />}
        <span>{loading ? 'Processing...' : 'Pay Now'}</span>
      </button>
    </form>
  );
};

export default CheckoutForm;