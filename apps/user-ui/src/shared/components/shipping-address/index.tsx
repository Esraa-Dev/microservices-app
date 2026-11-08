
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Plus, Trash2, X } from "lucide-react";
import authAxiosInstance from "@/utils/authAxiosInstance";

const addressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]),
  street: z.string().trim().min(3, "Street address is required"),
  city: z.string().trim().min(2, "City is required"),
  zip: z.string().trim().min(2, "ZIP code is required"),
  country: z.string().trim().min(2, "Country is required"),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

type Address = {
  id: string;
  userId: string;
  label: "Home" | "Work" | "Other";
  street: string;
  zip: string;
  city: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type AddressesResponse = {
  success: boolean;
  addresses: Address[];
};

const ShippingAddress = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "Home",
      street: "",
      city: "",
      zip: "",
      country: "",
      isDefault: false,
    },
  });

  const {
    data,
    isLoading,
    isError,
  } = useQuery<AddressesResponse>({
    queryKey: ["user-addresses"],
    queryFn: async () => {
      const response = await authAxiosInstance.get("/get-addresses");
      return response.data;
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (addressData: AddressFormValues) => {
      const response = await authAxiosInstance.post(
        "/add-address",
        addressData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-addresses"],
      });
      closeModal();
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await authAxiosInstance.delete(
        `/delete-address/${addressId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-addresses"],
      });
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = (formData: AddressFormValues) => {
    addAddressMutation.mutate(formData);
  };

  const addresses = data?.addresses ?? [];

  return (
    <>
      <div className="space-y-6 rounded-xl border border-border bg-background p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <h3 className="font-semibold text-primary-text">
            Saved Addresses
          </h3>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary cursor-pointer px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            <Plus className="size-4" />
            Add New Address
          </button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-secondary-text">
            Loading addresses...
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-sm text-red-500">
            Failed to load addresses. Please try again.
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MapPin className="mb-3 size-10 text-secondary-text" />
            <h4 className="font-semibold text-primary-text">
              No saved addresses
            </h4>
            <p className="mt-1 text-sm text-secondary-text">
              Add your first shipping address to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="size-5" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-primary-text">
                        {address.label}
                      </h4>

                      {address.isDefault && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-sm leading-6 text-secondary-text">
                      {[
                        address.street,
                        address.city,
                        address.zip,
                        address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end">
                  <button
                    type="button"
                    onClick={() => deleteAddressMutation.mutate(address.id)}
                    disabled={deleteAddressMutation.isPending}
                    aria-label="Delete address"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium cursor-pointer text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteAddressMutation.isError && (
          <p className="text-sm text-red-500">
            Failed to delete address. Please try again.
          </p>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  id="address-modal-title"
                  className="text-lg font-semibold text-primary-text"
                >
                  Add New Address
                </h2>
                <p className="mt-1 text-sm text-secondary-text">
                  Enter your shipping address details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="rounded-lg p-2 text-secondary-text transition-colors hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="label"
                  className="mb-2 block text-sm font-medium text-primary-text"
                >
                  Address Type
                </label>
                <select
                  id="label"
                  {...register("label")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-primary-text outline-none focus:border-primary"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
                {errors.label && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.label.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="street"
                  className="mb-2 block text-sm font-medium text-primary-text"
                >
                  Street Address
                </label>
                <input
                  id="street"
                  {...register("street")}
                  placeholder="Enter street address"
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-primary-text outline-none placeholder:text-secondary-text focus:border-primary"
                />
                {errors.street && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.street.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-medium text-primary-text"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    {...register("city")}
                    placeholder="Enter city"
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-primary-text outline-none placeholder:text-secondary-text focus:border-primary"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="zip"
                    className="mb-2 block text-sm font-medium text-primary-text"
                  >
                    ZIP Code
                  </label>
                  <input
                    id="zip"
                    {...register("zip")}
                    placeholder="Enter ZIP code"
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-primary-text outline-none placeholder:text-secondary-text focus:border-primary"
                  />
                  {errors.zip && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.zip.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="mb-2 block text-sm font-medium text-primary-text"
                >
                  Country
                </label>
                <input
                  id="country"
                  {...register("country")}
                  placeholder="Enter country"
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-primary-text outline-none placeholder:text-secondary-text focus:border-primary"
                />
                {errors.country && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-primary-text">
                <input
                  type="checkbox"
                  {...register("isDefault")}
                  className="size-4 accent-primary"
                />
                Set as default address
              </label>

              {addAddressMutation.isError && (
                <p className="text-sm text-red-500">
                  Failed to add address. Please try again.
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={addAddressMutation.isPending}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-primary-text transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addAddressMutation.isPending}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium cursor-pointer text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addAddressMutation.isPending
                    ? "Saving..."
                    : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ShippingAddress;
