"use client";

import { ChevronDown } from "lucide-react";
import { Inter } from "next/font/google";
import { useState } from "react";

const inter = Inter({
  subsets: ["latin"],
});

export default function FilterDropdown({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <section
      className={`${inter.className} font-medium text-(--textColor) text-[14px] border-b border-(--accent)`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 cursor-pointer hover:underline underline-offset-4"
      >
        <span>{title}</span>

        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${open ? "-rotate-180" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden text-[13px]">
          <div className="pb-4 space-y-4 text-(--textMuted)">{children}</div>
        </div>
      </div>
    </section>
  );
}
