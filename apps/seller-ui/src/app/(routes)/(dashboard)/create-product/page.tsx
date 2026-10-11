"use client";

import React, { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronRight, Wand, X, Loader2 } from "lucide-react";
import Image from "next/image";

import ColorSelector from "@ecommerce/components/color-selector";
import CustomSpecifications from "@ecommerce/components/custom-specifications";
import CustomProperties from "@ecommerce/components/custom-properties";
import SizeSelector from "@ecommerce/components/size-selector";
import RichTextEditor from "@ecommerce/components/rich-text-editor";
import Input from "@ecommerce/components/input";

import axiosInstance from "@/utils/axiosInstance";
import ImagePlaceholder from "@/shared/components/image-placeholder";
import { enhancements } from "@/utils/AI.enhancements";

interface UploadedImage {
  fileId: string;
  file_url: string;
}
interface FormValues {
  title: string;
  description: string;
  tags: string;
  warranty: string;
  slug: string;
  brand: string;
  colors: string[];
  category: string;
  subcategory: string;
  detailed_description: string;
  video_url: string;
  regular_price: number;
  sale_price: number;
  stock: number;
  cash_on_delivery: string;
  sizes: string[];
  discount_codes: string;
  images: (UploadedImage | null)[];
  custom_properties: Record<string, unknown>;
  custom_specifications: Record<string, unknown>;
}

