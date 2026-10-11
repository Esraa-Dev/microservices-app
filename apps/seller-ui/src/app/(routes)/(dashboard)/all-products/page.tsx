
"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import {
  stockFeatures,
  useTable,
  type ColumnDef,
  type StockFeatures,
} from "@tanstack/react-table";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Search, Trash2, RefreshCw } from "lucide-react";
import DeleteConfirmationModal from "@/shared/components/modals/delete.confirmation.modal";

interface ProductItem {
  id: string;
  image: string;
  title: string;
  slug: string;
  sale_price: number;
  stock: number;
  category: string;
  ratings?: number;
}

const EMPTY_PRODUCTS: ProductItem[] = [];

async function fetchProducts(): Promise<ProductItem[]> {
  const response = await fetch("/product/api/get-shop-products", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products.");
  }

  const result: unknown = await response.json();

  if (Array.isArray(result)) {
    return result as ProductItem[];
  }

  if (result && typeof result === "object") {
    const payload = result as Record<string, unknown>;

    if (Array.isArray(payload.products)) {
      return payload.products as ProductItem[];
    }

    if (Array.isArray(payload.data)) {
      return payload.data as ProductItem[];
    }

    if (
      payload.data &&
      typeof payload.data === "object" &&
      Array.isArray(
        (payload.data as Record<string, unknown>).products,
      )
    ) {
      return (payload.data as Record<string, unknown>)
        .products as ProductItem[];
    }
  }

  return EMPTY_PRODUCTS;
}

export default function ProductList() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<ProductItem | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    data: products = EMPTY_PRODUCTS,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<ProductItem[]>({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(
        `/product/api/delete-product/${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete product.");
      }

      return response.json().catch(() => null);
    },

    onSuccess: async () => {
      setSelectedProduct(null);
      setErrorMessage("");
      await queryClient.invalidateQueries({
        queryKey: ["shop-products"],
      });
    },

    onError: (error: Error) => {
      setErrorMessage(error.message || "Failed to delete product.");
    },
  });

  const handleDeleteClick = useCallback((product: ProductItem) => {
    setErrorMessage("");
    setSelectedProduct(product);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedProduct) return;
    deleteMutation.mutate(selectedProduct.id);
  }, [selectedProduct, deleteMutation]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return products;

    return products.filter((product) =>
      [
        product.title,
        product.slug,
        product.category,
        String(product.sale_price ?? ""),
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [products, searchTerm]);

  const columns = useMemo<
    ColumnDef<StockFeatures, ProductItem>[]
  >(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
          const product = row.original;

          return (
            <div className="relative h-14 w-14 overflow-hidden rounded-md bg-gray-100">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-500">
                  No image
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Product",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white">
              {row.original.title}
            </p>
            <p className="max-w-48 truncate text-xs text-gray-500">
              {row.original.slug}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "sale_price",
        header: "Price",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {Number(row.original.sale_price ?? 0).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => {
          const stock = Number(row.original.stock ?? 0);

          return (
            <span
              className={
                stock > 0
                  ? "text-green-600"
                  : "text-red-500"
              }
            >
              {stock}
            </span>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span>{row.original.category || "—"}</span>
        ),
      },
      {
        accessorKey: "ratings",
        header: "Rating",
        cell: ({ row }) => (
          <span>{row.original.ratings ?? "—"}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => handleDeleteClick(row.original)}
            disabled={deleteMutation.isPending}
            aria-label={`Delete ${row.original.title}`}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        ),
      },
    ],
    [handleDeleteClick, deleteMutation.isPending],
  );

  const table = useTable({
    features: stockFeatures,
    columns,
    data: filteredProducts,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center gap-2 text-gray-500">
        <RefreshCw size={18} className="animate-spin" />
        <span>Loading products...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 p-5 text-red-600">
        <p>
          {error instanceof Error
            ? error.message
            : "Failed to load products."}
        </p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="w-full space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Products
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {filteredProducts.length} product
            {filteredProducts.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label="Refresh products"
            className="rounded-lg border border-gray-300 p-2.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RefreshCw
              size={18}
              className={isFetching ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full min-w-190 border-collapse text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-200 dark:border-gray-800"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-4 py-4 font-semibold text-gray-700 dark:text-gray-200"
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-4 text-gray-700 dark:text-gray-300"
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}

            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {searchTerm
                    ? "No products match your search."
                    : "No products found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedProduct && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => {
            if (!deleteMutation.isPending) {
              setSelectedProduct(null);
            }
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </section>
  );
}
