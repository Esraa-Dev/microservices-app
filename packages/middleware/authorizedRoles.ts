import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { AuthError } from "@ecommerce/error-handler";

export const isSeller = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.role !== UserRole.seller) {
    return next(
      new AuthError("Access denied. Seller only.")
    );
  }

  next();
};

export const isUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.role !== UserRole.user) {
    return next(
      new AuthError("Access denied. User only.")
    );
  }

  next();
};