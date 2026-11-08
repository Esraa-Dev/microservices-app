
import ProductDetails from '@/shared/modules/product/product-details';
import axiosInstance from '@/utils/axiosInstance';
import { Metadata } from 'next';

async function fetchProductDetails(slug: string) {
  const response = await axiosInstance.get(`products/get-product/${slug}`);
  return response.data?.product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductDetails(slug);

  return {
    title: product?.title
      ? `${product.title} | Ecommerce`
      : 'Product | Ecommerce',
    description: product?.description ?? 'Explore our products.',
  };
}

const ProductDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const productDetails = await fetchProductDetails(slug);

  return <ProductDetails productInfo={productDetails} />;
};

export default ProductDetailsPage;
