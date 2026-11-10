'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import authAxiosInstance from '@/utils/authAxiosInstance';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import CheckoutForm from '@/shared/components/checkout/checkout-form';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY!
);

const CheckoutContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get('sessionId');
  const [clientSecret, setClientSecret] = useState('');

  const [cart, setCart] = useState<any[]>([]);
  const [coupon, setCoupon] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('Missing session ID');
      setLoading(false);
      return;
    }

    const fetchPaymentSession = async () => {
      try {
        const res = await authAxiosInstance.get(
          `/order/verify-payment-session?sessionId=${sessionId}`,
        );
        const sessionData = res.data.data;

        setCart(sessionData.cart || []);
        setCoupon(sessionData.coupon || '');

        const totalAmount = sessionData.totalAmount;
        const sellerStripeAccountId = sessionData.sellerData?.[0]?.stripeId;

        const intentRes = await authAxiosInstance.post(
          '/order/create-payment-intent',
          {
            amount: totalAmount,
            sellerStripeAccountId,
            sessionId,
          },
        );

        setClientSecret(intentRes.data.clientSecret);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || 'Failed to load checkout session',
        );
        toast.error('Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-center">
        <p className="text-red-500 font-semibold">{error}</p>
        <button
          onClick={() => router.push('/cart')}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  const appearance: Appearance = {
    theme: 'stripe',
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl border border-border p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-primary-text mb-6">
          Complete Your Payment
        </h1>

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance }}
          >
            <CheckoutForm
              clientSecret={clientSecret}
              cart={cart}
              coupon={coupon}
              sessionId={sessionId || ''}
            />
          </Elements>
        )}
      </div>
    </main>
  );
};

const CheckoutPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
};

export default CheckoutPage;