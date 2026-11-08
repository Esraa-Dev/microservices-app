
'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { categories } from '@/configs/categories';
import { countries } from '@/configs/countries';
import ShopCard from '@/shared/components/cards/shop.card';

const LIMIT = 12;

const ShopsPage = () => {
  const router = useRouter();

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Fetch filtered shops
  const {
    data: shopsData,
    isLoading: shopsLoading,
    isError,
  } = useQuery({
    queryKey: [
      'filtered-shops',
      page,
      selectedCategories,
      selectedCountries,
    ],
    queryFn: async () => {
      const query = new URLSearchParams();

      query.set('page', page.toString());
      query.set('limit', LIMIT.toString());

      if (selectedCategories.length > 0) {
        query.set('categories', selectedCategories.join(','));
      }

      if (selectedCountries.length > 0) {
        query.set('countries', selectedCountries.join(','));
      }

      const res = await axiosInstance.get(
        `/products/get-filtered-shops?${query.toString()}`,
      );

      return res.data;
    },
    staleTime: 1000 * 60,
  });

  const shops = shopsData?.shops ?? [];
  const totalPages = shopsData?.pagination?.totalPages ?? 1;

  // Sync filters with URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    }

    if (selectedCountries.length > 0) {
      params.set('countries', selectedCountries.join(','));
    }

    if (page > 1) {
      params.set('page', page.toString());
    }

    const queryString = params.toString();

    router.replace(
      queryString ? `/shops?${queryString}` : '/shops',
      { scroll: false },
    );
  }, [selectedCategories, selectedCountries, page, router]);

  // Toggle category
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );

    setPage(1);
  };

  // Toggle country
  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((item) => item !== country)
        : [...prev, country],
    );

    setPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    setPage(1);
  };

  return (
    <section className="page-container py-8 sm:py-10">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-3 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-secondary-text transition-colors hover:text-primary"
          >
            Home
          </Link>

          <span className="text-muted-text">/</span>

          <span className="font-medium text-primary-text">
            All Shops
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary-text sm:text-3xl">
            All Shops
          </h1>

          <p className="mt-2 text-sm text-secondary-text sm:text-base">
            Explore our collection and find the perfect shops for you.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="h-fit w-full rounded-xl border border-border bg-background p-5 lg:w-1/4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-text">
              Filters
            </h2>

            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-primary transition-colors hover:underline"
            >
              Clear all
            </button>
          </div>

          {/* Categories */}
          <div className="border-b border-border py-6">
            <h3 className="mb-4 font-semibold text-primary-text">
              Categories
            </h3>

            <ul className="flex flex-col gap-3">
              {categories.map((category) => (
                <li key={category.value}>
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-secondary-text transition-colors hover:text-primary-text">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => toggleCategory(category.value)}
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />

                    <span>{category.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Countries */}
          <div className="py-6">
            <h3 className="mb-4 font-semibold text-primary-text">
              Countries
            </h3>

            <ul className="flex max-h-64 flex-col gap-3 overflow-y-auto">
              {countries.map((country) => (
                <li key={country}>
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-secondary-text transition-colors hover:text-primary-text">
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country)}
                      onChange={() => toggleCountry(country)}
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />

                    <span>{country}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Shops Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-primary-text">
                Shops
              </h2>

              <p className="mt-1 text-sm text-secondary-text">
                {shops.length} shops found
              </p>
            </div>
          </div>

          {/* Loading */}
          {shopsLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-80 animate-pulse rounded-xl bg-surface"
                />
              ))}
            </div>
          ) : isError ? (
            /* Error */
            <div className="rounded-xl border border-border py-16 text-center">
              <p className="font-medium text-primary-text">
                Something went wrong.
              </p>

              <p className="mt-2 text-sm text-secondary-text">
                Please try again later.
              </p>
            </div>
          ) : shops.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {shops.map((shop: any) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="rounded-lg border border-border px-4 py-2 text-sm text-primary-text transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-medium transition-colors ${
                        page === pageNumber
                          ? 'border-primary bg-primary text-white'
                          : 'border-border text-primary-text hover:border-primary hover:text-primary'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="rounded-lg border border-border px-4 py-2 text-sm text-primary-text transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="rounded-xl border border-border py-16 text-center">
              <h3 className="text-lg font-semibold text-primary-text">
                No shops found
              </h3>

              <p className="mt-2 text-sm text-secondary-text">
                Try changing your filters to find more shops.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShopsPage;
