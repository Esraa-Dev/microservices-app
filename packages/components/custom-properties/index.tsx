import React, { useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import Input from '../input';
import { PlusCircle, X } from 'lucide-react';

const CustomProperties = ({ control, errors }: any) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'customProperties',
  });

  const customPropertiesValues = useWatch({
    control,
    name: 'customProperties',
  });

  const [newLabel, setNewLabel] = useState('');
  const [newValueMap, setNewValueMap] = useState<{ [key: number]: string }>({});

  const addProperty = () => {
    if (!newLabel.trim()) return;
    append({ label: newLabel, values: [] });
    setNewLabel('');
  };

  const addValue = (index: number) => {
    const val = newValueMap[index];
    if (!val || !val.trim()) return;
    const currentProp = customPropertiesValues?.[index] || fields[index];
    update(index, {
      ...currentProp,
      values: [...(currentProp.values || []), val.trim()],
    });
    setNewValueMap((prev) => ({ ...prev, [index]: '' }));
  };

  const removeValue = (propIndex: number, valIndex: number) => {
    const currentProp =
      customPropertiesValues?.[propIndex] || fields[propIndex];
    update(propIndex, {
      ...currentProp,
      values: currentProp.values.filter(
        (_: string, i: number) => i !== valIndex,
      ),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="block text-sm font-semibold text-primary-text mb-2">
        Custom Properties
      </label>
      <div className="flex flex-col gap-3">
        {fields.map((field, index) => {
          const currentValues = customPropertiesValues?.[index]?.values || [];
          return (
            <div
              key={field.id}
              className="border border-slate-200 bg-slate-50/50 p-3.5 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-800 font-semibold text-sm">
                  {customPropertiesValues?.[index]?.label}
                </span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {currentValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {currentValues.map((value: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      {value}
                      <button
                        type="button"
                        onClick={() => removeValue(index, i)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter value..."
                  value={newValueMap[index] || ''}
                  onChange={(e) =>
                    setNewValueMap({ ...newValueMap, [index]: e.target.value })
                  }
                  className="flex-1 bg-white border border-slate-300 p-2 rounded-lg text-slate-800 placeholder-slate-400 text-xs outline-none focus:border-[#e37937]"
                />
                <button
                  type="button"
                  className="px-3 py-1.5 !bg-slate-800 text-red-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
                  onClick={() => addValue(index)}
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex gap-2">
          <Input
            placeholder="Property label (e.g., Material)"
            value={newLabel}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewLabel(e.target.value)
            }
          />
          <button
            type="button"
            className="px-4 py-2.5 bg-[#e37937] hover:bg-[#d06828] text-white font-medium rounded-lg flex items-center gap-1.5 transition-colors text-xs shrink-0"
            onClick={addProperty}
          >
            <PlusCircle size={16} /> Add Property
          </button>
        </div>
      </div>

      {errors?.customProperties && (
        <p className="text-red-500 text-xs mt-1 font-medium">
          {errors.customProperties.message as string}
        </p>
      )}
    </div>
  );
};

export default CustomProperties;
