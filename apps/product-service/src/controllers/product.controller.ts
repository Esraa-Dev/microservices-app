import prisma from '@ecommerce/prisma';
import { NextFunction, Request, Response } from 'express';
import { ValidationError, NotFoundError } from '@ecommerce/error-handler';
import { imagekit } from '../config/imagekit';


export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();
if (!config) {
  return next(new NotFoundError('Site configuration not found'));
}
    return res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      categories: config?.categories,
      subCategories:config?.subCategories
    });
  } catch (error) {
    
    console.error('Error fetching categories:', error);
       return next(error)
  }
};

// Create discount codes
export const createDiscountCodes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    if (
      !public_name ||
      !discountType ||
      discountValue === undefined ||
      !discountCode
    ) {
      return next(new ValidationError('Missing required fields!'));
    }

    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: { discountCode },
    });

    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          'Discount code already available please use a different code!',
        ),
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: Number(discountValue),
        discountCode,
        sellerId,
      },
    });

    return res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    return next(error);
  }
};

// Get discount codes
export const getDiscountCodes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const discountCodes = await prisma.discount_codes.findMany({
      where: {
        sellerId,
      },
    });

    return res.status(200).json({
      success: true,
      discountCodes,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete discount code
export const deleteDiscountCode = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    const sellerId = req.seller?.id;

    if (!id) {
      return next(new ValidationError('Discount code id is required'));
    }

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!discountCode) {
      return next(new NotFoundError('Discount code not found!'));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError('Unauthorized access!'));
    }

    await prisma.discount_codes.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Discount code successfully deleted',
    });
  } catch (error) {
    return next(error);
  }
};

// Upload product image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return next(new ValidationError('Image file is required'));
    }

    const response = await imagekit.files.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: '/products',
    });

    return res.status(201).json({
      success: true,
      file_url: response.url,
      fileId: response.fileId,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete product image
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return next(new ValidationError('fileId is required'));
    }

    await imagekit.files.delete(fileId);

    return res.status(200).json({
      success: true,
      message: 'Product image successfully deleted',
    });
  } catch (error) {
    return next(error);
  }     
};

// Create Product
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title,
      description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors ,
      sizes,
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties,
      images,
    } = req.body;

    if (
      !title ||
      !slug ||
      !description ||
      !category ||
      !subCategory ||
      sale_price === undefined ||
      regular_price === undefined ||
      stock === undefined ||
      !tags ||
      !Array.isArray(images)
    ) {
      return next(new ValidationError('Missing required fields!'));
    }

    const normalizedTags = Array.isArray(tags)
      ? tags
      : String(tags)
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);


    const normalizedImages = images.map((img) => ({
        file_id: img.fileId,
        url: img.file_url,
      }));

    const shopId = req.seller?.shop?.id;

    if (!shopId) {
      return next(new NotFoundError('Seller shop not found'));
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description: description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId,
        tags: normalizedTags,
        brand,
        video_url,
        category,
        subCategory,
        colors: Array.isArray(colors) ? colors : [],
        sizes: Array.isArray(sizes) ? sizes : [],
        discount_codes: discountCodes,
        stock: Number(stock),
        sale_price: Number(sale_price),
        regular_price: Number(regular_price),
        custom_properties: customProperties || {},
        custom_specifications: custom_specifications || {},
        images: {
          create: normalizedImages,
        },
      },

      include: {
        images: true,
      },
    });

    return res.status(201).json({
      success: true,
      newProduct,
    });
  } catch (error) {
    return next(error);
  }
};

// Get Shop Products
export const getShopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shopId = req.seller?.shop?.id;

    if (!shopId) {
      return next(new NotFoundError('Seller shop not found'));
    }

    const products = await prisma.products.findMany({
      where: {
        shopId,
        isDeleted: false,
      },
      include: {
        images: true,
      },
    });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete Product
export const deleteProduct = async (
  req: Request<{ productId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = req.params.productId;
    const shopId = req.seller?.shop?.id;

    if (!productId) {
      return next(new ValidationError('Product id is required'));
    }

    if (!shopId) {
      return next(new NotFoundError('Seller shop not found'));
    }

    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        shopId: true,
        isDeleted: true,
      },
    });

    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    if (product.shopId !== shopId) {
      return next(new ValidationError('Unauthorized action'));
    }

    if (product.isDeleted) {
      return next(new ValidationError('Product is already deleted'));
    }

    const deletedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      success: true,
      message:
        'Product is scheduled for deletion in 24 hours. You can restore it within this time.',
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

// Restore Product
export const restoreProduct = async (
  req: Request<{ productId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = req.params.productId;
    const shopId = req.seller?.shop?.id;

    if (!productId) {
      return next(new ValidationError('Product id is required'));
    }

    if (!shopId) {
      return next(new NotFoundError('Seller shop not found'));
    }

    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        shopId: true,
        isDeleted: true,
      },
    });

    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    if (product.shopId !== shopId) {
      return next(new ValidationError('Unauthorized action'));
    }

    if (!product.isDeleted) {
      return next(new ValidationError('Product is not in deleted state'));
    }

    await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Product successfully restored!',
    });
  } catch (error) {
    return next(error);
  }
};
