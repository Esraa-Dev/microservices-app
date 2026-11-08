'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '@/shared/components/cards/product-card';
import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Range, getTrackBackground } from 'react-range';

const MIN = 0;
const MAX = 1199;
const LIMIT = 12;

const COLORS = [
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Red', code: '#DC2626' },
  { name: 'Green', code: '#16A34A' },
  { name: 'Blue', code: '#2563EB' },
  { name: 'Yellow', code: '#EAB308' },
  { name: 'Orange', code: '#E37937' },
  { name: 'Purple', code: '#9333EA' },
  { name: 'Pink', code: '#EC4899' },
  { name: 'Gray', code: '#6B7280' },
  { name: 'Brown', code: '#92400E' },
  { name: 'Navy', code: '#1E3A8A' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const ProductsPage = () => {
  const router = useRouter();

  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([MIN, MAX]);
  const [tempPriceRange, setTempPriceRange] = useState([MIN, MAX]);
  const [page, setPage] = useState(1);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosInstance.get('/products/get-categories');
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.categories ?? []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
    setPage(1);
  };

  const toggleColor = (color: string) => {
    setSelectedColor((prev) =>
      prev.includes(color)
        ? prev.filter((item) => item !== color)
        : [...prev, color],
    );
    setPage(1);
  };

  const toggleSize = (size: string) => {
    setSelectedSize((prev) =>
      prev.includes(size)
        ? prev.filter((item) => item !== size)
        : [...prev, size],
    );
    setPage(1);
  };

  const {
    data: productsData,
    isLoading: productsLoading,
    isError,
  } = useQuery({
    queryKey: [
      'filtered-products',
      page,
      selectedColor,
      selectedSize,
      selectedCategories,
      priceRange,
    ],
    queryFn: async () => {
      const query = new URLSearchParams();

      query.set('page', page.toString());
      query.set('limit', LIMIT.toString());

      if (selectedColor.length > 0) {
        query.set('color', selectedColor.join(','));
      }

      if (selectedSize.length > 0) {
        query.set('size', selectedSize.join(','));
      }

      if (selectedCategories.length > 0) {
        query.set('categories', selectedCategories.join(','));
      }

      query.set('priceRange', priceRange.join(','));

      const res = await axiosInstance.get(
        `/products/get-filtered-products?${query.toString()}`,
      );

      return res.data;
    },
    staleTime: 1000 * 60,
  });

  const products = productsData?.products ?? [];
  const totalPages = productsData?.totalPages ?? 1;

  useEffect(() => {
    const params = new URLSearchParams();

    params.set('priceRange', priceRange.join(','));

    if (selectedColor.length > 0) {
      params.set('color', selectedColor.join(','));
    }

    if (selectedSize.length > 0) {
      params.set('size', selectedSize.join(','));
    }

    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    }

    if (page > 1) {
      params.set('page', page.toString());
    }

    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [
    priceRange,
    selectedColor,
    selectedSize,
    selectedCategories,
    page,
    router,
  ]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedColor([]);
    setSelectedSize([]);
    setPriceRange([MIN, MAX]);
    setTempPriceRange([MIN, MAX]);
    setPage(1);
  };

  return (
    <section className="page-container py-8 sm:py-10">
      <div className="mb-8 flex flex-col gap-3 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-secondary-text transition-colors hover:text-primary"
          >
            Home
          </Link>

          <span className="text-muted-text">/</span>

          <span className="font-medium text-primary-text">All Products</span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary-text sm:text-3xl">
            All Products
          </h1>

          <p className="mt-2 text-sm text-secondary-text sm:text-base">
            Explore our collection and find the perfect products for you.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="h-fit w-full rounded-xl border border-border bg-background p-5 lg:w-1/4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-text">Filters</h2>

            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-primary transition-colors hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="border-b border-border pb-6">
            <h3 className="mb-5 font-semibold text-primary-text">
              Price Range
            </h3>

            <Range
              step={1}
              min={MIN}
              max={MAX}
              values={tempPriceRange}
              onChange={(values) => setTempPriceRange([...values])}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  className="h-2 w-full rounded-full"
                  style={{
                    ...props.style,
                    background: getTrackBackground({
                      values: tempPriceRange,
                      colors: ['#e5e5e5', '#e37937', '#e5e5e5'],
                      min: MIN,
                      max: MAX,
                    }),
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => (
                <div
                  {...props}
                  className="h-5 w-5 rounded-full border-2 border-white bg-primary shadow-md outline-none ring-1 ring-primary"
                  style={props.style}
                />
              )}
            />

           <div className="mt-5 flex items-center justify-between text-sm">
  <span className="rounded-md border border-border px-3 py-2 font-medium text-primary-text">
    ${tempPriceRange[0]}
  </span>

  <span className="text-secondary-text">To</span>

  <span className="rounded-md border border-border px-3 py-2 font-medium text-primary-text">
    ${tempPriceRange[1]}
  </span>
</div>

<button
  type="button"
  onClick={() => {
    setPriceRange([...tempPriceRange]);
    setPage(1);
  }}
  disabled={
    priceRange[0] === tempPriceRange[0] &&
    priceRange[1] === tempPriceRange[1]
  }
  className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
>
  Apply Price
</button>
          </div>

          <div className="border-b border-border py-6">
            <h3 className="mb-4 font-semibold text-primary-text">Categories</h3>

            {categoriesLoading ? (
              <p className="text-sm text-secondary-text">
                Loading categories...
              </p>
            ) : categories.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {categories.map((category: any) => (
                  <li key={category}>
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-secondary-text transition-colors hover:text-primary-text">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="h-4 w-4 cursor-pointer accent-primary"
                      />

                      <span>{category}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-secondary-text">
                No categories available.
              </p>
            )}
          </div>

          <div className="border-b border-border py-6">
            <h3 className="mb-4 font-semibold text-primary-text">Colors</h3>

            <div className="flex flex-col gap-3">
              {COLORS.map((color) => {
                const isSelected = selectedColor.includes(color.code);

                return (
                  <label
                    key={color.code}
                    className="flex cursor-pointer items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-6 w-6 rounded-full border border-border shadow-sm"
                        style={{ backgroundColor: color.code }}
                      />

                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-primary-text">
                          {color.name}
                        </span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleColor(color.code)}
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="py-6">
            <h3 className="mb-4 font-semibold text-primary-text">Sizes</h3>

            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const isSelected = selectedSize.includes(size);

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`min-w-11 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-background text-primary-text hover:border-primary hover:text-primary'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-primary-text">
                Products
              </h2>

              <p className="mt-1 text-sm text-secondary-text">
                {products.length} products found
              </p>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="h-80 animate-pulse rounded-xl bg-surface animate-plus"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-border py-16 text-center">
              <p className="font-medium text-primary-text">
                Something went wrong.
              </p>

              <p className="mt-2 text-sm text-secondary-text">
                Please try again later.
              </p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

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
            <div className="rounded-xl border border-border py-16 text-center">
              <h3 className="text-lg font-semibold text-primary-text">
                No products found
              </h3>

              <p className="mt-2 text-sm text-secondary-text">
                Try changing your filters to find more products.
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

export default ProductsPage;
