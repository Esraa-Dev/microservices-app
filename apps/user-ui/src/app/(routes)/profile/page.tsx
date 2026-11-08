
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import authAxiosInstance from "@/utils/authAxiosInstance";
import { useUser } from "@/hooks/useUser";
import StatsCard from "@/shared/components/cards/stat.card";
import QuickActionCard from "@/shared/components/cards/quick.action.card";
import ShippingAddress from "@/shared/components/shipping-address";

import {
  Clock,  
  CheckCircle,
  UserRound,
  ShoppingBag,
  Inbox,
  Bell,
  MapPin,
  Lock,
  LogOut,
  Camera,
  Gift,
  Award,
  Settings,
  CreditCard,
  Headset,
  LucideIcon,
  Eye,
  EyeOff,
} from "lucide-react";

const profileNavItems = [
  { label: "Profile", icon: UserRound },
  { label: "My Orders", icon: ShoppingBag },
  { label: "Inbox", icon: Inbox },
  { label: "Notifications", icon: Bell },
  { label: "Shipping Address", icon: MapPin },
  { label: "Change Password", icon: Lock },
  { label: "Log Out", icon: LogOut },
];

const orderStats = [
  { title: "Total Orders", count: 24, icon: ShoppingBag },
  { title: "Processing Orders", count: 8, icon: Clock },
  { title: "Completed Orders", count: 16, icon: CheckCircle },
];

const quickActions = [
  {
    title: "Referral Program",
    description: "Invite friends and earn exciting rewards.",
    icon: Gift,
  },
  {
    title: "Your Badge",
    description: "View your achievements and account rewards.",
    icon: Award,
  },
  {
    title: "Account Settings",
    description: "Manage your account details and security.",
    icon: Settings,
  },
  {
    title: "Billing History",
    description: "Check your recent payments and transactions.",
    icon: CreditCard,
  },
  {
    title: "Support Center",
    description: "Get help and contact our support team.",
    icon: Headset,
  },
];

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const Page = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("Profile");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const response = await authAxiosInstance.patch(
        "/update-user-password",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      reset();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await authAxiosInstance.post("/logout");
      return response.data;
    },
    onSuccess: async() => {
       await queryClient.invalidateQueries({
        queryKey: ["user"],
      })
            router.replace("/login");
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <section className="page-container py-10 text-center">
        Loading profile...
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-container py-10 text-center">
        Please log in to view your profile.
      </section>
    );
  }

  return (
    <section className="page-container space-y-8 py-8 sm:py-10">
      <h2 className="text-center text-2xl font-semibold text-primary-text">
        Welcome back, {user.name}! 👋
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orderStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_4fr_2fr]">
        <aside className="h-fit rounded-xl border border-border bg-background p-4">
          <nav className="space-y-2">
            {profileNavItems.map((item) => (
              <ProfileNavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.label}
                disabled={
                  item.label === "Log Out" && logoutMutation.isPending
                }
                onClick={() => {
                  if (item.label === "Log Out") {
                    logoutMutation.mutate();
                  } else {
                    setActiveTab(item.label);
                  }
                }}
              />
            ))}
          </nav>

          {logoutMutation.isError && (
            <p className="mt-3 text-xs text-red-500">
              Logout failed. Please try again.
            </p>
          )}
        </aside>

        <div className="min-w-0">
          {activeTab === "Profile" && (
            <div className="h-fit rounded-xl border border-border bg-background p-6">
              <h3 className="mb-6 text-lg font-semibold text-primary-text">
                Profile Information
              </h3>

              <div className="flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="flex size-28 items-center justify-center overflow-hidden rounded-full bg-surface">
                    {avatarPreview || user.avatar ? (
                      <img
                        src={avatarPreview || user.avatar}
                        alt={user.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <UserRound className="size-14 text-secondary-text" />
                    )}
                  </div>

                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white"
                  >
                    <Camera className="size-4" />
                  </label>

                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="w-full space-y-4 text-center">
                  <div>
                    <h2 className="text-xl font-semibold text-primary-text">
                      {user.name}
                    </h2>
                    <p className="mt-1 text-sm text-secondary-text">
                      {user.email}
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-border pt-4 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-secondary-text">Member Since</span>
                      <span className="font-medium text-primary-text">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-secondary-text">Earned Points</span>
                      <span className="flex items-center gap-1 font-medium text-primary">
                        <Gift className="size-4" />
                        0 Points
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "My Orders" && <div>My Orders Content</div>}

          {activeTab === "Inbox" && <div>Inbox Content</div>}

          {activeTab === "Notifications" && <div>Notifications Content</div>}

          {activeTab === "Shipping Address" && <ShippingAddress />}

          {activeTab === "Change Password" && (
            <div className="rounded-xl border border-border bg-background p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary-text">
                  Change Password
                </h3>
                <p className="mt-1 text-sm text-secondary-text">
                  Update your password to keep your account secure.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onPasswordSubmit)}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-medium text-primary-text"
                  >
                    Current Password
                  </label>

                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      {...register("currentPassword")}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-11 text-sm text-primary-text outline-none transition-colors placeholder:text-secondary-text focus:border-primary"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword((prev) => !prev)
                      }
                     className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-secondary-text"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>

                  {errors.currentPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-primary-text"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      {...register("newPassword")}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-11 text-sm text-primary-text outline-none transition-colors placeholder:text-secondary-text focus:border-primary"
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                     className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-secondary-text"
                      aria-label="Toggle new password visibility"
                    >
                      {showNewPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>

                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-primary-text"
                  >
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      {...register("confirmPassword")}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-11 text-sm text-primary-text outline-none transition-colors placeholder:text-secondary-text focus:border-primary"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                     className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-secondary-text"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {updatePasswordMutation.isSuccess && (
                  <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    Password updated successfully.
                  </p>
                )}

                {updatePasswordMutation.isError && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {(
                      updatePasswordMutation.error as {
                        response?: { data?: { message?: string } };
                      }
                    )?.response?.data?.message ||
                      "Failed to update password. Please try again."}
                  </p>
                )}

                <div className="flex justify-end border-t border-border pt-5">
                  <button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm cursor-pointer font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updatePasswordMutation.isPending
                      ? "Updating..."
                      : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => (
              <QuickActionCard key={action.title} {...action} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;

const ProfileNavItem = ({
  icon: Icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "bg-primary/10 text-primary"
          : label === "Log Out"
            ? "text-red-500 hover:bg-red-50"
            : "text-secondary-text hover:bg-surface hover:text-primary-text"
      }`}
    >
      <Icon className="size-5 shrink-0" />
      <span>
        {label === "Log Out" && disabled ? "Logging out..." : label}
      </span>
    </button>
  );
};
