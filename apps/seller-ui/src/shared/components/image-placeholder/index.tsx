"use client";

import { Pencil, WandSparkles, X, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const ImagePlaceholder = ({
  size,
  small,
  onImageChange,
  onRemove,
  index = null,
  setOpenImageModal,
  setSelectedImage,
  pictureUploadingLoader,
}: {
  size: string;
  small?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  index?: any;
  setOpenImageModal: (openImageModal: boolean) => void;
  setSelectedImage: (image: string) => void;
  pictureUploadingLoader: boolean;
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageChange(file, index);
    }
  };

  return (
    <div
      className={`relative ${
        small ? "h-35 sm:h-45" : "h-75 sm:h-100 lg:h-112.5"
      } w-full cursor-pointer bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col justify-center items-center overflow-hidden group hover:border-[#e37937]/50 transition-colors`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />

      {pictureUploadingLoader && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <Loader2 size={24} className="animate-spin text-[#e37937]" />
        </div>
      )}

      {imagePreview ? (
        <>
          <Image
            src={imagePreview}
            alt="Preview"
            width={400}
            height={300}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(index!);
              }}
              className="p-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 text-white shadow-sm backdrop-blur-sm transition-colors"
            >
              <X size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenImageModal(true);
                setSelectedImage(imagePreview!);
              }}
              className="p-1.5 rounded-lg bg-[#e37937]/90 hover:bg-[#e37937] text-white shadow-sm backdrop-blur-sm transition-colors"
            >
              <WandSparkles size={14} />
            </button>
          </div>
        </>
      ) : (
        <label
          htmlFor={`image-upload-${index}`}
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-4"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#e37937]/10 flex items-center justify-center mb-3 transition-colors">
            <Pencil size={18} className="text-slate-400 group-hover:text-[#e37937] transition-colors" />
          </div>
          <p className={`text-slate-500 ${small ? "text-xs" : "text-sm"} font-medium`}>
            {size}
          </p>
          <p className={`text-slate-400 ${small ? "text-[10px]" : "text-xs"} pt-1 text-center max-w-45`}>
            Click to upload image
          </p>
        </label>
      )}
    </div>
  );
};

export default ImagePlaceholder;