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
  const [open, setOpen] = useState(false);

  if (mobile) {
    return (
      <div className="relative lg:hidden">
        <button
          type="button"
          aria-label="Open search"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center justify-center"
        >
          <Search className="h-5 w-5 text-white" />
        </button>

        {open && (
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="absolute right-0 top-9 z-40 flex h-11 w-[260px] overflow-hidden rounded-full border border-black bg-white shadow-lg"
          >
            <input
              type="search"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search..."
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-primary-text outline-none"
            />

            <button
              type="submit"
              aria-label="Search"
              className="flex w-12 items-center justify-center bg-primary text-white"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="hidden h-12 w-full max-w-xl flex-1 overflow-hidden rounded-full border border-black lg:flex"
    >
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search..."
        aria-label="Search products"
        className="flex-1 bg-transparent px-5 text-sm text-primary-text outline-none placeholder:text-muted-text"
      />

      <button
        type="button"
        className="hidden items-center gap-2 px-4 text-sm text-secondary-text md:flex"
      >
        All Categories
        <ChevronDown className="h-4 w-4" />
      </button>

      <span className="my-2 hidden w-px bg-border md:block" />

      <button
        type="submit"
        aria-label="Search"
        className="flex w-14 items-center justify-center bg-primary text-white"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}
