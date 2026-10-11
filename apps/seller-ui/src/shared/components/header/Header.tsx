"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, User, Menu } from "lucide-react";

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case "/orders":
      return "Orders Overview";
    case "/payments":
      return "Payments & Payouts";
    case "/create-product":
      return "Add New Product";
    case "/all-products":
      return "Products Inventory";
    case "/create-event":
      return "Create Event";
    case "/all-events":
      return "Events Management";
    case "/inbox":
      return "Messages & Inbox";
    case "/settings":
      return "Store Settings";
    case "/notifications":
      return "Notifications";
    case "/discount-codes":
      return "Discount Codes";
    default:
      return "Dashboard";
  }
};

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight truncate">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:flex items-center w-56 lg:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-none focus:border-[#e37937] focus:bg-white focus:ring-1 focus:ring-[#e37937]/20 transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>

        <button
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#e37937] rounded-full ring-2 ring-white" />
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-[#e37937]/10 text-[#e37937] flex items-center justify-center font-bold text-xs group-hover:bg-[#e37937]/20 transition-all">
            <User size={16} />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-slate-700 group-hover:text-[#e37937] transition-colors leading-tight">
              Seller Account
            </span>
            <span className="text-[10px] text-slate-400">Store Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}