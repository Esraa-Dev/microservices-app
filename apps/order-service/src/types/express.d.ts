import { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      role?: UserRole;

      user?: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        avatar: {
          id: string;
          url: string;
          fileId: string;
        } | null;
      };

      seller?: {
        id: string;
        name: string;
        email: string;
        phone_number: string;
        country: string;
        stripeId: string | null;
        shop: {
          id: string;
          name: string;
          bio: string | null;
          category: string;
          coverBanner: string | null;
          address: string | null;
          opening_hours: string | null;
          website: string | null;
          rating: number | null;
          sellerId: string;
        } | null;
      };
    }
  }
}

export {};