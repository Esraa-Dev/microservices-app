import prisma from '@ecommerce/prisma';

export const updateUserAnalytics = async (event: any) => {
  try {
    const existingData = await prisma.userAnalytics.findUnique({
      where: {
        userId: event.userId,
      },
    });

    let updatedActions: any[] = existingData?.actions ?? [];

    const actionExisted = updatedActions.some((entry: any) => {
      return (
        entry.productId === event.productId &&
        entry.action === event.action
      );
    });

    if (event.action === 'product_view') {
      updatedActions.push({
        productId: event.productId,
        timestamp: new Date(),
        shopId: event.shopId,
        action: 'product_view',
      });
    } else if (
      ['add_to_cart', 'add_to_wishlist'].includes(event.action) &&
      !actionExisted
    ) {
      updatedActions.push({
        productId: event.productId,
        timestamp: new Date(),
        shopId: event.shopId,
        action: event.action,
      });
    } else if (
      event.action === 'remove_from_cart' ||
      event.action === 'remove_from_wishlist'
    ) {
      const actionToRemove =
        event.action === 'remove_from_cart'
          ? 'add_to_cart'
          : 'add_to_wishlist';

      updatedActions = updatedActions.filter((entry: any) => {
        return !(
          entry.productId === event.productId &&
          entry.action === actionToRemove
        );
      });
    }

    const extraFields: Record<string, any> = {};

    if (event.country) extraFields.country = event.country;
    if (event.city) extraFields.city = event.city;
    if (event.device) extraFields.device = event.device;

    await prisma.userAnalytics.upsert({
      where: {
        userId: event.userId,
      },
      update: {
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
      create: {
        userId: event.userId,
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
    });

    await updateProductAnalytics(event);
  } catch (error) {
    console.error('Error updating user analytics:', error);
  }
};

export const updateProductAnalytics = async (event: any) => {
  try {
    const updateFields: Record<string, any> = {};

    switch (event.action) {
      case 'product_view':
        updateFields.views = { increment: 1 };
        break;

      case 'add_to_cart':
        updateFields.cartAdds = { increment: 1 };
        break;

      case 'remove_from_cart':
        updateFields.cartAdds = { decrement: 1 };
        break;

      case 'purchase':
        updateFields.purchases  = { increment: 1 };
        break;

      case 'add_to_wishlist':
        updateFields.wishlistAdds = { increment: 1 };
        break;

      case 'remove_from_wishlist':
        updateFields.wishlistAdds = { decrement: 1 };
        break;

      default:
        return;
    }

    await prisma.productAnalytics.upsert({
      where: {
        productId: event.productId,
      },
      update: {        lastViewedAt:new Date(),
...updateFields},
      create: {
        productId: event.productId,
                shopId: event.shopId||null,

        views: event.action === 'product_view' ? 1 : 0,
        cartAdds: event.action === 'add_to_cart' ? 1 : 0,
        purchases : event.action === 'purchase' ? 1 : 0,
        wishlistAdds: event.action === 'add_to_wishlist' ? 1 : 0,
        lastViewedAt:new Date()
      },
    });
  } catch (error) {
    console.error('Error updating product analytics:', error);
  }
};