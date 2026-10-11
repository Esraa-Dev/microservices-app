"use client";
import ProductCard from '@/shared/components/cards/product-card';
import SectionTitle from '@/shared/components/section/SectionTitle';
import Hero from '@/shared/modules/hero';
import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

const page = () => {
  const fetchProducts = async () => {
    const response = await axiosInstance.get('/products/get-all-products?page=1&limit=10');
    return response.data;
  }
  const  {data: products,isLoading} = useQuery({
    queryKey:["products"],
    queryFn:fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
});

 const fetchLatestProducts = async () => {
    const response = await axiosInstance.get('/products/get-all-products?page=1&limit=10&type=latest');
    return response.data;
  }
  const  {data: latestProducts} = useQuery({
    queryKey:["latest-products"],
    queryFn:fetchLatestProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
});
  console.log(products)
  console.log(latestProducts)

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />
      <div className="page-container my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>
        {isLoading&&(
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
           {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="bg-gray-300 h-62.5 rounded-xl animated-pulse"></div>
           ))}
            </div>)
        }
        {!isLoading&&(
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {products?.products?.map((product:any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
                </div>
    </div>
  );
};

export default page;
