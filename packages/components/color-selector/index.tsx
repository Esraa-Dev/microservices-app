import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { Plus, Check } from "lucide-react";
export interface FormValues {
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
interface ColorSelectorProps {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
}

const defaultColors = [
  '#000000',
  '#ffffff',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
];

const ColorSelector = ({ control, errors }: ColorSelectorProps) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState('#ffffff');

  return (
    <div className="mt-2">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Colors
      </label>
      <Controller
        name="colors"
        control={control}
        defaultValue={[]}
        render={({ field }) => {
          const selectedColors: string[] = field.value || [];

          return (
            <div className="flex gap-2 flex-wrap items-center">
              {[...defaultColors, ...customColors].map((color) => {
                const isSelected = selectedColors.includes(color);
                return (
                  <button
                    type="button"
                    key={color}
                    onClick={() => {
                      const updated = isSelected
                        ? selectedColors.filter((c: string) => c !== color)
                        : [...selectedColors, color];
                      field.onChange(updated);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow-sm 
                      ${isSelected ? 'ring-2 ring-offset-2 ring-[#e37937] scale-110' : 'border-slate-200 hover:scale-110 hover:shadow-md'}
                    `}
                    style={{ backgroundColor: color }}
                  >
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}

              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-dashed border-slate-300 hover:border-[#e37937] bg-slate-50 hover:bg-[#e37937]/5 transition-colors"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <Plus size={14} className="text-slate-500" />
              </button>

              {showColorPicker && (
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.currentTarget.value)}
                    className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer rounded-lg overflow-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customColors.includes(newColor)) {
                        setCustomColors([...customColors, newColor]);
                      }
                      if (!selectedColors.includes(newColor)) {
                        field.onChange([...selectedColors, newColor]);
                      }
                      setShowColorPicker(false);
                    }}
                    className="px-3 py-1.5 bg-[#e37937] hover:bg-[#d06828] text-white rounded-md text-xs font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          );
        }}
      />
      {errors?.colors && (
        <p className="text-red-500 text-xs mt-1.5 font-medium">
          {errors.colors.message}
        </p>
      )}
    </div>
  );
};

export default ColorSelector;
