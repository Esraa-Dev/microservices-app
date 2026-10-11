
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const router = useRouter();         

  return (
    <section className="min-h-[calc(100vh-3.5rem)] bg-background bg-[url('/hero-bg.webp')] bg-cover bg-center">
      <div className="grid min-h-screen grid-cols-1 items-center gap-8 padding-x lg:grid-cols-2 page-container">

        <div className="flex flex-col items-start justify-center py-10 lg:py-0">
          <span className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            Starting from $40
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-primary-text sm:text-5xl lg:text-6xl">
            The Best Watch
            <span className="block text-primary">
              Collection 2025
            </span>
          </h1>

          <p className="mt-5 text-base leading-7 text-secondary-text sm:text-lg">
            Exclusive offer{' '}
            <span className="font-bold text-primary">10% off</span>{' '}
            this week.
          </p>

          <button
            onClick={() => router.push('/products')}
            className="group mt-8 flex min-h-12 items-center justify-center gap-3 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            Shop Now
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-150">
          <div className="relative aspect-4/3 w-full overflow-hidden">
            <Image
              src="/hero-2.webp"
              alt="Premium smartwatch collection"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-contain object-center"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
