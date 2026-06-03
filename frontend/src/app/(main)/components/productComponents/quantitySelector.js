"use client";

import { Minus, Plus } from "lucide-react";

/**
 * @param {number} count - The current value
 * @param {function} onChange - A single callback that returns the new value
 * @param {string} variant - 'default' (Product Page) or 'compact' (Cart)
 */

export default function QuantitySelector({
  count,
  onChange,
  variant = "default",
  max = Infinity,
}) {
  const isCompact = variant === "compact";

  const handleUpdate = (newValue) => {
    // Determine minimum allowed (Cart can go to 0 for removal, Product page stays at 1)
    const min = isCompact ? 0 : 1;
    let finalValue = Math.max(min, newValue);
    finalValue = Math.min(finalValue, max);

    if (onChange) {
      onChange(finalValue);
    }
  };

  // UI styling based on variant
  const containerClasses = isCompact
    ? "flex items-center justify-between p-1.5 border border-(--accent)/20 rounded-md w-24"
    : "flex items-center justify-between p-2 border-2 border-(--accent)/20 rounded-lg w-32";

  const iconSize = isCompact ? "w-3.5 h-3.5" : "w-4 h-4";
  const textClasses = isCompact
    ? "text-xs font-medium"
    : "text-sm font-semibold";

  return (
    <div className="flex flex-col gap-2">
      {/* Only show "Quantity" label on Product Pages */}
      {!isCompact && <p className="text-sm font-semibold">Quantity</p>}

      <div className={containerClasses}>
        <button
          type="button"
          onClick={() => handleUpdate(count - 1)}
          className="hover:text-(--accent) transition-colors"
        >
          <Minus className={iconSize} />
        </button>

        <p className={`${textClasses} tabular-nums text-center`}>{count}</p>

        <button
          type="button"
          onClick={() => handleUpdate(count + 1)}
          disabled={count >= max}
          className={`transition-colors ${
            count >= max
              ? "opacity-30 cursor-not-allowed"
              : "hover:text-(--accent)"
          }`}
        >
          <Plus className={iconSize} />
        </button>
      </div>
    </div>
  );
}
