"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

export default function ActiveFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get all keys except 'page' and 'sort' which aren't really "filters"
  const filterKeys = Array.from(searchParams.keys()).filter(
    (key) => key !== "page" && key !== "sort",
  );

  if (filterKeys.length === 0) return null;

  const removeFilter = (key, value = null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      // For multi-value filters like Length
      const currentValues = params.getAll(key);
      const updatedValues = currentValues.filter((v) => v !== value);
      params.delete(key);
      updatedValues.forEach((v) => params.append(key, v));
    } else {
      // For single-value filters like Category or Price
      params.delete(key);
    }

    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {filterKeys.map((key) => {
        const values = searchParams.getAll(key);

        return values.map((val) => (
          <div
            key={`${key}-${val}`}
            className="flex items-center gap-1 bg-(--accent)/10 text-(--accent) px-2 py-1 rounded-full text-[11px] 
            border border-(--accent)/20"
          >
            <span className="capitalize font-medium">
              {/* Format the label: minPrice -> Min Price */}
              {key.replace(/([A-Z])/g, " $1")}:
            </span>
            <span>
              {val}
              {key.toLowerCase().includes("price") ? " ₦" : ""}
            </span>

            <button
              onClick={() => removeFilter(key, val)}
              className="hover:bg-(--accent) hover:text-white rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ));
      })}
    </div>
  );
}
