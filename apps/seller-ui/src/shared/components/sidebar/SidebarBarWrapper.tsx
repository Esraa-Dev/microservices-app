"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "../box";
import {
  ListOrdered,
  CreditCard,
  PlusSquare,
  Package,
  CalendarPlus,
  Calendar,
  Mail,
  Settings,
  Bell,
  TicketPercent,
  LogOut,
  X,
} from "lucide-react";
import Image from "next/image";

export const Sidebar = {
  Header: ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
      {children}
    </div>
  ),

  Body: ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col gap-5 py-4 overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-none">
      {children}
    </div>
  ),

  Menu: ({
    title,
    children,
  }: {
    title?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex flex-col gap-0.5">
      {title && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-5 mb-1">
          {title}
        </span>
      )}
      {children}
    </div>
  ),
};

export const SidebarItem = ({
  title,
  icon,
  isActive,
  href,
}: {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  href: string;
}) => {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all duration-200 group ${
        isActive
          ? "text-[#e37937] bg-[#e37937]/8 font-semibold"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#e37937] rounded-r-full" />
      )}

      <div className="flex items-center justify-center w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>

      <span className="truncate">{title}</span>
    </Link>
  );
};

const SidebarBarWrapper = ({ onClose }: { onClose?: () => void }) => {
  const pathName = usePathname();

  const isActive = (route: string) => pathName === route;

  const getIconColor = (route: string) =>
    isActive(route) ? "#e37937" : "#64748b";

  return (
    <Box className="h-full w-full bg-white border-r border-slate-200/80 flex flex-col shadow-sm">
      <Sidebar.Header>
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Esraa Shop"
            width={120}
            height={50}
            priority
            className="object-contain"
          />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </Sidebar.Header>

      <Sidebar.Body>
        <Sidebar.Menu>
          <SidebarItem
            isActive={isActive("/orders")}
            title="Orders"
            href="/orders"
            icon={<ListOrdered size={20} color={getIconColor("/orders")} />}
          />
          <SidebarItem
            isActive={isActive("/payments")}
            title="Payments"
            href="/payments"
            icon={<CreditCard size={20} color={getIconColor("/payments")} />}
          />
        </Sidebar.Menu>

        <Sidebar.Menu title="Products">
          <SidebarItem
            isActive={isActive("/create-product")}
            title="Create Product"
            href="/create-product"
            icon={<PlusSquare size={20} color={getIconColor("/create-product")} />}
          />
          <SidebarItem
            isActive={isActive("/all-products")}
            title="All Products"
            href="/all-products"
            icon={<Package size={20} color={getIconColor("/all-products")} />}
          />
        </Sidebar.Menu>

        <Sidebar.Menu title="Events">
          <SidebarItem
            isActive={isActive("/create-event")}
            title="Create Event"
            href="/create-event"
            icon={<CalendarPlus size={20} color={getIconColor("/create-event")} />}
          />
          <SidebarItem
            isActive={isActive("/all-events")}
            title="All Events"
            href="/all-events"
            icon={<Calendar size={20} color={getIconColor("/all-events")} />}
          />
        </Sidebar.Menu>

        <Sidebar.Menu title="Controllers">
          <SidebarItem
            isActive={isActive("/inbox")}
            title="Inbox"
            href="/inbox"
            icon={<Mail size={20} color={getIconColor("/inbox")} />}
          />
          <SidebarItem
            isActive={isActive("/settings")}
            title="Settings"
            href="/settings"
            icon={<Settings size={20} color={getIconColor("/settings")} />}
          />
          <SidebarItem
            isActive={isActive("/notifications")}
            title="Notifications"
            href="/notifications"
            icon={<Bell size={20} color={getIconColor("/notifications")} />}
          />
        </Sidebar.Menu>

        <Sidebar.Menu title="Extras">
          <SidebarItem
            isActive={isActive("/discount-codes")}
            title="Discount Codes"
            href="/discount-codes"
            icon={<TicketPercent size={20} color={getIconColor("/discount-codes")} />}
          />
          <SidebarItem
            isActive={false}
            title="Logout"
            href="/login"
            icon={<LogOut size={20} color="#ef4444" />}
          />
        </Sidebar.Menu>
      </Sidebar.Body>
    </Box>
  );
};

export default SidebarBarWrapper;