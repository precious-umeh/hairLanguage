"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "featured";

  const handleSort = (e) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    // Reset to page 1 when sorting changes to avoid empty pages
    params.set("page", 1);
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };
  return (
    <div className="hidden md:block cursor-pointer space-x-1">
      <label htmlFor="sort">Sort by:</label>
      <select
        id="sort"
        value={currentSort}
        onChange={handleSort}
        className="w-35 p-1 border border-(--accent) outline-none cursor-pointer"
      >
        <option value="featured">Featured</option>
        <option value="best-selling">Best Selling</option>
        <option value="a-z">Alphabetically, A-Z</option>
        <option value="z-a">Alphabetically, Z-A</option>
        <option value="low-high">Price, Low to High</option>
        <option value="high-low">Price, High to Low</option>
        <option value="old-new">Date, Old to New</option>
        <option value="new-old">Date, New to Old</option>
      </select>
    </div>
  );
}