const Page = () => {

const { register, control, watch, setValue, handleSubmit, formState: { errors } } =
  useForm<FormValues>();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [activeEffect, setActiveEffect] = useState("");
  const [pictureUploadingLoader, setpictureUploadingLoader] = useState(false);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/get-categories");
        console.log("Fetched categories:", res);
        return res.data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};





  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  

  const onSubmit = async (formData: any) => {
    try {
      setLoading(true);
      await axiosInstance.post("/product/api/create-product", formData);
      toast.success("Product created successfully!");
      router.push("/dashboard/all-products");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setpictureUploadingLoader(true);

    try {
      const fileName = await convertFileToBase64(file);
      const response = await axiosInstance.post(
        "/product/api/upload-product-image",
        { fileName }
      );

      const uploadedImage: UploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      };

      const updatedImages = [...images];
      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload image");
    } finally {
      setpictureUploadingLoader(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];

      if (imageToDelete && typeof imageToDelete === "object") {
        await axiosInstance.delete("/product/api/delete-product-image", {
          data: { fileId: imageToDelete.fileId },
        });
      }

      updatedImages.splice(index, 1);

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete image");
    }
  };

  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;
    setProcessing(true);
    setActiveEffect(transformation);

    try {
      const transformedUrl = `${selectedImage}?tr=${transformation}`;
      setSelectedImage(transformedUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveDraft = () => {
    toast.success("Draft Saved");
  };

  return (
    <form
      className="max-w-7xl mx-auto space-y-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 sm:p-6 lg:p-8">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
            Create Product
          </h2>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs sm:text-sm font-medium">
            <span className="hover:text-slate-700 transition-colors cursor-pointer">
              Dashboard
            </span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-[#e37937] font-semibold">Create Product</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-200/60">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-600 mb-3">
                Product Gallery
              </h3>
              {images?.length > 0 && (
                <ImagePlaceholder
                  setOpenImageModal={setOpenImageModal}
                  size="765 x 850"
                  small={false}
                  index={0}
                  onImageChange={handleImageChange}
                  onRemove={handleRemoveImage}
                  setSelectedImage={setSelectedImage}
                  pictureUploadingLoader={pictureUploadingLoader}
                />
              )}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3">
                {images.slice(1).map((_, index) => (
                  <ImagePlaceholder
                    key={index}
                    setOpenImageModal={setOpenImageModal}
                    size="765 x 850"
                    small
                    setSelectedImage={setSelectedImage}
                    index={index + 1}
                    onImageChange={handleImageChange}
                    onRemove={handleRemoveImage}
                    pictureUploadingLoader={pictureUploadingLoader}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            <div className="space-y-4">
              <div>
                <Input
                  label="Product Title *"
                  placeholder="Enter product title"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.title.message as string}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="textarea"
                  rows={4}
                  label="Short Description * (Max 150 words)"
                  placeholder="Enter product description for quick view"
                  {...register("description", {
                    required: "Description is required",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.description.message as string}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Tags *"
                  placeholder="apple, flagship"
                  {...register("tags", {
                    required: "Separate related tags with a comma",
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Warranty *"
                  placeholder="1 Year / No Warranty"
                  {...register("warranty", {
                    required: "Warranty details are required",
                  })}
                />
                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Slug *"
                  placeholder="product_slug"
                  {...register("slug", {
                    required: "Slug is required!",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Invalid slug format! Use lowercase letters, numbers, and hyphens.",
                    },
                    minLength: {
                      value: 3,
                      message: "Slug must be at least 3 characters long.",
                    },
                    maxLength: {
                      value: 50,
                      message: "Slug cannot be longer than 50 characters.",
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Brand"
                  placeholder="Apple"
                  {...register("brand")}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>

              <ColorSelector control={control} errors={errors} />
              <CustomSpecifications control={control} errors={errors} />
              <CustomProperties control={control} errors={errors} />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Cash On Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on delivery setting is required",
                  })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg focus:outline-none focus:border-[#e37937] focus:ring-1 focus:ring-[#e37937]/20 transition-all text-sm"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Category *
                </label>
                {isLoading ? (
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg text-slate-500 text-sm border border-slate-200">
                    <Loader2 size={16} className="animate-spin text-[#e37937]" />
                    Loading categories...
                  </div>
                ) : isError ? (
                  <p className="text-red-500 text-sm font-medium">
                    Failed to load categories
                  </p>
                ) : (
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: "Category is required" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg focus:outline-none focus:border-[#e37937] focus:ring-1 focus:ring-[#e37937]/20 transition-all text-sm"
                      >
                        <option value="">Select Category</option>
                        {categories?.map((category: string) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.category.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Subcategory *
                </label>
                <Controller
                  name="subcategory"
                  control={control}
                  rules={{ required: "Subcategory is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg focus:outline-none focus:border-[#e37937] focus:ring-1 focus:ring-[#e37937]/20 disabled:bg-slate-100 disabled:opacity-60 transition-all text-sm"
                      disabled={!selectedCategory}
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories?.map((sub: string) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subcategory && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.subcategory.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Detailed Description * (Min 100 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed description is required!",
                    validate: (value) => {
                      const wordCount =
                        value
                          ?.split(/\s+/)
                          .filter((word: string) => word).length || 0;
                      return (
                        wordCount >= 100 ||
                        "Description must be at least 100 words!"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Video URL"
                  placeholder="https://www.youtube.com/embed/xyz123"
                  {...register("video_url", {
                    pattern: {
                      value:
                        /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                      message:
                        "Invalid YouTube embed URL! Format: https://www.youtube.com/embed/...",
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Regular Price ($)"
                    placeholder="20"
                    {...register("regular_price", {
                      valueAsNumber: true,
                      min: { value: 1, message: "Price must be at least 1" },
                      validate: (value) =>
                        !isNaN(value) || "Only numbers are allowed",
                    })}
                  />
                  {errors.regular_price && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.regular_price.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    label="Sale Price ($)"
                    placeholder="15"
                    {...register("sale_price", {
                      valueAsNumber: true,
                      min: { value: 1, message: "Price must be at least 1" },
                      validate: (value) => {
                        if (isNaN(value)) return "Only numbers are allowed";
                        if (regularPrice && value >= regularPrice) {
                          return "Sale price must be less than Regular price";
                        }
                        return true;
                      },
                    })}
                  />
                  {errors.sale_price && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.sale_price.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register("stock", {
                    required: "Stock is required!",
                    valueAsNumber: true,
                    min: { value: 1, message: "Stock must be at least 1" },
                    max: {
                      value: 1000,
                      message: "Stock cannot exceed 1,000",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed!";
                      if (!Number.isInteger(value))
                        return "Stock must be a whole number!";
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <SizeSelector control={control} errors={errors} />

              <div>
                <Input
                  label="Discount Codes (Optional)"
                  placeholder="Enter discount code"
                  {...register("discount_codes")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-200"
          >
            Save Draft
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#e37937] hover:bg-[#d06828] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Create Product
          </button>
        </div>
      </div>

      {openImageModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl w-full max-w-md text-slate-800 shadow-xl relative">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Enhance Product Image
              </h2>
              <button
                type="button"
                onClick={() => setOpenImageModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative w-full h-56 sm:h-64 bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
              {selectedImage && (
                <Image
                  src={selectedImage}
                  alt="product-image"
                  fill
                  style={{ objectFit: "contain" }}
                />
              )}
            </div>

            {selectedImage && (
              <div className="mt-4 space-y-3">
                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  AI Enhancements
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {enhancements?.map(({ label, effect }) => (
                    <button
                      key={effect}
                      type="button"
                      className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                        activeEffect === effect
                          ? "bg-[#e37937] text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                      onClick={() => applyTransformation(effect)}
                      disabled={processing}
                    >
                      <Wand size={14} className="shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default Page;