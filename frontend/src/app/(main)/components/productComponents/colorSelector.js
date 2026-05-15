"use client";

import { useState } from "react";

export default function ColorSelector({
  colors,
  selectedColor,
  setSelectedColor,
}) {
  const [hoveredColor, setHoveredColor] = useState(null);

  if (!colors || colors.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold">Color</p>

      <div className="flex items-center gap-3">
        {colors.map((colorObj, index) => {
          // Fallback values if the object is missing data
          const colorId = colorObj._id || `color${index}`;
          const colorName = colorObj.name || "Unknown";
          // const colorHex = colorObj.colorCode || "#000000";
          const colorHex = colorObj.hex || "#000000";

          return (
            <div
              key={colorId}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredColor(colorName)}
              onMouseLeave={() => setHoveredColor(null)}
            >
              {/* Hover Label */}
              {hoveredColor === colorName && (
                <span className="absolute -top-6 text-xs bg-black text-white px-2 py-1 rounded ">
                  {colorName}
                </span>
              )}

              {/* Color Circle */}
              <button
                // onClick={() => setSelectedColor(colorId)}
                onClick={() => setSelectedColor(colorObj)}
                className={`w-6 h-6 rounded-full  transition-all duration-200 ${
                  selectedColor?._id === colorId
                    ? "ring ring-offset-2 ring-black scale-110"
                    : "border border-black/10"
                }`}
                style={{ backgroundColor: colorHex }}
              ></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
