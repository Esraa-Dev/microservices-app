"use client";

import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";

type SearchBarProps = {
  mobile?: boolean;
};

export default function SearchBar({
  mobile = false,
}: SearchBarProps) {
  const [value, setValue] = useState("");

  if (mobile) {
    return (
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="flex h-11 w-full items-center overflow-hidden rounded-xl border border-white/20 bg-white shadow-sm transition focus-within:ring-2 focus-within:ring-white/40"
      >
        <Search className="ml-3 h-5 w-5 shrink-0 text-gray-400" />

        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products, brands..."
          aria-label="Search products"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-primary-text outline-none placeholder:text-gray-400"
        />

        <button
          type="submit"
          aria-label="Search"
          className="flex h-full w-12 shrink-0 cursor-pointer items-center justify-center bg-primary text-white transition hover:opacity-90"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>
    );
  }

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="group hidden h-12 w-full max-w-xl flex-1 items-center overflow-hidden rounded-full border border-[#e5e5e5] bg-[#fffaf6] shadow-sm transition-all duration-200 hover:border-[#d1d1d1] focus-within:border-[#e37937] focus-within:ring-2 focus-within:ring-[#e37937]/15 lg:flex"
    >
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products, brands..."
        aria-label="Search products"
        className="h-full min-w-0 flex-1 bg-transparent px-5 text-sm text-[#1d1d1d] outline-none placeholder:text-[#9a9a9a]"
      />

      <button
        type="button"
        className="flex h-full shrink-0 cursor-pointer items-center gap-2 px-4 text-sm font-medium text-[#666666] transition-colors duration-200 hover:text-[#e37937]"
      >
        <span>All Categories</span>
        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
      </button>

      <span
        aria-hidden="true"
        className="h-6 w-px shrink-0 bg-[#e5e5e5]"
      />

      <button
        type="submit"
        aria-label="Search products"
        className="flex h-full w-14 shrink-0 cursor-pointer items-center justify-center bg-[#e37937] text-white transition-colors duration-200 hover:bg-[#cf682b] active:bg-[#b85b25]"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}