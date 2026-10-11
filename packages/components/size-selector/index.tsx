"use client";
import {
  Controller,
  Control,
  FieldErrors,
} from "react-hook-form";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;


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
  images: ({ fileId: string; file_url: string } | null)[];
  custom_properties: Record<string, unknown>;
  custom_specifications: Record<string, unknown>;
}

interface SizeSelectorProps {
  control: Control<FormValues>;
  errors?: FieldErrors<FormValues>;
}

const SizeSelector = ({ control, errors }: SizeSelectorProps) => {
  return (
    <div className="mt-2 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-primary-text">
          Available Sizes
        </label>

        <span className="text-[11px] font-medium text-muted-text">
          Select one or more
        </span>
      </div>

      <Controller
        name="sizes"
        control={control}
        render={({ field }) => {
          const currentValues: string[] = Array.isArray(field.value)
            ? field.value
            : [];

          return (
   <div className="flex w-full flex-wrap items-center gap-2">
  {SIZES.map((size) => {
    const isSelected = currentValues.includes(size);
    return (
      <button
        type="button"
        key={size}
        onClick={() => {
          const updatedSizes = isSelected
            ? currentValues.filter((s) => s !== size)
            : [...currentValues, size];
          field.onChange(updatedSizes);
        }}
        aria-pressed={isSelected}
        className={`
          flex h-10 min-w-[52px] shrink-0 items-center justify-center
          rounded-lg border px-4 text-sm font-semibold
          select-none transition-all duration-200
          focus:outline-none focus-visible:ring-2
          focus-visible:ring-primary/30 focus-visible:ring-offset-2
          active:scale-95

          ${
            isSelected
              ? `
                border-primary
                bg-primary
                text-white
                shadow-sm shadow-primary/20
              `
              : `
                border-border
                bg-background
                text-primary-text
                hover:border-primary
                hover:bg-primary/5
                hover:text-primary
              `
          }
        `}
      >
        {size}
      </button>
    );
  })}
</div>
          );
        }}
      />

      {errors?.sizes && (
        <p className="mt-1 text-xs font-medium text-red-500">
          {errors.sizes.message as string}
        </p>
      )}
    </div>
  );
};

export default SizeSelector;
