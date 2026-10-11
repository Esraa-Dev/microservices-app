
import React from "react";
import { X } from "lucide-react";

interface Discount {
  id: string;
  public_name: string;
}

interface DeleteDiscountCodeModalProps {
  discount: Discount;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteDiscountCodeModal: React.FC<
  DeleteDiscountCodeModalProps
> = ({ discount, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-[450px] rounded-lg bg-gray-800 p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">
            Delete Discount Code
          </h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Warning Message */}
        <p className="mt-4 text-gray-300">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white">
            {discount.public_name}
          </span>
          ?
          <br />
          This action <strong>cannot be undone.</strong>
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDiscountCodeModal;
