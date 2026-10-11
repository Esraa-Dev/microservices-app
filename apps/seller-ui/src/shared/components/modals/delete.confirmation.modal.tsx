
import React from "react";
import { X } from "lucide-react";

interface DeleteConfirmationModalProps {
  product: {
    id: string;
    title: string;
  };
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  product,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">Delete Product</h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close delete confirmation"
            className="text-gray-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <p className="mt-4 text-gray-300">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white">
            {product.title}
          </span>
          ?
          <br />
          This product will be moved to a delete state and permanently
          removed after 24 hours. You can recover it within this time.
        </p>

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

export default DeleteConfirmationModal;
