"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { Inter } from "next/font/google";
import FilterDropdown from "./filterDropdown";
import FilterLabel from "./filterLabel";
import Link from "next/link";
import ActiveFilters from "./activeFilters";

const inter = Inter({
  subsets: ["latin"],
});

export default function FilterSidebar({ searchParams }) {
  // Get an array of all keys in the URL (category, texture, etc.)
  const activeKeys = Object.keys(searchParams || {});

  // Show Reset if there are filters,
  // but maybe NOT if 'page' is the only thing in the URL
  const hasFilters = activeKeys.some((key) => key !== "page" && key !== "sort");

  // PRICE FILTER
  const router = useRouter();
  const currentParams = useSearchParams();

  const [min, setMin] = useState(currentParams.get("minPrice") || "");
  const [max, setMax] = useState(currentParams.get("maxPrice") || "");

  // Sync state when url changes - so reset all clears the price input
  useEffect(() => {
    const urlMin = currentParams.get("minPrice") || "";
    const urlMax = currentParams.get("maxPrice") || "";

    // if url is empty and state isn't, clear state
    if (urlMin !== min) setMin(urlMin);
    if (urlMax !== max) setMax(urlMax);
  }, [currentParams]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(currentParams.toString());

      if (min) params.set("minPrice", min);
      else params.delete("minPrice");

      if (max) params.set("maxPrice", max);
      else params.delete("maxPrice");

      // Push if something changed
      if (params.toString() !== currentParams.toString()) {
        params.delete("page"); // resets pagination when filtering
        router.push(`/shop?${params.toString()}`, { scroll: false });
      }
    }, 600);

    // CleanUp timer is user types again
    return () => clearTimeout(timer);
  }, [min, max, currentParams, router]);

  return (
    <main className={`${inter.className} text-(--textColor) font-medium`}>
      <ul>
        <li className="flex flex-col  border-b border-(--accent) pb-3 text-[14px]">
          <div className="flex gap-1 items-center justify-between">
            <div className="flex gap-1 items-center">
              <Filter className="w-4 h-4" />
              <p>Filter</p>
            </div>

            {hasFilters && (
              <Link
                href="/shop"
                className="text-[12px] underline underline-offset-4"
              >
                Reset all
              </Link>
            )}
          </div>

          <ActiveFilters />
        </li>

        <li>
          <FilterDropdown title="Price">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>₦</span>
                <input
                  type="Number"
                  placeholder="min"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  className="border border-(--textMuted) rounded-sm p-2 w-[50%] placeholder:text-[12px] 
                  focus:outline-(--textMuted)"
                />
                <input
                  type="Number"
                  placeholder="max"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  className="border border-(--textMuted) rounded-sm p-2 w-[50%] placeholder:text-[12px] 
                  focus:outline-(--textMuted)"
                />
              </div>
            </div>
          </FilterDropdown>
        </li>

        <li>
          <FilterDropdown title="Availability">
            <FilterLabel
              content="Show only available items"
              param="hideOutOfStock"
              value="true"
            />
          </FilterDropdown>
        </li>

        <li>
          <FilterDropdown title="Categories">
            <FilterLabel content="Wigs" param="category" value="wigs" />
            <FilterLabel content="Bundles" param="category" value="bundles" />
            <FilterLabel content="Frontals" param="category" value="frontals" />
            <FilterLabel content="Closures" param="category" value="closures" />
          </FilterDropdown>
        </li>

        <li>
          <FilterDropdown title="Wig Type">
            <FilterLabel content="Vietnamese" param="type" value="vietnamese" />
            <FilterLabel content="HD lace" param="type" value="hd-lace" />
            <FilterLabel content="Headband" param="type" value="headband" />
            <FilterLabel content="Bob" param="type" value="bob" />
          </FilterDropdown>
        </li>

        <li>
          <FilterDropdown title="Texture">
            <FilterLabel content="Straight" param="texture" value="straight" />
            <FilterLabel content="Curly" param="texture" value="curly" />
            <FilterLabel content="Wavy" param="texture" value="wavy" />
          </FilterDropdown>
        </li>

        <li>
          <FilterDropdown title="Length">
            <FilterLabel
              content='Short (8 - 14)"'
              param="length"
              value="short"
            />
            <FilterLabel
              content='Medium (16 - 20)"'
              param="length"
              value="medium"
            />
            <FilterLabel content='Long (22+)"' param="length" value="long" />
            {/* <FilterLabel content='14"' param="length" value="14" />
            <FilterLabel content='16"' param="length" value="16" />
            <FilterLabel content='18"' param="length" value="18" />
            <FilterLabel content='20+"' param="length" value="20+" /> */}
          </FilterDropdown>
        </li>
      </ul>
    </main>
  );
}
