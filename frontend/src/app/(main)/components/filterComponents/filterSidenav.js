"use client";

import { useState, useEffect } from "react";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import FilterSidebar from "./filterSidebar";

export default function FilterSideNav({ searchParams, filteredProductsCount }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Handle Sort changes
  const handleSort = (value) => {
    const params = new URLSearchParams(window.location.search);
    params.set("sort", value);
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const currentSort = searchParams.sort || "featured";

  const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Price, Low to High", value: "low-high" },
    { label: "Price, High to Low", value: "high-low" },
    { label: "Alphabetically, A-Z", value: "a-z" },
    { label: "Alphabetically, Z-A", value: "z-a" },
    { label: "Newest", value: "new-old" },
    { label: "Oldest", value: "old-new" },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [currentSort]);

  return (
    <section>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <SlidersHorizontal className="w-4 h-4 text-(--textColor)" />
        <span className="uppercase">Filter and Sort</span>
      </button>

      <div
        className={`fixed top-19 inset-0 z-20 transition-visiblity duration-300 ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        <div
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute left-0 top-0 h-full w-[75vw] bg-white text-(--textColor) max-w-sm shadow-xl 
              flex flex-col transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-(--accent)">
              <h2 className="font-semibold uppercase tracking-wider">
                Filter and Sort
              </h2>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/*  SCROLLABLE CONTENT  */}
            <section className="overflow-y-auto flex-1 p-5 space-y-8">
              <div className="space-y-4">
                <h3 className="font-bold uppercase tracking-widest">Sort By</h3>
                <div className="grid grid-cols-1 gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSort(option.value)}
                      className={`flex items-center justify-between p-3 rounded-md text-left transition-colors ${
                        currentSort === option.value
                          ? "bg-(--accent) text-white"
                          : "bg-(--softAsh)"
                      }`}
                    >
                      <span>{option.label}</span>
                      {currentSort === option.value && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-(--accent)" />

              <div className="space-y-4 pb-10">
                <h3 className="font-bold uppercase tracking-widest">
                  Filter By
                </h3>
                <FilterSidebar searchParams={searchParams} />
              </div>
            </section>

            {/*  STICKY FOOTER - APPLY BUTTON */}
            <div className="p-4 border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] bg-white">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-(--accent) text-white py-4 rounded-lg font-bold uppercase 
                tracking-widest text-[12px] hover:opacity-90 transition-opacity"
              >
                View {filteredProductsCount}{" "}
                {filteredProductsCount === 1 ? "Result" : "Results"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
