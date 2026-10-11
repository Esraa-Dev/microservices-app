import { Controller, useFieldArray } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";
import Input from "../input";

const CustomSpecifications = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_specifications",
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">
          Custom Specifications
        </label>
        <span className="text-[10px] text-slate-400 font-medium">
          Add specs like battery, weight
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-end p-3 bg-slate-50/50 border border-slate-200 rounded-xl"
          >
            <div className="flex-1 w-full">
              <Controller
                name={`custom_specifications.${index}.name`}
                control={control}
                rules={{ required: "Specification name is required" }}
                render={({ field }) => (
                  <Input
                    label="Specification Name"
                    placeholder="e.g., Battery Life"
                    {...field}
                  />
                )}
              />
            </div>

            <div className="flex-1 w-full">
              <Controller
                name={`custom_specifications.${index}.value`}
                control={control}
                rules={{ required: "Value is required" }}
                render={({ field }) => (
                  <Input
                    label="Value"
                    placeholder="e.g., 4000mAh"
                    {...field}
                  />
                )}
              />
            </div>

            <button
              type="button"
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 self-end sm:self-center sm:mb-0 mb-2"
              onClick={() => remove(index)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}











        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#e37937]/5 hover:bg-[#e37937]/10 text-[#e37937] border border-dashed border-[#e37937]/30 hover:border-[#e37937]/50 rounded-xl text-sm font-medium transition-all"
          onClick={() => append({ name: "", value: "" })}
        >
          <PlusCircle size={16} />
          Add Specification
        </button>
      </div>

      {errors?.custom_specifications && (
        <p className="text-red-500 text-xs mt-1 font-medium">
          {errors.custom_specifications.message as string}
        </p>
      )}
    </div>
  );
};

export default CustomSpecifications;