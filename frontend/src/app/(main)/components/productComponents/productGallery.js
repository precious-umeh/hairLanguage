"use client";

import { useState } from "react";
import { assetUrl } from "../../utils/axiosClient";

export default function ProductGallery({ images, productName }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-6">
      {/* Main Image */}
      <div className={`relative w-full aspect-5/7 rounded-lg overflow-hidden`}>
        <img
          src={assetUrl(selectedImage)}
          alt={productName}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {images.map((img, index) => {
          return (
            <button
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`relative shrink-0 w-[12vw] h-[12vw] [@media(min-width:700px)]:w-[7vw] [@media(min-width:700px)]:h-[7vw] 
                rounded-md overflow-hidden hover:border ${
                  selectedImage === img ? "border-2 border-(--accent)" : ""
                }`}
            >
              <div className={`w-full h-full rounded-md`}>
                <img
                  src={assetUrl(img)}
                  alt="thumbnail"
                  className="object-cover"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
