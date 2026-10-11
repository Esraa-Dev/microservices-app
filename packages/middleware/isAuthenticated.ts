import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "@ecommerce/prisma";
import { UserRole } from "@prisma/client";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken =
      req.cookies?.access_token ||
      req.cookies?.seller_access_token;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as {
      id: string;
      role: UserRole;
    };

    if (decoded.role === UserRole.seller) {
      const seller = await prisma.seller.findUnique({
        where: {
          id: decoded.id,
        },
        include: {
          shop: true,
        },
      });

      if (!seller) {
        return res.status(401).json({
          success: false,
          message: "Seller not found",
        });
      }

      req.role = UserRole.seller;
      req.seller = seller;

      return next();
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      include: {
        avatar: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.role = UserRole.user;
    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};