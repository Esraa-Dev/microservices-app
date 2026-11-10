import prisma from '@ecommerce/prisma';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '@ecommerce/error-handler';
import redis from '@ecommerce/redis';
import { randomUUID } from 'crypto';
import Stripe from 'stripe';
import { sendEmail } from '../utils/sendMail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-08-26.dahlia',
});

export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { amount, sellerStripeAccountId, sessionId } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('User not authenticated');
    }
    const customerAmount = Math.floor(amount * 100);
    const platformFee = Math.floor(customerAmount * 0.1);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: 'usd',
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: { sessionId, userId },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return next(error);
  }
};

export const createPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cart, shippingAddressId, coupon } = req.body;
    const userId = req.user?.id;

    // 1. Validate user
    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    // 2. Validate cart
    if (!Array.isArray(cart) || cart.length === 0) {
      throw new ValidationError('Cart is empty or invalid');
    }

    // 3. Normalize cart
    const normalizedCart = cart
      .map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        sale_price: item.sale_price,
        shopId: item.shopId,
        selectedOptions: item.selectedOptions || {},
      }))
      .sort((a, b) => a.id.localeCompare(b.id));

    const normalizeCart = JSON.stringify(normalizedCart);

    // 4. Get unique shop IDs
    const uniqueShopIds: string[] = [
      ...new Set<string>(normalizedCart.map((item) => item.shopId)),
    ];

    // 5. Search for an existing payment session
    const keys = await redis.keys('payment:session:*');

    for (const key of keys) {
      const data = await redis.get(key);

      if (!data) continue;

      const session = JSON.parse(data);

      if (
        session.userId === userId &&
        session.cartData === normalizeCart &&
        session.shippingAddressId === shippingAddressId &&
        session.coupon === coupon
      ) {
        return res.status(200).json({
          sessionId: key.split(':')[2],
        });
      }
    }

    // 6. Get shops and seller Stripe accounts
    const shops = await prisma.shop.findMany({
      where: {
        id: {
          in: uniqueShopIds,
        },
      },
      select: {
        id: true,
        sellerId: true,
        seller: {
          select: {
            stripeId: true,
          },
        },
      },
    });

    // 7. Validate shops
    if (shops.length !== uniqueShopIds.length) {
      throw new ValidationError('One or more shops do not exist');
    }

    // 8. Prepare seller data
    const sellerData = shops.map((shop) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeId: shop.seller.stripeId,
    }));

    // 9. Calculate total amount
    const totalAmount = normalizedCart.reduce(
      (total, item) => total + item.sale_price * item.quantity,
      0,
    );

    // 10. Generate session ID
    const sessionId = randomUUID();

    // 11. Prepare session data
    const sessionData = {
      userId,
      cart,
      cartData: normalizeCart,
      totalAmount,
      shippingAddressId,
      coupon,
      sellerData,
      createdAt: new Date().toISOString(),
    };

    // 12. Save session in Redis for 10 minutes
    await redis.setex(
      `payment:session:${sessionId}`,
      600,
      JSON.stringify(sessionData),
    );

    // 13. Return session ID
    return res.status(200).json({
      sessionId,
    });
  } catch (error) {
    return next(error);
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature || Array.isArray(signature)) {
      return res.status(400).json({
        message: 'Missing Stripe signature',
      });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (error) {
      return res.status(400).json({
        message: 'Invalid Stripe signature',
      });
    }

    if (event.type !== 'payment_intent.succeeded') {
      return res.status(200).json({
        received: true,
      });
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const sessionId = paymentIntent.metadata.sessionId;
    const userId = paymentIntent.metadata.userId;

    if (!sessionId || !userId) {
      return res.status(400).json({
        message: 'Missing payment metadata',
      });
    }

    const sessionKey = `payment:session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({
        message: 'Payment session expired or missing',
      });
    }

    const session = JSON.parse(sessionData);

    const { cart, totalAmount, shippingAddressId, coupon } = session;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const shopGroups = cart.reduce(
      (groups: Record<string, any[]>, item: any) => {
        if (!groups[item.shopId]) {
          groups[item.shopId] = [];
        }

        groups[item.shopId].push(item);

        return groups;
      },
      {},
    );

    let finalDiscountAmount = 0;
    let appliedCouponCode = null;

    if (coupon) {
      const discountRecord = await prisma.discount_codes.findUnique({
        where: { discountCode: coupon },
      });

      if (discountRecord) {
        appliedCouponCode = discountRecord.discountCode;
        const rawTotal = cart.reduce(
          (sum: number, item: any) => sum + item.quantity * item.sale_price,
          0,
        );
        if (discountRecord.discountType === 'percentage') {
          finalDiscountAmount = (rawTotal * discountRecord.discountValue) / 100;
        } else {
          finalDiscountAmount = discountRecord.discountValue;
        }
      }
    }

    for (const shopId in shopGroups) {
      const orderItems = shopGroups[shopId];
      let orderTotal = orderItems.reduce(
        (sum: number, product: any) =>
          sum + product.quantity * product.sale_price,
        0,
      );

      let shopDiscount = 0;
      if (finalDiscountAmount > 0) {
        shopDiscount = finalDiscountAmount / Object.keys(shopGroups).length;
        orderTotal = Math.max(0, orderTotal - shopDiscount);
      }

      await prisma.orders.create({
        data: {
          userId,
          shopId,
          total: orderTotal,
          shippingAddressId,
          couponCode: appliedCouponCode,
          discountAmount: shopDiscount > 0 ? shopDiscount : null,
          status: 'Paid',
          deliveryStatus: 'Ordered',
          items: {
            create: orderItems.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.sale_price,
              selectedOptions: item.selectedOptions || {},
            })),
          },
        },
      });

      for (const item of orderItems) {
        await prisma.products.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
            total_sales: {
              increment: item.quantity,
            },
          },
        });

        await prisma.productAnalytics.upsert({
          where: { productId: item.id },
          create: {
            productId: item.id,
            shopId: shopId,
            purchases: item.quantity,
            lastViewedAt: new Date(),
          },
          update: {
            purchases: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    const existingAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId },
    });

    const newActions = cart.map((item: any) => ({
      productId: item.id,
      shopId: item.shopId,
      action: 'purchase',
      timestamp: new Date().toISOString(),
      quantity: item.quantity,
    }));

    if (existingAnalytics) {
      const currentActions = Array.isArray(existingAnalytics.actions)
        ? (existingAnalytics.actions as any[])
        : [];

      const updatedActions = [...currentActions, ...newActions];

      await prisma.userAnalytics.update({
        where: { userId },
        data: {
          lastVisited: new Date(),
          actions: updatedActions,
        },
      });
    } else {
      await prisma.userAnalytics.create({
        data: {
          userId,
          lastVisited: new Date(),
          actions: newActions,
        },
      });
    }

    // Send order confirmation email
    const trackingUrl = `${process.env.CLIENT_URL}/orders/tracking`;
    const finalCalculatedTotal = Math.max(
      0,
      totalAmount - (finalDiscountAmount || 0),
    );

    await sendEmail(
      user.email,
      'Your shop order confirmation',
      'order-confirmation',
      {
        name: user.name,
        cart,
        totalAmount: finalCalculatedTotal,
        trackingUrl,
      },
    );

    // Create notifications for sellers and admin
    const createdShopIds = Object.keys(shopGroups);
    const sellerShops = await prisma.shop.findMany({
      where: { id: { in: createdShopIds } },
      select: {
        id: true,
        sellerId: true,
        name: true,
      },
    });

    // Send notification to each seller involved in the order
    for (const shop of sellerShops) {
      await prisma.notification.create({
        data: {
          title: 'A new order received',
          message: `You have received a new order for your shop: ${shop.name}`,
          creatorId: userId,
          receiverId: shop.sellerId,
          redirect_Link: `${process.env.FRONTEND_URL}/seller/orders`,
        },
      });
    }

    // Send notification to admin
    await prisma.notification.create({
      data: {
        title: 'A new order received',
        message: `A new order has been successfully placed by user ${user.name}`,
        creatorId: userId,
        receiverId: 'admin',
        redirect_Link: `${process.env.FRONTEND_URL}/admin/orders`,
      },
    });

    await redis.del(sessionKey);
    return res.status(200).json({ received: true });
  } catch (error) {
    return next(error);
  }
};

export const verifyPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    if (!sessionId) {
      throw new ValidationError('Session ID is required');
    }

    const sessionKey = `payment:session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        message: 'Payment session expired or invalid',
      });
    }

    const session = JSON.parse(sessionData);

    if (session.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to payment session',
      });
    }

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};
export const getSellerOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      throw new ValidationError('Seller Not Found');
    }

    const sellerShop = await prisma.shop.findUnique({
      where: {
        sellerId,
      },
    });

    if (!sellerShop) {
      throw new ValidationError('Shop not found for this seller');
    }

    const orders = await prisma.orders.findMany({
      where: {
        shopId: sellerShop.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return next(error);
  }
};


export const getOrderDetails=async(req:Request,res:Response,next:NextFunction)=>{
try{
const orderId=(req.params.id) as string
const order=await prisma.orders.findUnique({
  where:{
    id:orderId
  },
  include:{
    items:true
  }
})
if(!order){
return next(new ValidationError("Order not found with the id"))
}
const shippingAddress=order.shippingAddressId?await prisma.address.findUnique(
  {
    where:{
      id:order.shippingAddressId
    }
  }
):null
const coupon=order.couponCode?await prisma.discount_codes.findUnique(
  {
    where:{
      discountCode:order.couponCode
    }
  }
):null
const productIds=order.items.map(item=>item.productId);
//get all products using product id from order that you get using order id
const products=await prisma.products.findMany({
  where:{
    id:{in:productIds}
  }
  ,select:{
    id:true,
    title:true,
    images:true
  }
}) 
const productMap=new Map(products.map(product=>[product.id,product]));
const items=order.items.map(item=>({
  ...item,
  selectedOptions:item.selectedOptions,
  product:productMap.get(item.productId)
}))
  return res.status(200).json({
      success: true,
      order:{
        ...order,
        items,
        shippingAddress,
        couponCode:coupon
      },
    });
}
catch (error) {
    return next(error);
  }
};