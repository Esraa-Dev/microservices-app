
"use client";

import React from "react";
import ProductCard from "@/shared/components/cards/product-card";
import SectionTitle from "@/shared/components/section/SectionTitle";
import Hero from "@/shared/modules/hero";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import ShopCard from "@/shared/components/cards/shop.card";

const Page = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/products/get-all-products?page=1&limit=10"
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: latestProducts, isLoading: isLoadingLatest } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/products/get-all-products?page=1&limit=10&type=latest"
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: topShops, isLoading: isLoadingShops } = useQuery({
    queryKey: ["top-shops"],
    queryFn: async () => {
      const response = await axiosInstance.get("/products/top-shops");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/products/get-all-events?page=1&limit=10"
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const renderProductSkeleton = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="h-62.5 animate-pulse rounded-xl bg-gray-300"
        />
      ))}
    </div>
  );

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />

      {/* Suggested Products */}
      {(isLoading || (products?.products?.length ?? 0) > 0) && (
        <section className="page-container my-10">
          <div className="mb-8">
            <SectionTitle title="Suggested Products" />
          </div>

          {isLoading ? (
            renderProductSkeleton()
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5">
              {products?.products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Top Offers */}
      {(isLoadingEvents || (events?.products?.length ?? 0) > 0) && (
        <section className="page-container my-10">
          <div className="mb-8">
            <SectionTitle title="Top Offers" />
          </div>

          {isLoadingEvents ? (
            renderProductSkeleton()
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5">
              {events?.products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Latest Products */}
      {(isLoadingLatest || (latestProducts?.products?.length ?? 0) > 0) && (
        <section className="page-container my-10">
          <div className="mb-8">
            <SectionTitle title="Latest Products" />
          </div>

          {isLoadingLatest ? (
            renderProductSkeleton()
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5">
              {latestProducts?.products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Top Shops */}
      {(isLoadingShops || (topShops?.shops?.length ?? 0) > 0) && (
        <section className="page-container my-10">
          <div className="mb-8">
            <SectionTitle title="Top Shops" />
          </div>

          {isLoadingShops ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-48 animate-pulse rounded-xl bg-gray-300"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {topShops?.shops?.map((shop: any) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Page;
