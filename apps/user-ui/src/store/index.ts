
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Product = {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory?: string;
  images: {
    id: string;
    url: string;
  }[];
  sale_price: number;
  regular_price: number;
  stock: number;
  colors: string[];
  sizes: string[];
  shopId: string;
  quantity?: number;
};

type Store = {
  cart: Product[];
  wishlist: Product[];

  addToCart: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any,
    quantity?: number,
  ) => void;

  removeFromCart: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any,
  ) => void;

  deleteFromCart: (id: string) => void;

  addToWishlist: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any,
  ) => void;

  removeFromWishlist: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any,
  ) => void;
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],

      addToCart: (product, user, location, deviceInfo, quantity = 1) =>
        set((state) => {
          const existingProduct = state.cart.find(
            (item) => item.id === product.id,
          );

          if (existingProduct) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.stock,
                        (item.quantity ?? 1) + quantity,
                      ),
                    }
                  : item,
              ),
            };
          }

          return {
            cart: [
              ...state.cart,
              {
                ...product,
                quantity: Math.min(product.stock, quantity),
              },
            ],
          };
        }),

      removeFromCart: (id, user, location, deviceInfo) =>
        set((state) => {
          const existingProduct = state.cart.find(
            (item) => item.id === id,
          );

          if (!existingProduct) return state;

          if ((existingProduct.quantity ?? 1) > 1) {
            return {
              cart: state.cart.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      quantity: (item.quantity ?? 1) - 1,
                    }
                  : item,
              ),
            };
          }

          return {
            cart: state.cart.filter((item) => item.id !== id),
          };
        }),

      deleteFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      addToWishlist: (product, user, location, deviceInfo) =>
        set((state) => {
          const existingProduct = state.wishlist.find(
            (item) => item.id === product.id,
          );

          if (existingProduct) return state;

          return {
            wishlist: [...state.wishlist, product],
          };
        }),

      removeFromWishlist: (id, user, location, deviceInfo) =>
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id),
        })),
    }),
    {
      name: 'store-storage',
    },
  ),
);
