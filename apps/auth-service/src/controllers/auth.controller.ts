import { Request, Response } from "express";
import prisma from "@ecommerce/prisma";

export const register = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Email is required" });
  }

  return res.status(200).json({
    message: "User registered successfully",
  });
};