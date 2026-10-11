"use client";

import React from "react";
import Link from "next/link";

interface SidebarItemProps {
  title: string;
  icon: React.ReactNode;
  active: boolean;
  href?: string;
}

export const SidebarItem = ({ title, icon, active, href = "#" }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
        active
          ? "bg-[#0085ff] text-white"
          : "text-white "
      }`}
    >
      <div className="text-xl">{icon}</div>
      <span className="text-sm font-medium">{title}</span>
    </Link>
  );
};

export default SidebarItem;