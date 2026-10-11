import prisma from "@ecommerce/prisma";
import cron from "node-cron";

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();

    const twentyFourHoursAgo = new Date(
      now.getTime() - 24 * 60 * 60 * 1000
    );

    await prisma.products.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: twentyFourHoursAgo,
        },
      },
    });
  } catch (error) {
    console.error("Cron job error:", error);
  }
});