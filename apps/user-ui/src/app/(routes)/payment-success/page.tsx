'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Truck, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '@/store';
import Link from 'next/link';

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    useStore.setState({ cart: [] });
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={36} />
        </div>

        <h1 className="text-2xl font-bold text-primary-text">Payment Successful</h1>
        <p className="mt-2 text-sm text-secondary-text">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {sessionId && (
          <p className="mt-3 text-xs text-muted-text bg-surface py-1.5 px-3 rounded-lg truncate">
            Session ID: <span className="font-mono text-primary-text">{sessionId}</span>
          </p>
        )}

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => router.replace('/profile?active=my+orders')}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-95"
          >
            <Truck size={17} />
            <span>Track Order</span>
            <ArrowRight size={16} />
          </button>

          <Link
            href="/"
            className="flex h-11 w-full items-center justify-center rounded-lg border border-border bg-white text-sm font-medium text-primary-text transition hover:bg-surface"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
};

const PaymentSuccessPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;